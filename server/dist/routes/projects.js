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
        const userId = request.user.id; // Authenticated user
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
                _count: {
                    select: { deliverables: true, invoices: true },
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
}
