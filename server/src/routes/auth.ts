import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../index';
import { signToken, authenticate } from '../utils/auth';
import { sendOtpEmail, sendProcessUpdateEmail } from '../services/emailService';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    companyName: z.string().default('dhandaeasy'),
    role: z.enum(['OWNER', 'ADMIN', 'SALES', 'DEVELOPER', 'DESIGNER', 'OPERATIONS', 'TEAM_MEMBER']).default('OWNER'),
    department: z.string().default('MANAGEMENT'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function authRoutes(server: FastifyInstance) {
    // 1. Send OTP (legacy route kept for compatibility)
    server.post('/auth/send-otp', async (request, reply) => {
        const { email } = request.body as { email?: string };
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

        const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return reply.code(400).send({ error: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 14); // 14-day trial

        const user = await prisma.user.create({
            data: {
                name: name || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                passwordHash: hashedPassword,
                role: role as any,
                companyName: companyName || 'dhandaeasy',
                department: department || (role === 'SALES' ? 'SALES' : 'MANAGEMENT'),
                trialEndsAt: trialDate,
            },
        });

        const token = signToken({
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

        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }

        // Auto-assign companyName dhandaeasy if missing
        if (!user.companyName && (user.email === 'aalokshaw2003@gmail.com' || user.role === 'OWNER')) {
            await prisma.user.update({
                where: { id: user.id },
                data: { companyName: 'dhandaeasy', role: 'ADMIN' }
            });
            user.companyName = 'dhandaeasy';
            user.role = 'ADMIN' as any;
        }

        const token = signToken({
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
    server.post('/auth/create-team-user', { preHandler: [authenticate] }, async (request, reply) => {
        const caller = (request as any).user;
        if (caller.role !== 'OWNER' && caller.role !== 'ADMIN') {
            return reply.code(403).send({ error: 'Access denied: Only Company Admins can create team accounts' });
        }

        const schema = z.object({
            name: z.string().min(1, 'Name is required'),
            email: z.string().email('Valid email is required'),
            password: z.string().min(6, 'Password must be at least 6 characters'),
            role: z.enum(['ADMIN', 'SALES', 'DEVELOPER', 'DESIGNER', 'OPERATIONS', 'TEAM_MEMBER']).default('SALES'),
            department: z.string().default('SALES'),
            phone: z.string().optional(),
        });

        const result = schema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid team user input' });
        }

        const { name, email, password, role, department, phone } = result.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            return reply.code(409).send({ error: `An account with email ${normalizedEmail} already exists` });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const companyName = caller.companyName || 'dhandaeasy';

        const newUser = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                passwordHash,
                role: role as any,
                department,
                companyName,
                phone,
                plan: 'PRO', // Inherit company pro access
            }
        });

        // Also add or sync in TeamMember table
        const existingMember = await prisma.teamMember.findUnique({ where: { email: normalizedEmail } });
        if (!existingMember) {
            await prisma.teamMember.create({
                data: {
                    name,
                    email: normalizedEmail,
                    role: role === 'SALES' ? 'Sales Representative' : role,
                    department,
                    phone,
                    companyName,
                    status: 'ACTIVE',
                    rating: 5.0
                }
            });
        }

        return {
            success: true,
            message: `Login credentials generated for ${name} (${normalizedEmail}) in department ${department}`,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department,
                companyName: newUser.companyName
            }
        };
    });

    // 5. Get current authenticated user profile
    server.get('/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;
        const user = await prisma.user.findUnique({
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
        if (!user) return reply.code(404).send({ error: 'User not found' });
        return user;
    });

    // 6. Upgrade plan
    server.post('/auth/upgrade', { preHandler: [authenticate] }, async (request, reply) => {
        const userId = (request as any).user.id;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                plan: 'PRO',
                subscriptionStatus: 'ACTIVE',
            }
        });

        return user;
    });
}
