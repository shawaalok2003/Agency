import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createProjectSchema = z.object({
    name: z.string().min(1),
    clientEmail: z.string().email().optional(),
});

export async function projectRoutes(server: FastifyInstance) {
    server.post('/projects', { preHandler: [authenticate] }, async (request, reply) => {
        const result = createProjectSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        const { name, clientEmail } = result.data;
        const userId = (request as any).user.id;

        // Check Limits
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return reply.code(401).send({ error: 'User not found' });

        const isPro = user.plan === 'PRO';
        const isTrialActive = user.trialEndsAt && new Date(user.trialEndsAt) > new Date();

        if (!isPro && !isTrialActive) {
            const count = await prisma.project.count({ where: { userId } });
            if (count >= 3) {
                return reply.code(403).send({
                    error: 'Free Plan Limit Reached',
                    message: 'You have reached the limit of 3 projects on the Free Plan. Please upgrade to Pro.'
                });
            }
        }

        const project = await prisma.project.create({
            data: {
                name,
                clientEmail,
                userId,
            },
        });

        return project;
    });

    server.get('/projects', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                invoices: true,
                scopes: {
                    orderBy: { version: 'desc' },
                    take: 1
                },
                _count: {
                    select: { deliverables: true, invoices: true },
                },
            },
        });
        return projects;
    });

    server.get('/projects/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = (request as any).user.id;

        const project = await prisma.project.findFirst({
            where: { id, userId },
            include: {
                scopes: true,
                deliverables: {
                    include: { approvals: true },
                    orderBy: { version: 'desc' },
                },
                invoices: true,
            },
        });

        if (!project) {
            return reply.code(404).send({ error: 'Project not found' });
        }

        return project;
    });

    server.patch('/projects/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as { status: string };

        const project = await prisma.project.update({
            where: { id },
            data: { status: body.status as any }
        });

        return project;
    });
}
