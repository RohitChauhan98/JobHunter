import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/errors.js';

/**
 * Validate request body / query / params with a Zod schema.
 * Usage: router.post('/foo', validate(schema), handler)
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      return next(AppError.badRequest(messages.join('; '), 'VALIDATION_ERROR'));
    }
    req[source] = result.data;
    next();
  };
}
