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
const emailService_1 = require("../services/emailService");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    otp: zod_1.z.string().min(6).max(6, '6-digit OTP code is required'),
    role: zod_1.z.enum(['OWNER', 'TEAM_MEMBER']).default('OWNER'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    otp: zod_1.z.string().min(6).max(6).optional(),
});
async function authRoutes(server) {
    // 1. Send OTP to email for registration / verification
    server.post('/auth/send-otp', async (request, reply) => {
        const { email } = request.body;
        if (!email || !email.includes('@')) {
            return reply.code(400).send({ error: 'A valid email address is required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Check if user already exists
        const existingUser = await index_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return reply.code(400).send({ error: 'An account with this email already exists. Please sign in.' });
        }
        // Generate 6-digit cryptographic-style numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        try {
            // Delete old OTPs for this email
            await index_1.prisma.otpVerification.deleteMany({
                where: { email: normalizedEmail }
            });
            // Save new OTP
            await index_1.prisma.otpVerification.create({
                data: {
                    email: normalizedEmail,
                    otp,
                    expiresAt,
                }
            });
            console.log(`\n========================================================\n🔑 [AGNECYOS OTP CODE FOR ${normalizedEmail}]: ${otp}\n========================================================\n`);
            // Dispatch Email via HTTPS / SMTP
            const emailResult = await (0, emailService_1.sendOtpEmail)(normalizedEmail, otp);
            if (!emailResult.success) {
                console.warn(`[Send OTP Warning]: Cloud host delivery issue (${emailResult.error}). Code logged above.`);
            }
            return {
                success: true,
                message: `6-digit verification code sent to ${normalizedEmail}`,
                simulated: false,
                devOtp: (process.env.NODE_ENV !== 'production') ? otp : undefined
            };
        }
        catch (error) {
            console.error('[Send OTP Error]', error);
            return reply.code(500).send({ error: 'Failed to generate or send verification code' });
        }
    });
    // 2. Verify OTP
    server.post('/auth/verify-otp', async (request, reply) => {
        const { email, otp } = request.body;
        if (!email || !otp) {
            return reply.code(400).send({ error: 'Email and 6-digit OTP code are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const trimmedOtp = otp.trim();
        const record = await index_1.prisma.otpVerification.findFirst({
            where: {
                email: normalizedEmail,
                otp: trimmedOtp,
                expiresAt: { gt: new Date() }
            }
        });
        if (!record) {
            return reply.code(400).send({ error: 'Invalid or expired OTP. Please check your email or request a new code.' });
        }
        return { success: true, verified: true };
    });
    // 3. Register user (with OTP verification)
    server.post('/auth/register', async (request, reply) => {
        const result = registerSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error.errors[0]?.message || 'Invalid input data' });
        }
        const { email, password, role, otp } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await index_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existingUser) {
            return reply.code(400).send({ error: 'An account with this email already exists' });
        }
        // Verify OTP if submitted
        if (otp) {
            const validOtp = await index_1.prisma.otpVerification.findFirst({
                where: {
                    email: normalizedEmail,
                    otp: otp.trim(),
                    expiresAt: { gt: new Date() }
                }
            });
            if (!validOtp) {
                return reply.code(400).send({ error: 'Invalid or expired OTP verification code.' });
            }
            // Clean up used OTP
            await index_1.prisma.otpVerification.deleteMany({
                where: { email: normalizedEmail }
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() + 14); // 14-day trial
        const user = await index_1.prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash: hashedPassword,
                role: role,
                trialEndsAt: trialDate,
            },
        });
        // Send welcome email asynchronously
        (0, emailService_1.sendProcessUpdateEmail)({
            to: user.email,
            category: 'PROJECT',
            title: 'Welcome to agnecyos! 🚀',
            description: 'Your agnecyos workspace is now active. You have full Pro access with unlimited projects, GST invoicing, CRM pipelines, and client portals.',
            metaDetails: [
                { label: 'Registered Email', value: user.email },
                { label: 'Role', value: user.role },
                { label: 'Pro Trial Period', value: '14 Days' },
                { label: 'Status', value: 'Active' }
            ],
            actionText: 'Open Dashboard',
            actionUrl: 'http://localhost:3000'
        }).catch(err => console.error('[Welcome Email Error]', err));
        const token = (0, auth_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    });
    // 4. User Login (Two-Factor OTP Required)
    server.post('/auth/login', async (request, reply) => {
        const result = loginSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: result.error });
        }
        const { email, password, otp } = result.data;
        const normalizedEmail = email.toLowerCase().trim();
        const user = await index_1.prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }
        // If OTP is not provided, send 2FA OTP code to user's email
        if (!otp) {
            const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await index_1.prisma.otpVerification.deleteMany({ where: { email: normalizedEmail } });
            await index_1.prisma.otpVerification.create({
                data: {
                    email: normalizedEmail,
                    otp: loginOtp,
                    expiresAt,
                }
            });
            console.log(`\n========================================================\n🔑 [AGNECYOS 2FA LOGIN CODE FOR ${normalizedEmail}]: ${loginOtp}\n========================================================\n`);
            // Dispatch Email via HTTPS / SMTP
            const emailResult = await (0, emailService_1.sendOtpEmail)(normalizedEmail, loginOtp);
            if (!emailResult.success) {
                console.warn(`[Login OTP Warning]: Cloud host delivery issue (${emailResult.error}). Code logged above.`);
            }
            return reply.code(200).send({
                requireOtp: true,
                email: normalizedEmail,
                message: `Security verification code sent to ${normalizedEmail}`,
                simulated: false,
                devOtp: (process.env.NODE_ENV !== 'production') ? loginOtp : undefined
            });
        }
        // Verify submitted OTP
        const validOtp = await index_1.prisma.otpVerification.findFirst({
            where: {
                email: normalizedEmail,
                otp: otp.trim(),
                expiresAt: { gt: new Date() }
            }
        });
        if (!validOtp) {
            return reply.code(400).send({ error: 'Invalid or expired OTP verification code. Please check your email or request a new code.' });
        }
        // Delete used OTP
        await index_1.prisma.otpVerification.deleteMany({ where: { email: normalizedEmail } });
        const token = (0, auth_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, role: user.role } };
    });
    // 5. Test Google SMTP Connection
    server.post('/auth/test-smtp', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const userEmail = request.user.email;
        const { targetEmail } = request.body;
        const recipient = targetEmail || userEmail;
        const result = await (0, emailService_1.sendProcessUpdateEmail)({
            to: recipient,
            category: 'PROJECT',
            title: 'Google SMTP Test Notification',
            description: 'Your Google SMTP integration with agnecyos is verified and functioning smoothly!',
            metaDetails: [
                { label: 'Server Time', value: new Date().toISOString() },
                { label: 'Recipient', value: recipient },
                { label: 'Status', value: 'Verified' }
            ],
            actionText: 'Go to Dashboard',
            actionUrl: 'http://localhost:3000'
        });
        return { success: true, result, recipient };
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
