import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';
import { sendProcessUpdateEmail } from '../services/emailService';

export async function taskRoutes(server: FastifyInstance) {
    // Get all tasks for user's projects
    server.get('/tasks', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        try {
            const tasks = await prisma.task.findMany({
                where: {
                    project: { userId }
                },
                include: {
                    project: { select: { id: true, name: true, clientEmail: true } },
                    subtasks: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return tasks;
        } catch (error) {
            return reply.code(500).send({ error: 'Failed to fetch tasks' });
        }
    });

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
        const user = (request as any).user;
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
                include: {
                    subtasks: true,
                    project: { select: { id: true, name: true } }
                }
            });

            // Dispatch process update email to user / assignee
            if (user?.email) {
                sendProcessUpdateEmail({
                    to: user.email,
                    category: 'TASK',
                    title: `New Task Created: "${task.title}"`,
                    description: `A new task was created in project "${task.project?.name || 'Project'}".`,
                    projectName: task.project?.name,
                    metaDetails: [
                        { label: 'Task Name', value: task.title },
                        { label: 'Status', value: task.status },
                        { label: 'Assignee', value: task.assignee || 'Unassigned' },
                        { label: 'Due Date', value: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None' }
                    ],
                    actionText: 'View Task in Project',
                    actionUrl: `http://localhost:3000/projects/${task.projectId}`
                }).catch(err => console.error('[Email Notification Error]', err));
            }

            return task;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Failed to create task' });
        }
    });

    // Update a task
    server.patch('/tasks/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
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
                include: {
                    subtasks: true,
                    project: { select: { id: true, name: true } }
                }
            });

            // Dispatch process update email
            if (user?.email) {
                sendProcessUpdateEmail({
                    to: user.email,
                    category: 'TASK',
                    title: `Task Progress: "${task.title}" updated to [${task.status}]`,
                    description: `Task "${task.title}" has been updated to "${task.status}".`,
                    projectName: task.project?.name,
                    metaDetails: [
                        { label: 'Task', value: task.title },
                        { label: 'New Status', value: task.status },
                        { label: 'Assignee', value: task.assignee || 'Unassigned' },
                        { label: 'Updated', value: new Date().toLocaleTimeString() }
                    ],
                    actionText: 'Open Project',
                    actionUrl: `http://localhost:3000/projects/${task.projectId}`
                }).catch(err => console.error('[Email Notification Error]', err));
            }

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
