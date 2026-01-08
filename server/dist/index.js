"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const auth_1 = require("./routes/auth");
const projects_1 = require("./routes/projects");
const deliverables_1 = require("./routes/deliverables");
const scopes_1 = require("./routes/scopes");
const leads_1 = require("./routes/leads");
const contacts_1 = require("./routes/contacts");
const team_1 = require("./routes/team");
let app = null;
const buildServer = async () => {
    const server = (0, fastify_1.default)({
        logger: process.env.NODE_ENV !== 'production',
        trustProxy: true
    });
    await server.register(cors_1.default, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    });
    server.register(auth_1.authRoutes);
    server.register(projects_1.projectRoutes);
    server.register(deliverables_1.deliverableRoutes);
    server.register(scopes_1.scopeRoutes);
    server.register(leads_1.leadRoutes);
    server.register(contacts_1.contactRoutes);
    server.register(team_1.teamRoutes);
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
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
// Run locally or in traditional Node environment
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    start();
}
// Serverless handler for Vercel
module.exports = async (req, res) => {
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
    }
    catch (error) {
        console.error('Handler error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : String(error)
        }));
    }
};
