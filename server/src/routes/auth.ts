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
    companyName: z.string().optional(),
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
                companyName: companyName || normalizedEmail.split('@')[1]?.split('.')[0] || normalizedEmail.split('@')[0],
                department: department || (role === 'SALES' ? 'SALES' : 'MANAGEMENT'),
                plan: 'PRO',
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

        // Auto-assign companyName from email domain if missing
        if (!user.companyName && user.role === 'OWNER') {
            const derivedCompany = user.email.split('@')[1]?.split('.')[0] || user.email.split('@')[0];
            await prisma.user.update({
                where: { id: user.id },
                data: { companyName: derivedCompany, role: 'ADMIN', plan: 'PRO' }
            });
            user.companyName = derivedCompany;
            user.role = 'ADMIN' as any;
        }

        const resolvedCompany = user.companyName || user.email.split('@')[1]?.split('.')[0] || user.email.split('@')[0];
        const token = signToken({
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.role,
            companyName: resolvedCompany,
            department: user.department || 'MANAGEMENT',
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                role: user.role,
                companyName: resolvedCompany,
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

        const passwordHash = await bcrypt.hash(password, 10);
        const companyName = caller.companyName || caller.email.split('@')[1]?.split('.')[0] || caller.email.split('@')[0];

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            if (existing.role === 'OWNER') {
                return reply.code(400).send({ error: `Cannot overwrite primary Company Admin account` });
            }

            // Update existing user credentials and reactivate
            const updatedUser = await prisma.user.update({
                where: { id: existing.id },
                data: {
                    name,
                    passwordHash,
                    loginPassword: password,
                    role: role as any,
                    department,
                    companyName,
                    phone
                }
            });

            // Upsert in TeamMember
            await prisma.teamMember.upsert({
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

        const newUser = await prisma.user.create({
            data: {
                name,
                email: normalizedEmail,
                passwordHash,
                loginPassword: password,
                role: role as any,
                department,
                companyName,
                phone,
                plan: 'PRO',
            }
        });

        // Also add or sync in TeamMember table
        await prisma.teamMember.upsert({
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

    // 7. Admin: Delete any User account (non-owner) and all their data
    server.delete('/auth/users/:id', { preHandler: [authenticate] }, async (request, reply) => {
        const caller = (request as any).user;
        if (caller.role !== 'ADMIN' && caller.role !== 'OWNER') {
            return reply.code(403).send({ error: 'Access denied: Only Company Admin can delete user accounts.' });
        }

        const { id } = request.params as { id: string };

        const target = await prisma.user.findUnique({ where: { id } });
        if (!target) return reply.code(404).send({ error: 'User not found' });

        if (target.role === 'OWNER') {
            return reply.code(403).send({ error: 'Cannot delete the primary Owner account.' });
        }

        if (target.id === caller.id) {
            return reply.code(400).send({ error: 'You cannot delete your own account.' });
        }

        // Cascade delete associated records
        await prisma.dailyReport.deleteMany({ where: { userId: id } }).catch(() => {});
        await prisma.lead.deleteMany({ where: { ownerId: id } }).catch(() => {});
        await prisma.contact.deleteMany({ where: { userId: id } }).catch(() => {});
        await prisma.teamMember.deleteMany({ where: { email: target.email } }).catch(() => {});
        await prisma.user.delete({ where: { id } });

        return { success: true, message: `User ${target.name || target.email} removed permanently.` };
    });

    // 8. Admin: List all users in the same company
    server.get('/auth/users', { preHandler: [authenticate] }, async (request, reply) => {
        const caller = (request as any).user;
        if (caller.role !== 'ADMIN' && caller.role !== 'OWNER') {
            return reply.code(403).send({ error: 'Access denied.' });
        }
        const companyName = caller.companyName;
        const users = await prisma.user.findMany({
            where: companyName ? { companyName } : {},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                companyName: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return users;
    });
}
