"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = projectRoutes;
const zod_1 = require("zod");
const index_1 = require("../index");
const auth_1 = require("../utils/auth");
const createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    clientEmail: zod_1.z.string().email().optional(),
});
async function projectRoutes(server) {
    server.post('/projects', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const result = createProjectSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }
        const { name, clientEmail } = result.data;
        const userId = request.user.id;
        // Check Limits
        const user = await index_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return reply.code(401).send({ error: 'User not found' });
        const isPro = user.plan === 'PRO';
        const isTrialActive = user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
        if (!isPro && !isTrialActive) {
            const count = await index_1.prisma.project.count({ where: { userId } });
            if (count >= 3) {
                return reply.code(403).send({
                    error: 'Free Plan Limit Reached',
                    message: 'You have reached the limit of 3 projects on the Free Plan. Please upgrade to Pro.'
                });
            }
        }
        const project = await index_1.prisma.project.create({
            data: {
                name,
                clientEmail,
                userId,
            },
        });
        return project;
    });
    server.get('/projects', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const userId = request.user.id;
        const projects = await index_1.prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                invoices: true,
                tasks: {
                    include: { subtasks: true },
                    orderBy: { createdAt: 'desc' }
                },
                deliverables: {
                    include: { approvals: true },
                    orderBy: { createdAt: 'desc' }
                },
                scopes: {
                    orderBy: { version: 'desc' },
                    take: 1
                },
                _count: {
                    select: { deliverables: true, invoices: true, tasks: true },
                },
            },
        });
        return projects;
    });
    server.get('/projects/:id', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.id;
        const project = await index_1.prisma.project.findFirst({
            where: { id, userId },
            include: {
                scopes: true,
                deliverables: {
                    include: { approvals: true },
                    orderBy: { version: 'desc' },
                },
                invoices: true,
                tasks: {
                    include: { subtasks: true }
                }
            },
        });
        if (!project) {
            return reply.code(404).send({ error: 'Project not found' });
        }
        return project;
    });
    server.patch('/projects/:id', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        const project = await index_1.prisma.project.update({
            where: { id },
            data: { status: body.status }
        });
        return project;
    });
    server.delete('/projects/:id', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user?.id;
            const userRole = request.user?.role;
            // Find project: OWNER can delete any project, otherwise user must own it
            const project = await index_1.prisma.project.findFirst({
                where: userRole === 'OWNER' ? { id } : { id, userId }
            });
            if (!project) {
                return reply.code(404).send({ error: 'Project not found or you do not have permission to delete it.' });
            }
            // Clean up project relations safely inside a transaction
            await index_1.prisma.$transaction(async (tx) => {
                // 1. Tasks and subtasks
                const tasks = await tx.task.findMany({ where: { projectId: id }, select: { id: true } });
                const taskIds = tasks.map(t => t.id);
                if (taskIds.length > 0) {
                    await tx.subtask.deleteMany({ where: { taskId: { in: taskIds } } });
                    await tx.task.deleteMany({ where: { id: { in: taskIds } } });
                }
                // 2. Deliverables and approval audit logs
                const deliverables = await tx.deliverable.findMany({ where: { projectId: id }, select: { id: true } });
                const deliverableIds = deliverables.map(d => d.id);
                if (deliverableIds.length > 0) {
                    await tx.approvalAuditLog.deleteMany({ where: { deliverableId: { in: deliverableIds } } });
                    await tx.deliverable.deleteMany({ where: { id: { in: deliverableIds } } });
                }
                // 3. Invoices and payments
                const invoices = await tx.invoice.findMany({ where: { projectId: id }, select: { id: true } });
                const invoiceIds = invoices.map(i => i.id);
                if (invoiceIds.length > 0) {
                    await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
                    await tx.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
                }
                // 4. Scopes
                await tx.scope.deleteMany({ where: { projectId: id } });
                // 5. Finally delete the project
                await tx.project.delete({ where: { id } });
            });
            return { success: true, message: 'Project and all related data deleted successfully' };
        }
        catch (error) {
            console.error('[Delete Project Error]', error);
            return reply.code(500).send({
                error: error.message || 'Failed to delete project. Please try again.'
            });
        }
    });
}
