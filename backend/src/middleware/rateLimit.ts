import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  /** Prefer userId when authenticated; otherwise IP. */
  keyFn?: (req: Request) => string;
}

/**
 * Lightweight in-memory rate limiter (single-process). Sufficient for
 * protecting auth and AI endpoints without adding a dependency.
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyFn } = options;
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Opportunistic cleanup to avoid unbounded growth
  const CLEANUP_EVERY = 200;
  let ops = 0;

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = keyFn?.(req) ?? req.userId ?? req.ip ?? 'unknown';
    const now = Date.now();

    ops += 1;
    if (ops % CLEANUP_EVERY === 0) {
      for (const [k, v] of hits) {
        if (v.resetAt < now) hits.delete(k);
      }
    }

    let entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      return next(AppError.tooManyRequests('Too many requests. Please try again later.'));
    }

    next();
  };
}
