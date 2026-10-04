import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createTeamSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    role: z.string().min(1, 'Role is required'),
    department: z.string().default('SALES'),
    phone: z.string().optional(),
    status: z.enum(['ACTIVE', 'INVITED', 'ON_LEAVE']).default('ACTIVE'),
    projectsCount: z.number().int().nonnegative().default(0),
    leadsAssigned: z.number().int().nonnegative().default(0),
    dealsClosed: z.number().int().nonnegative().default(0),
    revenueGenerated: z.number().nonnegative().default(0),
    rating: z.number().min(1).max(5).default(5.0),
    avatarUrl: z.string().optional(),
});

const updateTeamSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.string().min(1).optional(),
    department: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['ACTIVE', 'INVITED', 'ON_LEAVE']).optional(),
    projectsCount: z.number().int().nonnegative().optional(),
    leadsAssigned: z.number().int().nonnegative().optional(),
    dealsClosed: z.number().int().nonnegative().optional(),
    revenueGenerated: z.number().nonnegative().optional(),
    rating: z.number().min(1).max(5).optional(),
    avatarUrl: z.string().optional(),
});

export async function teamRoutes(server: FastifyInstance) {
    // 1. List all team members with optional search and department filter
    server.get('/team', { preHandler: [authenticate] }, async (request, reply) => {
        const query = request.query as { department?: string; search?: string };
        const { department, search } = query;

        const where: any = {};
        if (department && department !== 'ALL') {
            where.department = department;
        }

        if (search && search.trim()) {
            const term = search.trim();
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { email: { contains: term, mode: 'insensitive' } },
                { role: { contains: term, mode: 'insensitive' } },
            ];
        }

        const members = await prisma.teamMember.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        return members;
    });

    // 2. Add new team member (Sales, Dev, Design, PM, etc.)
    server.post('/team', { preHandler: [authenticate] }, async (request, reply) => {
        const result = createTeamSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid team member data' });
        }

        const normalizedEmail = result.data.email.toLowerCase().trim();

        // Check if email already exists
        const existing = await prisma.teamMember.findUnique({
            where: { email: normalizedEmail }
        });

        if (existing) {
            return reply.code(409).send({ error: `A team member with email ${normalizedEmail} already exists` });
        }

        const member = await prisma.teamMember.create({
            data: {
                ...result.data,
                email: normalizedEmail,
            }
        });

        return member;
    });

    // 3. Update existing team member
    server.patch('/team/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const result = updateTeamSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid input data' });
        }

        const existing = await prisma.teamMember.findUnique({ where: { id } });
        if (!existing) {
            return reply.code(404).send({ error: 'Team member not found' });
        }

        // If email is changing, verify unique
        if (result.data.email && result.data.email.toLowerCase().trim() !== existing.email) {
            const emailTaken = await prisma.teamMember.findUnique({
                where: { email: result.data.email.toLowerCase().trim() }
            });
            if (emailTaken) {
                return reply.code(409).send({ error: 'Email already used by another team member' });
            }
        }

        const updated = await prisma.teamMember.update({
            where: { id },
            data: {
                ...result.data,
                email: result.data.email ? result.data.email.toLowerCase().trim() : undefined,
            }
        });

        return updated;
    });

    // 4. Delete team member
    server.delete('/team/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };

        const existing = await prisma.teamMember.findUnique({ where: { id } });
        if (!existing) {
            return reply.code(404).send({ error: 'Team member not found' });
        }

        await prisma.teamMember.delete({ where: { id } });

        return { success: true, message: `Team member ${existing.name} removed from workspace` };
    });

    // 5. Team Workspace Analytics / Sales Overview
    server.get('/team/stats', { preHandler: [authenticate] }, async (request, reply) => {
        const members = await prisma.teamMember.findMany();

        const totalMembers = members.length;
        const salesReps = members.filter(m => (m.department || '').toUpperCase() === 'SALES');
        const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
        const totalLeadsAssigned = members.reduce((sum, m) => sum + (m.leadsAssigned || 0), 0);
        const totalDealsClosed = members.reduce((sum, m) => sum + (m.dealsClosed || 0), 0);
        const totalRevenueGenerated = members.reduce((sum, m) => sum + (parseFloat(m.revenueGenerated?.toString() || '0') || 0), 0);

        return {
            totalMembers,
            activeMembers,
            salesTeamCount: salesReps.length,
            totalLeadsAssigned,
            totalDealsClosed,
            totalRevenueGenerated,
        };
    });
}
