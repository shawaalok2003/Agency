import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const checkInSchema = z.object({
    notes: z.string().optional(),
});

export async function checkInRoutes(server: FastifyInstance) {
    // 1. Check in (Start Duty)
    server.post('/checkin', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const companyName = user.companyName || user.email.split('@')[1]?.split('.')[0] || user.email.split('@')[0];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Check if there is already an active check-in today
        const existingActive = await prisma.checkIn.findFirst({
            where: {
                userId: user.id,
                checkInAt: { gte: todayStart },
                status: 'CHECKED_IN',
                checkOutAt: null
            },
            orderBy: { checkInAt: 'desc' }
        });

        if (existingActive) {
            return reply.send({
                success: true,
                message: 'Already checked in',
                checkIn: existingActive
            });
        }

        const body = (request.body as any) || {};
        const checkIn = await prisma.checkIn.create({
            data: {
                userId: user.id,
                userName: user.name || user.email.split('@')[0],
                userEmail: user.email,
                department: user.department || 'SALES',
                companyName,
                status: 'CHECKED_IN',
                checkInAt: new Date(),
                notes: body.notes || null,
            }
        });

        // Also update TeamMember status to ACTIVE
        await prisma.teamMember.updateMany({
            where: { email: user.email },
            data: { status: 'ACTIVE' }
        }).catch(() => {});

        return {
            success: true,
            message: `Checked in successfully at ${new Date().toLocaleTimeString()}`,
            checkIn
        };
    });

    // 2. Check out (End Duty / Shift)
    server.post('/checkout', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Find open check-in
        const activeCheckIn = await prisma.checkIn.findFirst({
            where: {
                userId: user.id,
                checkInAt: { gte: todayStart },
                status: 'CHECKED_IN',
                checkOutAt: null
            },
            orderBy: { checkInAt: 'desc' }
        });

        if (!activeCheckIn) {
            return reply.code(400).send({ error: 'No active check-in session found for today' });
        }

        const updated = await prisma.checkIn.update({
            where: { id: activeCheckIn.id },
            data: {
                status: 'CHECKED_OUT',
                checkOutAt: new Date()
            }
        });

        return {
            success: true,
            message: `Checked out successfully at ${new Date().toLocaleTimeString()}`,
            checkIn: updated
        };
    });

    // 3. Get Current User's Status Today
    server.get('/checkin/my-status', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const sessions = await prisma.checkIn.findMany({
            where: {
                userId: user.id,
                checkInAt: { gte: todayStart }
            },
            orderBy: { checkInAt: 'desc' }
        });

        const activeSession = sessions.find(s => s.status === 'CHECKED_IN' && !s.checkOutAt) || null;

        return {
            isCheckedIn: Boolean(activeSession),
            activeSession,
            historyToday: sessions
        };
    });

    // 4. Get Company-Wide Today Check-Ins (For Admin, Leadership & Staff directory)
    server.get('/checkin/company-today', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const companyName = user.companyName || user.email.split('@')[1]?.split('.')[0] || user.email.split('@')[0];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const checkIns = await prisma.checkIn.findMany({
            where: {
                companyName,
                checkInAt: { gte: todayStart }
            },
            orderBy: { checkInAt: 'desc' }
        });

        // Also fetch all company team members to show who hasn't checked in yet
        const allMembers = await prisma.teamMember.findMany({
            where: { companyName },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                status: true
            }
        });

        const checkedInEmails = new Set(checkIns.map(c => c.userEmail.toLowerCase()));
        const activeCheckIns = checkIns.filter(c => c.status === 'CHECKED_IN' && !c.checkOutAt);

        const attendanceRoster = allMembers.map(member => {
            const memberEmail = member.email.toLowerCase();
            const memberCheckIns = checkIns.filter(c => c.userEmail.toLowerCase() === memberEmail);
            const active = memberCheckIns.find(c => c.status === 'CHECKED_IN' && !c.checkOutAt);
            const latest = memberCheckIns[0];

            return {
                memberId: member.id,
                name: member.name,
                email: member.email,
                role: member.role,
                department: member.department || 'SALES',
                isOnDuty: Boolean(active),
                checkInAt: latest?.checkInAt || null,
                checkOutAt: latest?.checkOutAt || null,
                status: active ? 'ONLINE' : (latest?.status === 'CHECKED_OUT' ? 'CHECKED_OUT' : 'NOT_CHECKED_IN')
            };
        });

        return {
            totalMembers: allMembers.length,
            onDutyCount: activeCheckIns.length,
            records: checkIns,
            roster: attendanceRoster
        };
    });
}
