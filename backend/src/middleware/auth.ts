import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or malformed token');
    }

    const token = header.slice(7);
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err: any) {
    if (err instanceof AppError) return next(err);
    next(AppError.unauthorized('Invalid or expired token'));
  }
}
