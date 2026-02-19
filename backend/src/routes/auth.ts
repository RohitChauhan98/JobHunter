import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import * as authService from '../services/auth.js';

const router = Router();

// ─── Schemas ────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
