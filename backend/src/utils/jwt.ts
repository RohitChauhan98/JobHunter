import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/index.js';

export interface JwtPayload {
  userId: string;
}

const payloadSchema = z.object({
  userId: z.string().min(1),
});

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string,
    algorithm: 'HS256',
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  return payloadSchema.parse(decoded);
}
