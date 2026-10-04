import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createDailyReportSchema = z.object({
    tasksCompleted: z.string().min(2, 'Please specify tasks completed today'),
    callsMade: z.coerce.number().default(0),
    meetingsBooked: z.coerce.number().default(0),
    leadsContacted: z.coerce.number().default(0),
    dealsClosedValue: z.coerce.number().default(0),
    blockers: z.string().optional(),
    proofUrl: z.string().optional(),
    date: z.string().optional(),
});

export async function dailyReportRoutes(server: FastifyInstance) {
    // GET /daily-reports - List reports based on role
    server.get('/daily-reports', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';

        const { department, userEmail, date } = request.query as { department?: string; userEmail?: string; date?: string };

        const where: any = {};
        if (!isAdmin) {
            // Team members only see their own reports
            where.OR = [
                { userId: user.id },
                { userEmail: user.email }
            ];
        } else {
            // Admins can filter
            if (department) where.department = department;
            if (userEmail) where.userEmail = userEmail;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        }

        const reports = await prisma.dailyReport.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return reports;
    });

    // POST /daily-reports - Create a daily work log / tracker submission
    server.post('/daily-reports', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const result = createDailyReportSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid input data' });
        }

        const data = result.data;
        const reportDate = data.date ? new Date(data.date) : new Date();

        const report = await prisma.dailyReport.create({
            data: {
                userId: user.id,
                userName: user.name || user.email.split('@')[0],
                userEmail: user.email,
                userRole: user.role || 'SALES',
                department: user.department || 'SALES',
                date: reportDate,
                tasksCompleted: data.tasksCompleted,
                callsMade: data.callsMade,
                meetingsBooked: data.meetingsBooked,
                leadsContacted: data.leadsContacted,
                dealsClosedValue: data.dealsClosedValue,
                blockers: data.blockers || null,
                proofUrl: data.proofUrl || null,
                status: 'SUBMITTED'
            }
        });

        // Update team member aggregate stats if exists
        try {
            await prisma.teamMember.updateMany({
                where: { email: user.email },
                data: {
                    dealsClosed: { increment: data.dealsClosedValue > 0 ? 1 : 0 },
                    revenueGenerated: { increment: data.dealsClosedValue }
                }
            });
        } catch (err) {
            console.error('Error updating team member stats:', err);
        }

        return {
            success: true,
            message: 'Daily task tracker submitted successfully to Admin.',
            report
        };
    });

    // PATCH /daily-reports/:id - Admin feedback or status update
    server.patch('/daily-reports/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const { status, adminFeedback } = request.body as { status?: string; adminFeedback?: string };

        const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';
        if (!isAdmin) {
            return reply.code(403).send({ error: 'Only admins can review and provide feedback on daily reports.' });
        }

        const updated = await prisma.dailyReport.update({
            where: { id },
            data: {
                status: status !== undefined ? status : undefined,
                adminFeedback: adminFeedback !== undefined ? adminFeedback : undefined
            }
        });

        return {
            success: true,
            report: updated
        };
    });

    // GET /daily-reports/stats - Aggregated metrics
    server.get('/daily-reports/stats', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';

        const where: any = {};
        if (!isAdmin) {
            where.OR = [
                { userId: user.id },
                { userEmail: user.email }
            ];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [allReports, todayReports] = await Promise.all([
            prisma.dailyReport.findMany({ where }),
            prisma.dailyReport.findMany({
                where: {
                    ...where,
                    createdAt: { gte: today }
                }
            })
        ]);

        const totalCalls = allReports.reduce((acc, r) => acc + (r.callsMade || 0), 0);
        const totalMeetings = allReports.reduce((acc, r) => acc + (r.meetingsBooked || 0), 0);
        const totalLeadsContacted = allReports.reduce((acc, r) => acc + (r.leadsContacted || 0), 0);
        const totalDealsValue = allReports.reduce((acc, r) => acc + Number(r.dealsClosedValue || 0), 0);

        return {
            totalReports: allReports.length,
            todaySubmissions: todayReports.length,
            totalCalls,
            totalMeetings,
            totalLeadsContacted,
            totalDealsValue
        };
    });
}
