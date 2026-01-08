import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createDeliverableSchema = z.object({
    projectId: z.string().uuid(),
    fileUrl: z.string().url(), // S3 URL
    notes: z.string().optional(),
});

const approvalSchema = z.object({
    action: z.enum(['APPROVE', 'REQUEST_CHANGES']),
    comments: z.string().optional(),
});

export async function deliverableRoutes(server: FastifyInstance) {
    // Freelancer uploads deliverable
    server.post('/deliverables', { preHandler: [authenticate] }, async (request, reply) => {
        const result = createDeliverableSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: result.error });

        const { projectId, fileUrl, notes } = result.data;
        const userId = (request as any).user.id;

        // Verify ownership
        const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) return reply.code(404).send({ error: 'Project not found' });

        // Get next version number
        const lastDeliverable = await prisma.deliverable.findFirst({
            where: { projectId },
            orderBy: { version: 'desc' },
        });
        const version = (lastDeliverable?.version || 0) + 1;

        const deliverable = await prisma.deliverable.create({
            data: {
                projectId,
                version,
                fileUrl,
                notes,
            },
        });

        return deliverable;
    });

    // Client view (public access via token?) 
    // For simplicity, we assume client accesses via a special route using 'clientAccessParam' of the project?
    // Or just a project-level token logic. 
    // Let's implement a route that resolves project by clientAccessParam.

    server.get('/client/access/:token', async (request, reply) => {
        const { token } = request.params as { token: string };
        const project = await prisma.project.findUnique({
            where: { clientAccessParam: token },
            include: {
                scopes: true,
                deliverables: {
                    include: { approvals: true },
                    orderBy: { version: 'desc' }
                }
            }
        });

        if (!project) return reply.code(404).send({ error: 'Invalid access link' });
        return project;
    });

    // Client Approval Action
    server.post('/client/deliverables/:id/approve', async (request, reply) => {
        const { id } = request.params as { id: string };
        // In real app, we should validate the client token in header or body as well for security
        // Here simplified: check if deliverable exists

        // We expect the client access token in headers or query?
        // Let's assume passed in body for simplicity or header 'X-Client-Token'
        const clientToken = request.headers['x-client-token'] as string;
        if (!clientToken) return reply.code(401).send({ error: 'Missing client token' });

        const deliverable = await prisma.deliverable.findUnique({
            where: { id },
            include: { project: true }
        });
        if (!deliverable || deliverable.project.clientAccessParam !== clientToken) {
            return reply.code(403).send({ error: 'Unauthorized' });
        }

        const result = approvalSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: result.error });
        const { action, comments } = result.data;

        // Create Audit Log
        const approval = await prisma.approvalAuditLog.create({
            data: {
                deliverableId: id,
                action,
                comments,
                performedBy: 'CLIENT',
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'] || 'Unknown'
            }
        });

        // If approved, trigger invoice logic (stub)
        // If approved, trigger invoice logic
        if (action === 'APPROVE') {
            // Fetch the active scope amount
            const latestScope = await prisma.scope.findFirst({
                where: { projectId: deliverable.projectId },
                orderBy: { version: 'desc' }
            });

            await prisma.invoice.create({
                data: {
                    projectId: deliverable.projectId,
                    amount: latestScope ? latestScope.price : 0,
                    status: 'DRAFT',
                }
            });
        }

        return approval;
    });
}
