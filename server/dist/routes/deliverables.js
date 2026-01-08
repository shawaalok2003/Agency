"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverableRoutes = deliverableRoutes;
const zod_1 = require("zod");
const index_1 = require("../index");
const auth_1 = require("../utils/auth");
const createDeliverableSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid(),
    fileUrl: zod_1.z.string().url(), // S3 URL
    notes: zod_1.z.string().optional(),
});
const approvalSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REQUEST_CHANGES']),
    comments: zod_1.z.string().optional(),
});
async function deliverableRoutes(server) {
    // Freelancer uploads deliverable
    server.post('/deliverables', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const result = createDeliverableSchema.safeParse(request.body);
        if (!result.success)
            return reply.code(400).send({ error: result.error });
        const { projectId, fileUrl, notes } = result.data;
        const userId = request.user.id;
        // Verify ownership
        const project = await index_1.prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project)
            return reply.code(404).send({ error: 'Project not found' });
        // Get next version number
        const lastDeliverable = await index_1.prisma.deliverable.findFirst({
            where: { projectId },
            orderBy: { version: 'desc' },
        });
        const version = (lastDeliverable?.version || 0) + 1;
        const deliverable = await index_1.prisma.deliverable.create({
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
        const { token } = request.params;
        const project = await index_1.prisma.project.findUnique({
            where: { clientAccessParam: token },
            include: {
                scopes: true,
                deliverables: {
                    include: { approvals: true },
                    orderBy: { version: 'desc' }
                }
            }
        });
        if (!project)
            return reply.code(404).send({ error: 'Invalid access link' });
        return project;
    });
    // Client Approval Action
    server.post('/client/deliverables/:id/approve', async (request, reply) => {
        const { id } = request.params;
        // In real app, we should validate the client token in header or body as well for security
        // Here simplified: check if deliverable exists
        // We expect the client access token in headers or query?
        // Let's assume passed in body for simplicity or header 'X-Client-Token'
        const clientToken = request.headers['x-client-token'];
        if (!clientToken)
            return reply.code(401).send({ error: 'Missing client token' });
        const deliverable = await index_1.prisma.deliverable.findUnique({
            where: { id },
            include: { project: true }
        });
        if (!deliverable || deliverable.project.clientAccessParam !== clientToken) {
            return reply.code(403).send({ error: 'Unauthorized' });
        }
        const result = approvalSchema.safeParse(request.body);
        if (!result.success)
            return reply.code(400).send({ error: result.error });
        const { action, comments } = result.data;
        // Create Audit Log
        const approval = await index_1.prisma.approvalAuditLog.create({
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
        if (action === 'APPROVE') {
            // Stub: Create Invoice
            /*
            await prisma.invoice.create({
              data: {
                projectId: deliverable.projectId,
                amount: 1000, // Placeholder or from Scope
                status: 'DRAFT',
              }
            });
            */
        }
        return approval;
    });
}
