import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../utils/auth';
import { sendProcessUpdateEmail } from '../services/emailService';

const createInvoiceSchema = z.object({
    projectId: z.string().min(1),
    amount: z.number().positive(),
    status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE']).optional(),
    dueDate: z.string().optional(),
    stripePaymentLink: z.string().optional(),
});

export async function invoiceRoutes(server: FastifyInstance) {
    // GET ALL INVOICES
    server.get('/invoices', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        try {
            const invoices = await prisma.invoice.findMany({
                where: {
                    project: { userId }
                },
                include: {
                    project: {
                        select: { id: true, name: true, clientEmail: true }
                    },
                    payments: true
                },
                orderBy: { createdAt: 'desc' }
            });
            return invoices;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            return reply.code(500).send({ error: 'Failed to fetch invoices' });
        }
    });

    // CREATE INVOICE
    server.post('/invoices', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const userId = user.id;
        const result = createInvoiceSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }

        const { projectId, amount, status, dueDate, stripePaymentLink } = result.data;

        // Verify project belongs to user
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId }
        });

        if (!project) {
            return reply.code(404).send({ error: 'Project not found' });
        }

        const invoice = await prisma.invoice.create({
            data: {
                projectId,
                amount,
                status: status || 'DRAFT',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                stripePaymentLink
            },
            include: {
                project: { select: { id: true, name: true, clientEmail: true } },
                payments: true
            }
        });

        // Email notification to user
        if (user?.email) {
            sendProcessUpdateEmail({
                to: user.email,
                category: 'INVOICE',
                title: `Invoice Generated: ₹${Number(invoice.amount).toLocaleString('en-IN')}`,
                description: `Invoice for project "${project.name}" has been created with status [${invoice.status}].`,
                projectName: project.name,
                metaDetails: [
                    { label: 'Invoice Amount', value: `₹${Number(invoice.amount).toLocaleString('en-IN')}` },
                    { label: 'Status', value: invoice.status },
                    { label: 'Due Date', value: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt' },
                    { label: 'Client', value: project.clientEmail || 'Client' }
                ],
                actionText: 'View Invoices',
                actionUrl: 'http://localhost:3000/?view=invoices'
            }).catch(err => console.error('[Invoice Email Error]', err));
        }

        // Also email client if invoice is SENT
        if (invoice.status === 'SENT' && project.clientEmail) {
            sendProcessUpdateEmail({
                to: project.clientEmail,
                category: 'INVOICE',
                title: `New Invoice for ${project.name}: ₹${Number(invoice.amount).toLocaleString('en-IN')}`,
                description: `A new invoice is ready for payment on project "${project.name}".`,
                projectName: project.name,
                metaDetails: [
                    { label: 'Amount Due', value: `₹${Number(invoice.amount).toLocaleString('en-IN')}` },
                    { label: 'Due Date', value: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Upon Receipt' }
                ],
                actionText: 'Review Invoice & Pay',
                actionUrl: `http://localhost:3000/client/access/${project.clientAccessParam}`
            }).catch(err => console.error('[Client Invoice Email Error]', err));
        }

        return invoice;
    });

    // UPDATE INVOICE
    server.patch('/invoices/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = (request as any).user.id;
        const body = request.body as { status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'; amount?: number; dueDate?: string };

        // Ensure belongs to user
        const existing = await prisma.invoice.findFirst({
            where: { id, project: { userId } }
        });

        if (!existing) {
            return reply.code(404).send({ error: 'Invoice not found' });
        }

        const updated = await prisma.invoice.update({
            where: { id },
            data: {
                status: body.status,
                amount: body.amount !== undefined ? body.amount : undefined,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                paidAt: body.status === 'PAID' ? new Date() : undefined
            },
            include: {
                project: { select: { id: true, name: true, clientEmail: true } },
                payments: true
            }
        });

        return updated;
    });

    // RECORD PAYMENT FOR INVOICE
    server.post('/invoices/:id/payments', { preHandler: [authenticate] }, async (request, reply) => {
        const user = (request as any).user;
        const { id } = request.params as { id: string };
        const userId = user.id;
        const body = request.body as { amount?: number; transactionId?: string; method?: string };

        const invoice = await prisma.invoice.findFirst({
            where: { id, project: { userId } },
            include: { project: true }
        });

        if (!invoice) {
            return reply.code(404).send({ error: 'Invoice not found' });
        }

        const paymentAmount = body.amount || Number(invoice.amount);

        // Create Payment record
        const payment = await prisma.payment.create({
            data: {
                invoiceId: id,
                amount: paymentAmount,
                transactionId: body.transactionId || `PAY-${Date.now()}`,
                status: 'COMPLETED'
            }
        });

        // Mark invoice as PAID
        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: 'PAID',
                paidAt: new Date()
            },
            include: {
                project: { select: { id: true, name: true, clientEmail: true } },
                payments: true
            }
        });

        // Notify user of payment received
        if (user?.email) {
            sendProcessUpdateEmail({
                to: user.email,
                category: 'INVOICE',
                title: `💰 Payment Received: ₹${Number(paymentAmount).toLocaleString('en-IN')}`,
                description: `Payment of ₹${Number(paymentAmount).toLocaleString('en-IN')} has been recorded for invoice on project "${invoice.project?.name}".`,
                projectName: invoice.project?.name,
                metaDetails: [
                    { label: 'Amount Paid', value: `₹${Number(paymentAmount).toLocaleString('en-IN')}` },
                    { label: 'Transaction ID', value: payment.transactionId || 'Direct' },
                    { label: 'Status', value: 'PAID' },
                    { label: 'Date', value: new Date().toLocaleDateString() }
                ],
                actionText: 'View Payments Ledger',
                actionUrl: 'http://localhost:3000/?view=finance'
            }).catch(err => console.error('[Payment Notification Error]', err));
        }

        return { invoice: updatedInvoice, payment };
    });

    // DELETE INVOICE
    server.delete('/invoices/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = (request as any).user.id;

        const existing = await prisma.invoice.findFirst({
            where: { id, project: { userId } }
        });

        if (!existing) {
            return reply.code(404).send({ error: 'Invoice not found' });
        }

        // Delete associated payments first
        await prisma.payment.deleteMany({ where: { invoiceId: id } });
        await prisma.invoice.delete({ where: { id } });

        return { success: true };
    });
}
