import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createLeadSchema = z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    email: z.string().email().optional(),
    value: z.number().optional(),
    status: z.enum(['NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST']).optional(),
});

export async function leadRoutes(server: FastifyInstance) {
    // GET ALL LEADS
    server.get('/leads', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        const leads = await prisma.lead.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return leads;
    });

    // CREATE LEAD
    server.post('/leads', { preHandler: [authenticate] }, async (request, reply) => {
        console.log('RECEIVED LEAD POST:', request.body);
        const userId = (request as any).user.id;
        const result = createLeadSchema.safeParse(request.body);
        if (!result.success) {
            console.error('LEAD VALIDATION FAILED:', result.error);
            return reply.code(400).send({ error: result.error });
        }

        const lead = await prisma.lead.create({
            data: {
                ...result.data,
                ownerId: userId,
                status: result.data.status || 'NEW',
                value: result.data.value || 0
            }
        });
        return lead;
    });

    // UPDATE STATUS
    server.patch('/leads/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { status } = request.body as { status: string };

        // Simple validation, ideally use zod
        const lead = await prisma.lead.update({
            where: { id },
            data: { status: status as any }
        });
        return lead;
    });


    // CONVERT TO PROJECT (WIN)
    server.post('/leads/:id/win', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { clientEmail, projectName } = request.body as { clientEmail: string, projectName?: string };
        const userId = (request as any).user.id;

        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return reply.code(404).send({ error: 'Lead not found' });

        // Update Lead
        await prisma.lead.update({
            where: { id },
            data: { status: 'WON' }
        });

        // Create Project
        const project = await prisma.project.create({
            data: {
                name: projectName || lead.name,
                clientEmail: clientEmail || lead.email || 'pending@client.com',
                status: 'ACTIVE',
                userId: userId,
                // Add default scope or deliverable if needed
            }
        });

        return project;
    });
}
