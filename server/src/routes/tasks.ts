import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';

export async function taskRoutes(server: FastifyInstance) {
    // Get all tasks for a project
    server.get('/projects/:projectId/tasks', { preHandler: [authenticate] }, async (request, reply) => {
        const { projectId } = request.params as { projectId: string };
        try {
            const tasks = await prisma.task.findMany({
                where: { projectId },
                include: { subtasks: true },
                orderBy: { createdAt: 'desc' }
            });
            return tasks;
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to fetch tasks' });
        }
    });

    // Create a new task
    server.post('/tasks', { preHandler: [authenticate] }, async (request, reply) => {
        const body = request.body as { projectId: string; title: string; assignee?: string; status?: string; dueDate?: string };

        try {
            const task = await prisma.task.create({
                data: {
                    projectId: body.projectId,
                    title: body.title,
                    assignee: body.assignee,
                    status: body.status || 'TODO',
                    dueDate: body.dueDate ? new Date(body.dueDate) : undefined
                },
                include: { subtasks: true }
            });
            return task;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Failed to create task' });
        }
    });

    // Update a task
    server.patch('/tasks/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as { title?: string; status?: string; assignee?: string; dueDate?: string };

        try {
            const task = await prisma.task.update({
                where: { id },
                data: {
                    title: body.title,
                    status: body.status,
                    assignee: body.assignee,
                    dueDate: body.dueDate ? new Date(body.dueDate) : undefined
                },
                include: { subtasks: true }
            });
            return task;
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to update task' });
        }
    });

    // Delete a task
    server.delete('/tasks/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            // Delete subtasks first (if not cascading)
            await prisma.subtask.deleteMany({ where: { taskId: id } });
            await prisma.task.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to delete task' });
        }
    });

    // --- Subtasks ---

    // Add a subtask
    server.post('/tasks/:taskId/subtasks', { preHandler: [authenticate] }, async (request, reply) => {
        const { taskId } = request.params as { taskId: string };
        const { title } = request.body as { title: string };

        try {
            const subtask = await prisma.subtask.create({
                data: {
                    taskId,
                    title,
                    completed: false
                }
            });
            return subtask;
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to add subtask' });
        }
    });

    // Toggle subtask completion or update title
    server.patch('/tasks/subtasks/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as { completed?: boolean; title?: string };

        try {
            const subtask = await prisma.subtask.update({
                where: { id },
                data: {
                    completed: body.completed,
                    title: body.title
                }
            });
            return subtask;
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to update subtask' });
        }
    });

    // Delete subtask
    server.delete('/tasks/subtasks/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.subtask.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to delete subtask' });
        }
    });
}
