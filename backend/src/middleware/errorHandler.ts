import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/index.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  // Prisma unique-constraint violation
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      error: {
        message: 'A record with that value already exists',
        code: 'CONFLICT',
      },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL',
    },
  });
}
