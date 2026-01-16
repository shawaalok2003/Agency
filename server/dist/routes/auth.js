"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const index_1 = require("../index");
const auth_1 = require("../utils/auth");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: zod_1.z.enum(['OWNER', 'TEAM_MEMBER']).default('OWNER'), // simplified for initial onboarding
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
async function authRoutes(server) {
    server.post('/auth/register', async (request, reply) => {
        const result = registerSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }
        const { email, password, role } = result.data;
        const existingUser = await index_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return reply.code(400).send({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 14); // 14 Day Trial
        const user = await index_1.prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role: role,
                trialEndsAt: trialDate,
            },
        });
        const token = (0, auth_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    });
    server.post('/auth/login', async (request, reply) => {
        const result = loginSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }
        const { email, password } = result.data;
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }
        const token = (0, auth_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    });
    server.get('/auth/me', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const userId = request.user.id;
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                plan: true,
                trialEndsAt: true
            }
        });
        if (!user)
            return reply.code(404).send({ error: 'User not found' });
        return user;
    });
}
