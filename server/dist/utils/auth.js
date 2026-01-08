"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (e) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const authenticate = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, exports.verifyToken)(token);
        if (!decoded) {
            return reply.code(401).send({ error: 'Invalid token' });
        }
        request.user = decoded;
    }
    catch (err) {
        reply.code(401).send({ error: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
