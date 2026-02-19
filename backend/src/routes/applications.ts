import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as appService from '../services/applications.js';

const router = Router();
router.use(authenticate);

// ─── Schemas ────────────────────────────────────────────────────────────────

const createAppSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  platform: z.string().min(1),
  jobUrl: z.string().url(),
  status: z.enum(['draft', 'submitted', 'rejected', 'interview', 'offer', 'withdrawn']).optional(),
  notes: z.string().optional(),
});

const updateAppSchema = z.object({
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'rejected', 'interview', 'offer', 'withdrawn']).optional(),
  notes: z.string().optional(),
});

const listQuerySchema = z.object({
  status: z.enum(['draft', 'submitted', 'rejected', 'interview', 'offer', 'withdrawn']).optional(),
  platform: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

router.get('/', validate(listQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await appService.listApplications(req.userId!, req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await appService.getStats(req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(createAppSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await appService.createApplication(req.userId!, req.body);
    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(updateAppSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await appService.updateApplication(req.userId!, req.params.id as string, req.body);
    res.json(app);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await appService.deleteApplication(req.userId!, req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
