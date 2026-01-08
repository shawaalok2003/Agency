import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

const createScopeSchema = z.object({
    content: z.string().min(1),
    price: z.number().min(0).optional(),
});

export async function scopeRoutes(server: FastifyInstance) {
    // Add/Update Scope (Creates new version)
    server.post('/projects/:projectId/scopes', { preHandler: [authenticate] }, async (request, reply) => {
        const { projectId } = request.params as { projectId: string };
        const userId = (request as any).user.id;

        // Verify Project Ownership
        const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) return reply.code(404).send({ error: 'Project not found' });

        const result = createScopeSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: result.error });

        // Get latest version
        const lastScope = await prisma.scope.findFirst({
            where: { projectId },
            orderBy: { version: 'desc' }
        });

        // Check if locked
        if (lastScope && lastScope.isLocked) {
            // For a locked scope, typically we create a NEW version (Change Order logic) or deny if strict.
            // Requirement says: "Attempt to edit locked scope (must fail)". 
            // Implication: You must explicilty create a new "Proposal" or verify logic.
            // For MVP: We allow creating a NEW version, but cannot edit the old one. This endpoint creates new versions.
            // However, if the *latest* is locked, maybe we require an unlock or explicit "new version" flag?
            // Let's implement auto-versioning: Locked scopes effectively close that version. New POST = New Version.
        }

        const version = (lastScope?.version || 0) + 1;

        const scope = await prisma.scope.create({
            data: {
                projectId,
                version,
                content: result.data.content,
                price: result.data.price || 0, // Default to 0 if not provided
                isLocked: false // New drafts start unlocked
            }
        });

        return scope;
    });

    // Lock Scope
    server.patch('/projects/:projectId/scopes/:scopeId/lock', { preHandler: [authenticate] }, async (request, reply) => {
        const { projectId, scopeId } = request.params as { projectId: string, scopeId: string };
        const userId = (request as any).user.id;

        const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) return reply.code(404).send({ error: 'Project not found' });

        const scope = await prisma.scope.findFirst({ where: { id: scopeId, projectId } });
        if (!scope) return reply.code(404).send({ error: 'Scope not found' });

        const updated = await prisma.scope.update({
            where: { id: scopeId },
            data: { isLocked: true }
        });

        return updated;
    });

    // Get Project Scopes
    server.get('/projects/:projectId/scopes', { preHandler: [authenticate] }, async (request, reply) => {
        const { projectId } = request.params as { projectId: string };
        const userId = (request as any).user.id;

        const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!project) return reply.code(404).send({ error: 'Project not found' });

        const scopes = await prisma.scope.findMany({
            where: { projectId },
            orderBy: { version: 'desc' }
        });

        return scopes;
    });
}
