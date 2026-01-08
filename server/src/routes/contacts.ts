import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createContactSchema = z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    company: z.string().optional(),
    email: z.string().email(),
    type: z.string().optional(),
});

export async function contactRoutes(server: FastifyInstance) {
    server.get('/contacts', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        const contacts = await prisma.contact.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return contacts;
    });

    server.post('/contacts', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        const result = createContactSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: result.error });

        const contact = await prisma.contact.create({
            data: {
                ...result.data,
                userId
            }
        });
        return contact;
    });
}
