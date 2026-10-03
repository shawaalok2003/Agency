import nodemailer from 'nodemailer';

const getSmtpConfig = () => {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
    // Support environment variables from cloud deployment (Render, Vercel, Railway, etc.),
    // with reliable default fallback to the configured agnecyos Google SMTP credentials.
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || 'aalokentre22@gmail.com').trim();
    const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || 'dmre boyu hnwl jaou').trim();
    const from = process.env.EMAIL_FROM?.trim() || `agnecyos <${user}>`;
    const isConfigured = Boolean(user && pass && pass !== 'your_16_character_app_password');

    return { host, port, user, pass, from, isConfigured };
};

function createTransporter(portNumber: number) {
    const config = getSmtpConfig();
    return nodemailer.createTransport({
        host: config.host,
        port: portNumber,
        secure: portNumber === 465, // true for 465, false for 587
        requireTLS: portNumber === 587,
        auth: {
            user: config.user,
            pass: config.pass,
        },
        family: 4, // CRITICAL FOR RENDER: Force IPv4 to prevent ENETUNREACH!
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    } as any);
}

// Base responsive HTML wrapper for agnecyos branded emails
function emailTemplateWrapper(contentHtml: string, previewText: string = ''): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>agnecyos Notification</title>
        <style>
            body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }
            .container { max-width: 580px; margin: 30px auto; background-color: #0a0f1d; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { padding: 32px 36px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(10, 15, 29, 0) 100%); }
            .content { padding: 36px 36px 28px; }
            .otp-box { margin: 28px 0; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 24px; text-align: center; }
            .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #818cf8; font-family: 'Courier New', monospace; }
            .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin-top: 16px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }
            .footer { padding: 20px 36px 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid rgba(255, 255, 255, 0.06); }
            .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 6px; letter-spacing: 0.5px; }
            .badge-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
            .badge-green { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
            .badge-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
            .info-label { color: #9ca3af; }
            .info-val { color: #f3f4f6; font-weight: 600; }
        </style>
    </head>
    <body>
        <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
            ${previewText}
        </div>
        <div class="container">
            <div class="header">
                <div style="display:inline-block; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    agnecy<span style="color: #818cf8;">os</span>
                </div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">The Modern Agency Operating System</div>
            </div>
            <div class="content">
                ${contentHtml}
            </div>
            <div class="footer">
                <p style="margin: 0 0 6px;">Sent by agnecyos Automated Notification Engine.</p>
                <p style="margin: 0;">Configure your notification preferences anytime inside your workspace settings.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// 1. Send OTP Email for User Registration & Verification
export async function sendOtpEmail(to: string, otp: string) {
    const config = getSmtpConfig();

    const subject = `Your agnecyos Verification Code: ${otp}`;
    const contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
            <span class="badge badge-indigo">Verification Required</span>
            <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 14px 0 6px;">Confirm your account</h2>
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">Use the single-use OTP below to complete authentication in your agnecyos workspace.</p>
        </div>

        <div class="otp-box">
            <div style="font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1.5px; margin-bottom: 8px;">6-Digit OTP Code</div>
            <div class="otp-code">${otp}</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 10px;">Expires in 10 minutes</div>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
            If you did not request this verification code, please ignore this email. Do not share this OTP with anyone.
        </p>
    `;

    const html = emailTemplateWrapper(contentHtml, `Your verification code is ${otp}. Valid for 10 minutes.`);
    const text = `Your agnecyos verification code is: ${otp}\n\nThis 6-digit security code expires in 10 minutes.\nIf you did not request this code, please ignore this email.`;

    if (config.isConfigured) {
        const mailOptions = {
            from: config.from,
            replyTo: config.user,
            to,
            subject,
            text,
            html,
            priority: 'high' as const,
            headers: {
                'X-Priority': '1 (Highest)',
                'X-MSMail-Priority': 'High',
                'Importance': 'High',
            }
        };

        // 1. Try Port 587 STARTTLS first (Standard for cloud platforms like Render)
        try {
            const transporter587 = createTransporter(587);
            const info = await transporter587.sendMail(mailOptions);
            console.log(`[Google SMTP 587] OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
            return { success: true, messageId: info.messageId, port: 587 };
        } catch (err587: any) {
            console.warn(`[Google SMTP 587 Failed] ${err587.message}. Retrying on port 465 SSL...`);
            // 2. Fallback to Port 465 SSL
            try {
                const transporter465 = createTransporter(465);
                const info = await transporter465.sendMail(mailOptions);
                console.log(`[Google SMTP 465] OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
                return { success: true, messageId: info.messageId, port: 465 };
            } catch (err465: any) {
                console.error(`[Google SMTP Error] Both port 587 and 465 failed:`, err465.message);
                return { success: false, error: `Port 587: ${err587.message} | Port 465: ${err465.message}` };
            }
        }
    } else {
        console.log(`\n================== [AGNECYOS GOOGLE SMTP SIMULATION] ==================`);
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`OTP CODE: ${otp}`);
        console.log(`STATUS: Gmail credentials not yet configured in server/.env.`);
        console.log(`TO ENABLE LIVE EMAILS: Add SMTP_USER and SMTP_PASS (Google App Password) in server/.env`);
        console.log(`========================================================================\n`);
        return { success: true, simulated: true, otp };
    }
}

// 2. Generic Process & Operations Update Notification
export interface ProcessUpdatePayload {
    to: string;
    category: 'TASK' | 'LEAD' | 'INVOICE' | 'APPROVAL' | 'PROJECT';
    title: string;
    description: string;
    projectName?: string;
    metaDetails?: Array<{ label: string; value: string }>;
    actionUrl?: string;
    actionText?: string;
}

export async function sendProcessUpdateEmail(payload: ProcessUpdatePayload) {
    const config = getSmtpConfig();

    const categoryBadgeClass =
        payload.category === 'APPROVAL' ? 'badge-green' :
        payload.category === 'INVOICE' ? 'badge-amber' :
        'badge-indigo';

    const detailsRowsHtml = payload.metaDetails && payload.metaDetails.length > 0
        ? `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 18px; margin: 20px 0;">
            ${payload.metaDetails.map(item => `
                <div style="padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between;">
                    <span style="color: #9ca3af; font-size: 13px;">${item.label}</span>
                    <span style="color: #f3f4f6; font-size: 13px; font-weight: 600;">${item.value}</span>
                </div>
            `).join('')}
        </div>
        `
        : '';

    const actionButtonHtml = payload.actionUrl
        ? `
        <div style="text-align: center; margin-top: 26px;">
            <a href="${payload.actionUrl}" class="button" target="_blank">
                ${payload.actionText || 'View Details in agnecyos'} &rarr;
            </a>
        </div>
        `
        : '';

    const contentHtml = `
        <div style="margin-bottom: 20px;">
            <span class="badge ${categoryBadgeClass}">${payload.category} UPDATE</span>
            ${payload.projectName ? `<span style="font-size: 12px; color: #818cf8; margin-left: 8px; font-weight: 600;">${payload.projectName}</span>` : ''}
            <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 14px 0 8px;">${payload.title}</h2>
            <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">${payload.description}</p>
        </div>

        ${detailsRowsHtml}
        ${actionButtonHtml}
    `;

    const subject = `[agnecyos] ${payload.title}`;
    const html = emailTemplateWrapper(contentHtml, payload.description);

    if (config.isConfigured) {
        const mailOptions = {
            from: config.from,
            replyTo: config.user,
            to: payload.to,
            subject,
            text: `${payload.title}\n\n${payload.description}`,
            html,
        };

        try {
            const transporter587 = createTransporter(587);
            const info = await transporter587.sendMail(mailOptions);
            console.log(`[Google SMTP 587] Process update email (${payload.category}) sent to ${payload.to}.`);
            return { success: true, messageId: info.messageId };
        } catch (err587: any) {
            console.warn(`[Google SMTP 587 Failed] Retrying process update on port 465...`);
            try {
                const transporter465 = createTransporter(465);
                const info = await transporter465.sendMail(mailOptions);
                console.log(`[Google SMTP 465] Process update email (${payload.category}) sent to ${payload.to}.`);
                return { success: true, messageId: info.messageId };
            } catch (err465: any) {
                console.error(`[Google SMTP Error] Process update failed to send to ${payload.to}:`, err465.message);
                return { success: false, error: err465.message };
            }
        }
    } else {
        console.log(`\n================== [AGNECYOS PROCESS UPDATE SIMULATION] ==================`);
        console.log(`CATEGORY: ${payload.category}`);
        console.log(`TO: ${payload.to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`DESCRIPTION: ${payload.description}`);
        console.log(`==========================================================================\n`);
        return { success: true, simulated: true };
    }
}
