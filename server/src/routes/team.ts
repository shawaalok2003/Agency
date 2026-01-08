import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createTeamSchema = z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    email: z.string().email(),
});

// For simplicity, Team members are global or just stored as a list for now
// In a real app, they would be invited users.
export async function teamRoutes(server: FastifyInstance) {
    server.get('/team', { preHandler: [authenticate] }, async (request, reply) => {
        const members = await prisma.teamMember.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return members;
    });

    server.post('/team', { preHandler: [authenticate] }, async (request, reply) => {
        const result = createTeamSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: result.error });

        // Check if email already exists
        const existing = await prisma.teamMember.findUnique({
            where: { email: result.data.email }
        });

        if (existing) {
            return reply.code(409).send({ error: 'Team member already exists' });
        }

        const member = await prisma.teamMember.create({
            data: {
                ...result.data,
                projectsCount: 0,
                rating: 5.0
            }
        });
        return member;
    });
}
