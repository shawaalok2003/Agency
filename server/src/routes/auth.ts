import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../index';
import { signToken, authenticate } from '../utils/auth';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['OWNER', 'TEAM_MEMBER']).default('OWNER'), // simplified for initial onboarding
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function authRoutes(server: FastifyInstance) {
    server.post('/auth/register', async (request, reply) => {
        const result = registerSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        const { email, password, role } = result.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return reply.code(400).send({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 14); // 14 Day Trial

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role: role as any,
                trialEndsAt: trialDate,
            },
        });

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    });

    server.post('/auth/login', async (request, reply) => {
        const result = loginSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    });
    server.get('/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                plan: true,
                trialEndsAt: true
            }
        });
        if (!user) return reply.code(404).send({ error: 'User not found' });
        return user;
    });
    server.post('/auth/upgrade', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                plan: 'PRO',
                subscriptionStatus: 'ACTIVE',
                // Remove trial limit logic if needed, or just let PRO override it
            }
        });

        return user;
    });
}
