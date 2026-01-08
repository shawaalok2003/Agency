import { JWT } from '@fastify/jwt';

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            role: 'OWNER' | 'TEAM_MEMBER';
        };
    }
}
