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
    name: zod_1.z.string().optional(),
    companyName: zod_1.z.string().default('dhandaeasy'),
    role: zod_1.z.enum(['OWNER', 'ADMIN', 'SALES', 'DEVELOPER', 'DESIGNER', 'OPERATIONS', 'TEAM_MEMBER']).default('OWNER'),
    department: zod_1.z.string().default('MANAGEMENT'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
async function authRoutes(server) {
    // 1. Send OTP (legacy route kept for compatibility)
    server.post('/auth/send-otp', async (request, reply) => {
        const { email } = request.body;
        if (!email || !email.includes('@')) {
            return reply.code(400).send({ error: 'A valid email address is required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return { success: true, message: `OTP sent`, devOtp: otp };
    });
    // 2. Register user
    server.post('/auth/register', async (request, reply) => {
        const result = registerSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid input data' });
        }
        const { email, password, role, name, companyName, department } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await index_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return reply.code(400).send({ error: 'An account with this email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 14); // 14-day trial
        const user = await index_1.prisma.user.create({
            data: {
                name: name || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                passwordHash: hashedPassword,
                role: role,
                companyName: companyName || 'dhandaeasy',
                department: department || (role === 'SALES' ? 'SALES' : 'MANAGEMENT'),
                trialEndsAt: trialDate,
            },
        });
        const token = (0, auth_1.signToken)({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyName: user.companyName,
            department: user.department,
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                department: user.department,
                plan: user.plan,
            }
        };
    });
    // 3. User Login (Direct Email & Password - RBAC & Company Aware)
    server.post('/auth/login', async (request, reply) => {
        const result = loginSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid email or password' });
        }
        const { email, password } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await index_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }
        // Auto-assign companyName dhandaeasy if missing
        if (!user.companyName && (user.email === 'aalokshaw2003@gmail.com' || user.role === 'OWNER')) {
            await index_1.prisma.user.update({
                where: { id: user.id },
                data: { companyName: 'dhandaeasy', role: 'ADMIN' }
            });
            user.companyName = 'dhandaeasy';
            user.role = 'ADMIN';
        }
        const token = (0, auth_1.signToken)({
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.role,
            companyName: user.companyName || 'dhandaeasy',
            department: user.department || 'MANAGEMENT',
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                role: user.role,
                companyName: user.companyName || 'dhandaeasy',
                department: user.department || 'MANAGEMENT',
                plan: user.plan,
                trialEndsAt: user.trialEndsAt,
            }
        };
    });
    // 4. Admin Creates Team Member Login Credentials
    server.post('/auth/create-team-user', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const caller = request.user;
        if (caller.role !== 'OWNER' && caller.role !== 'ADMIN') {
            return reply.code(403).send({ error: 'Access denied: Only Company Admins can create team accounts' });
        }
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(1, 'Name is required'),
            email: zod_1.z.string().email('Valid email is required'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
            role: zod_1.z.enum(['ADMIN', 'SALES', 'DEVELOPER', 'DESIGNER', 'OPERATIONS', 'TEAM_MEMBER']).default('SALES'),
            department: zod_1.z.string().default('SALES'),
            phone: zod_1.z.string().optional(),
        });
        const result = schema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid team user input' });
        }
        const { name, email, password, role, department, phone } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const companyName = caller.companyName || 'dhandaeasy';
        // Check if user already exists
        const existing = await index_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            if (existing.role === 'OWNER' || existing.email === 'aalokshaw2003@gmail.com') {
                return reply.code(400).send({ error: `Cannot overwrite primary Company Admin account` });
            }
            // Update existing user credentials and reactivate
            const updatedUser = await index_1.prisma.user.update({
                where: { id: existing.id },
                data: {
                    name,
                    passwordHash,
                    loginPassword: password,
                    role: role,
                    department,
                    companyName,
                    phone
                }
            });
            // Upsert in TeamMember
            await index_1.prisma.teamMember.upsert({
                where: { email: normalizedEmail },
                create: {
                    name,
                    email: normalizedEmail,
                    role: role === 'SALES' ? 'Sales Representative' : role,
                    department,
                    phone,
                    loginPassword: password,
                    companyName,
                    status: 'ACTIVE',
                    rating: 5.0
                },
                update: {
                    name,
                    role: role === 'SALES' ? 'Sales Representative' : role,
                    department,
                    phone,
                    loginPassword: password,
                    status: 'ACTIVE'
                }
            });
            return {
                success: true,
                message: `Login credentials reset and account reactivated for ${name} (${normalizedEmail})`,
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    department: updatedUser.department,
                    companyName: updatedUser.companyName,
                    loginPassword: password
                }
            };
        }
        const newUser = await index_1.prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                passwordHash,
                loginPassword: password,
                role: role,
                department,
                companyName,
                phone,
                plan: 'PRO', // Inherit company pro access
            }
        });
        // Also add or sync in TeamMember table
        await index_1.prisma.teamMember.upsert({
            where: { email: normalizedEmail },
            create: {
                name,
                email: normalizedEmail,
                role: role === 'SALES' ? 'Sales Representative' : role,
                department,
                phone,
                loginPassword: password,
                companyName,
                status: 'ACTIVE',
                rating: 5.0
            },
            update: {
                name,
                role: role === 'SALES' ? 'Sales Representative' : role,
                department,
                phone,
                loginPassword: password,
                status: 'ACTIVE'
            }
        });
        return {
            success: true,
            message: `Login credentials generated for ${name} (${normalizedEmail}) in department ${department}`,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department,
                companyName: newUser.companyName,
                loginPassword: password
            }
        };
    });
    // 5. Get current authenticated user profile
    server.get('/auth/me', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const userId = request.user.id;
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                companyName: true,
                department: true,
                phone: true,
                plan: true,
                trialEndsAt: true
            }
        });
        if (!user)
            return reply.code(404).send({ error: 'User not found' });
        return user;
    });
    // 6. Upgrade plan
    server.post('/auth/upgrade', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const userId = request.user.id;
        const user = await index_1.prisma.user.update({
            where: { id: userId },
            data: {
                plan: 'PRO',
                subscriptionStatus: 'ACTIVE',
            }
        });
        return user;
    });
}
