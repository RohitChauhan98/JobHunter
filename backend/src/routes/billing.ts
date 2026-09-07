import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { AppError } from '../utils/errors.js';
import { verifyToken } from '../utils/jwt.js';
import * as billing from '../services/billing/index.js';
import { PAID_PLAN_IDS } from '../services/billing/plans.js';

const router = Router();

const checkoutLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const donateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const checkoutSchema = z.object({
  planId: z.enum(PAID_PLAN_IDS as [string, ...string[]]),
});

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

const donateSchema = z.object({
  amount: z.number().int().min(1000).max(10_000_000),
  email: z.string().email().optional(),
  message: z.string().max(500).optional(),
});

/** Optional auth — attaches userId when Bearer token present. */
function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.userId;
  } catch {
    // ignore invalid token for public donate
  }
  next();
}

// ─── Public ─────────────────────────────────────────────────────────────────

router.get('/plans', (_req, res) => {
  res.json(billing.listPlansPublic());
});

// ─── Authenticated billing ──────────────────────────────────────────────────

router.get('/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await billing.getBillingStatus(req.userId!);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/checkout',
  authenticate,
  checkoutLimit,
  validate(checkoutSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await billing.createCheckout(req.userId!, req.body.planId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/verify',
  authenticate,
  validate(verifySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await billing.verifyCheckout(req.userId!, req.body);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
);

// ─── Donations (auth optional) ──────────────────────────────────────────────

router.post(
  '/donate',
  donateLimit,
  optionalAuth,
  validate(donateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await billing.createDonation({
        userId: req.userId,
        amount: req.body.amount,
        email: req.body.email,
        message: req.body.message,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/donate/verify',
  optionalAuth,
  validate(verifySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await billing.verifyDonation({
        ...req.body,
        userId: req.userId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// ─── Webhook (raw body attached in index.ts) ────────────────────────────────

router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const raw =
      typeof (req as any).rawBody === 'string'
        ? (req as any).rawBody
        : JSON.stringify(req.body);

    if (typeof signature !== 'string') {
      throw AppError.unauthorized('Missing webhook signature');
    }

    const result = await billing.handleWebhook(raw, signature);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
