import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';
import { sendProcessUpdateEmail } from '../services/emailService';

const createLeadSchema = z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    email: z.string().email().optional(),
    value: z.number().optional(),
    status: z.enum(['NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST']).optional(),
    assignedToEmail: z.string().optional(),
    assignedToName: z.string().optional(),
    priority: z.string().optional(),
    notes: z.string().optional(),
});

export async function leadRoutes(server: FastifyInstance) {
    // GET ALL LEADS (Shared organization-wide between Admin, Sales & Leadership)
    server.get('/leads', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const companyName = user.companyName || user.email.split('@')[1]?.split('.')[0] || user.email.split('@')[0];

        // Organization-wide visibility: all authorized team members in company see shared leads
        const leads = await prisma.lead.findMany({
            where: {
                OR: [
                    { companyName },
                    { ownerId: user.id }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        return leads;
    });

    // CREATE LEAD
    server.post('/leads', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const userId = user.id;
        const companyName = user.companyName || user.email.split('@')[1]?.split('.')[0] || user.email.split('@')[0];
        const result = createLeadSchema.safeParse(request.body);
        if (!result.success) {
            console.error('LEAD VALIDATION FAILED:', result.error);
            return reply.code(400).send({ error: result.error });
        }

        const assignedToEmail = result.data.assignedToEmail || (user.role === 'SALES' ? user.email : undefined);
        const assignedToName = result.data.assignedToName || (user.role === 'SALES' ? (user.name || user.email) : undefined);

        const lead = await prisma.lead.create({
            data: {
                name: result.data.name,
                company: result.data.company,
                email: result.data.email,
                value: result.data.value || 0,
                status: result.data.status || 'NEW',
                assignedToEmail,
                assignedToName,
                priority: result.data.priority || 'MEDIUM',
                notes: result.data.notes || null,
                ownerId: userId,
                companyName,
            }
        });

        // Increment team member assigned leads count
        if (assignedToEmail) {
            prisma.teamMember.updateMany({
                where: { email: assignedToEmail },
                data: { leadsAssigned: { increment: 1 } }
            }).catch(e => console.error(e));
        }

        if (user?.email) {
            sendProcessUpdateEmail({
                to: user.email,
                category: 'LEAD',
                title: `New Lead Captured: ${lead.name}`,
                description: `A new sales lead "${lead.name}" (${lead.company || 'Direct'}) was added with value ₹${Number(lead.value).toLocaleString('en-IN')}.`,
                metaDetails: [
                    { label: 'Lead Name', value: lead.name },
                    { label: 'Company', value: lead.company || 'N/A' },
                    { label: 'Deal Value', value: `₹${Number(lead.value).toLocaleString('en-IN')}` },
                    { label: 'Assigned To', value: lead.assignedToName || 'Unassigned' },
                    { label: 'Pipeline Stage', value: lead.status }
                ],
                actionText: 'View in Sales Pipeline',
                actionUrl: 'https://www.agnecyos.in/?view=pipeline'
            }).catch(err => console.error('[Email Notification Error]', err));
        }

        return lead;
    });

    // UPDATE STATUS
    server.patch('/leads/:id/status', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const { status } = request.body as { status: string };

        const lead = await prisma.lead.update({
            where: { id },
            data: { status: status as any }
        });

        // If won, update sales stats
        if (status === 'WON' && lead.assignedToEmail) {
            prisma.teamMember.updateMany({
                where: { email: lead.assignedToEmail },
                data: {
                    dealsClosed: { increment: 1 },
                    revenueGenerated: { increment: lead.value || 0 }
                }
            }).catch(e => console.error(e));
        }

        if (user?.email) {
            sendProcessUpdateEmail({
                to: user.email,
                category: 'LEAD',
                title: `Lead Pipeline Stage: ${lead.name} -> [${lead.status}]`,
                description: `Lead "${lead.name}" moved to the "${lead.status}" stage in your CRM pipeline.`,
                metaDetails: [
                    { label: 'Lead', value: lead.name },
                    { label: 'New Stage', value: lead.status },
                    { label: 'Deal Value', value: `₹${Number(lead.value).toLocaleString('en-IN')}` }
                ],
                actionText: 'View Pipeline',
                actionUrl: 'https://www.agnecyos.in/?view=pipeline'
            }).catch(err => console.error('[Email Notification Error]', err));
        }

        return lead;
    });

    // CONVERT TO PROJECT (WIN)
    server.post('/leads/:id/win', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const { clientEmail, projectName } = request.body as { clientEmail: string, projectName?: string };
        const userId = user.id;

        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return reply.code(404).send({ error: 'Lead not found' });

        // Update Lead
        await prisma.lead.update({
            where: { id },
            data: { status: 'WON' }
        });

        // Update sales rep metrics
        if (lead.assignedToEmail) {
            prisma.teamMember.updateMany({
                where: { email: lead.assignedToEmail },
                data: {
                    dealsClosed: { increment: 1 },
                    revenueGenerated: { increment: lead.value || 0 }
                }
            }).catch(e => console.error(e));
        }

        // Create Project
        const project = await prisma.project.create({
            data: {
                name: projectName || lead.name,
                clientEmail: clientEmail || lead.email || 'pending@client.com',
                status: 'ACTIVE',
                userId: userId,
            }
        });

        if (user?.email) {
            sendProcessUpdateEmail({
                to: user.email,
                category: 'LEAD',
                title: `🎉 Deal Won! ${lead.name} converted to Active Project`,
                description: `Congratulations! Lead "${lead.name}" has been won and active project "${project.name}" has been created.`,
                projectName: project.name,
                metaDetails: [
                    { label: 'Client Email', value: project.clientEmail || 'N/A' },
                    { label: 'Deal Value', value: `₹${Number(lead.value).toLocaleString('en-IN')}` },
                    { label: 'Project Status', value: project.status }
                ],
                actionText: 'Open New Project',
                actionUrl: `https://www.agnecyos.in/projects/${project.id}`
            }).catch(err => console.error('[Email Notification Error]', err));
        }

        return project;
    });

    // UPDATE LEAD
    server.patch('/leads/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as any;

        const updated = await prisma.lead.update({
            where: { id },
            data: {
                name: body.name !== undefined ? body.name : undefined,
                company: body.company !== undefined ? body.company : undefined,
                email: body.email !== undefined ? body.email : undefined,
                value: body.value !== undefined ? body.value : undefined,
                status: body.status !== undefined ? body.status : undefined,
                assignedToEmail: body.assignedToEmail !== undefined ? body.assignedToEmail : undefined,
                assignedToName: body.assignedToName !== undefined ? body.assignedToName : undefined,
                priority: body.priority !== undefined ? body.priority : undefined,
                notes: body.notes !== undefined ? body.notes : undefined,
            }
        });
        return updated;
    });

    // DELETE LEAD
    server.delete('/leads/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };

        await prisma.lead.delete({ where: { id } });
        return { success: true };
    });
}
