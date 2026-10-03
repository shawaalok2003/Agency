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

    server.patch('/contacts/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = (request as any).user.id;
        const body = request.body as any;

        const existing = await prisma.contact.findFirst({ where: { id, userId } });
        if (!existing) return reply.code(404).send({ error: 'Contact not found' });

        const updated = await prisma.contact.update({
            where: { id },
            data: {
                name: body.name !== undefined ? body.name : undefined,
                role: body.role !== undefined ? body.role : undefined,
                company: body.company !== undefined ? body.company : undefined,
                email: body.email !== undefined ? body.email : undefined,
                type: body.type !== undefined ? body.type : undefined,
            }
        });
        return updated;
    });

    server.delete('/contacts/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = (request as any).user.id;

        const existing = await prisma.contact.findFirst({ where: { id, userId } });
        if (!existing) return reply.code(404).send({ error: 'Contact not found' });

        await prisma.contact.delete({ where: { id } });
        return { success: true };
    });
}
