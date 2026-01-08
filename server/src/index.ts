import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
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

let app: FastifyInstance | null = null;

const buildServer = async () => {
    const server = Fastify({
        logger: process.env.NODE_ENV !== 'production',
        trustProxy: true
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

    server.get('/health', async () => {
        return { status: 'ok' };
    });

    return server;
};

const start = async () => {
    try {
        const server = await buildServer();
        const port = parseInt(process.env.PORT || '3000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Run locally or in traditional Node environment
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    start();
}

// Serverless handler for Vercel
module.exports = async (req: any, res: any) => {
    try {
        if (!app) {
            app = await buildServer();
            await app.ready();
        }
        
        // Use Fastify's inject method for serverless
        const response = await app.inject({
            method: req.method,
            url: req.url,
            headers: req.headers,
            payload: req.body,
            query: req.query
        });

        // Send response
        res.statusCode = response.statusCode;
        Object.keys(response.headers).forEach(key => {
            res.setHeader(key, response.headers[key]);
        });
        res.end(response.payload);
    } catch (error) {
        console.error('Handler error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            error: 'Internal Server Error', 
            message: error instanceof Error ? error.message : String(error) 
        }));
    }
};
