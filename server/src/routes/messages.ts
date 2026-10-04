import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const postMessageSchema = z.object({
    channel: z.string().default('general'),
    content: z.string().min(1, 'Message cannot be empty'),
    attachmentUrl: z.string().optional(),
    recipientEmail: z.string().optional(),
});

export async function messageRoutes(server: FastifyInstance) {
    // GET /messages - List messages in channel or DM
    server.get('/messages', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const { channel, directWith } = request.query as { channel?: string; directWith?: string };

        const companyName = user.companyName || 'dhandaeasy';

        let where: any = {
            companyName
        };

        if (directWith) {
            // Direct message between user and directWith
            where = {
                companyName,
                OR: [
                    { senderEmail: user.email, recipientEmail: directWith },
                    { senderEmail: directWith, recipientEmail: user.email }
                ]
            };
        } else {
            // Channel message
            where.channel = channel || 'general';
            where.recipientEmail = null;
        }

        const messages = await prisma.teamMessage.findMany({
            where,
            orderBy: { createdAt: 'asc' },
            take: 150
        });

        return messages;
    });

    // POST /messages - Send a message to a channel or teammate
    server.post('/messages', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const result = postMessageSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid message' });
        }

        const { channel, content, attachmentUrl, recipientEmail } = result.data;
        const companyName = user.companyName || 'dhandaeasy';

        const message = await prisma.teamMessage.create({
            data: {
                channel: recipientEmail ? 'direct' : channel,
                senderId: user.id,
                senderName: user.name || user.email.split('@')[0],
                senderEmail: user.email,
                senderRole: user.role || 'SALES',
                senderDepartment: user.department || 'SALES',
                recipientEmail: recipientEmail || null,
                content,
                attachmentUrl: attachmentUrl || null,
                companyName
            }
        });

        return {
            success: true,
            message
        };
    });

    // GET /messages/team-directory - Get list of team members and department directory for chatting
    server.get('/messages/team-directory', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const companyName = user.companyName || 'dhandaeasy';

        const [members, users] = await Promise.all([
            prisma.teamMember.findMany({
                where: { companyName },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true,
                    status: true,
                    avatarUrl: true
                }
            }),
            prisma.user.findMany({
                where: { companyName },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    department: true
                }
            })
        ]);

        // Merge directory by email to avoid duplicates
        const map = new Map<string, any>();
        users.forEach(u => map.set(u.email.toLowerCase(), {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            status: 'ACTIVE'
        }));
        members.forEach(m => {
            const key = m.email.toLowerCase();
            if (!map.has(key)) {
                map.set(key, m);
            }
        });

        const channels = [
            { id: 'general', name: 'General Announcements', department: 'ALL' },
            { id: 'sales', name: 'Sales & Deal Pipeline', department: 'SALES' },
            { id: 'operations', name: 'Operations & Delivery', department: 'OPERATIONS' },
            { id: 'dev-tech', name: 'Tech & Development', department: 'DEVELOPMENT' },
            { id: 'management', name: 'Executive Management', department: 'MANAGEMENT' }
        ];

        return {
            channels,
            members: Array.from(map.values())
        };
    });
}
