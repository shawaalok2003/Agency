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
const buildServer = async () => {
    const server = (0, fastify_1.default)({ logger: true });
    await server.register(cors_1.default, {
        origin: true // Allow all for dev
    });
    server.register(auth_1.authRoutes);
    server.register(projects_1.projectRoutes);
    server.register(deliverables_1.deliverableRoutes);
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
start();
