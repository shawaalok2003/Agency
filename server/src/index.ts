import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { deliverableRoutes } from './routes/deliverables';
import { scopeRoutes } from './routes/scopes';
import { leadRoutes } from './routes/leads';
import { contactRoutes } from './routes/contacts';
import { teamRoutes } from './routes/team';
import { taskRoutes } from './routes/tasks';
import { invoiceRoutes } from './routes/invoices';
import { dailyReportRoutes } from './routes/dailyReports';
import { messageRoutes } from './routes/messages';
import { sendOtpEmail } from './services/emailService';

const buildServer = async () => {
    const server = Fastify({
        logger: true,
        rewriteUrl: (req) => {
            return req.url ? req.url.replace(/\/{2,}/g, '/') : '/';
        }
    });

    await server.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    });

    server.register(authRoutes);
    server.register(projectRoutes);
    server.register(deliverableRoutes);
    server.register(scopeRoutes);
    server.register(leadRoutes);
    server.register(contactRoutes);
    server.register(teamRoutes);
    server.register(taskRoutes);
    server.register(invoiceRoutes);
    server.register(dailyReportRoutes);
    server.register(messageRoutes);

    server.get('/health', async () => {
        return { status: 'ok' };
    });

    server.get('/test-email', async (request, reply) => {
        const { to } = request.query as { to?: string };
        const target = to || 'aalokshaw2003@gmail.com';
        const res = await sendOtpEmail(target, '999888');
        return res;
    });

    return server;
};

const start = async () => {
    try {
        const server = await buildServer();
        const port = parseInt(process.env.PORT || '4000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};


if (require.main === module) {
    start();
}

export default async (req: any, res: any) => {
    const app = await buildServer();
    await app.ready();
    app.server.emit('request', req, res);
};
