import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as aiService from '../services/ai/index.js';

const router = Router();
router.use(authenticate);

// ─── Schemas ────────────────────────────────────────────────────────────────

const generateSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
});

const coverLetterSchema = z.object({
  jobDescription: z.string().min(10, 'Job description is required'),
});

const answerSchema = z.object({
  question: z.string().min(1),
  context: z.string().optional(),
});

const resumeOptSchema = z.object({
  jobDescription: z.string().min(10),
});

const updateConfigSchema = z.object({
  activeProvider: z.enum(['openai', 'anthropic', 'openrouter', 'local']).optional(),
  openaiApiKey: z.string().optional(),
  openaiModel: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  anthropicModel: z.string().optional(),
  openrouterApiKey: z.string().optional(),
  openrouterModel: z.string().optional(),
  localLlmUrl: z.string().optional(),
  localLlmModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
});

const testConnectionSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'openrouter', 'local']).optional(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// Raw generation
router.post('/generate', validate(generateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generate(req.userId!, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Cover letter generation
router.post('/cover-letter', validate(coverLetterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generateCoverLetter(req.userId!, req.body.jobDescription);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Answer generation
router.post('/answer', validate(answerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generateAnswer(req.userId!, req.body.question, req.body.context);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Resume optimization
router.post('/resume-optimize', validate(resumeOptSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.generateResumeOptimization(req.userId!, req.body.jobDescription);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// AI config
router.get('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await aiService.getAIConfig(req.userId!);
    res.json(config);
  } catch (err) {
    next(err);
  }
});

router.put('/config', validate(updateConfigSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await aiService.updateAIConfig(req.userId!, req.body);
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// Test connection
router.post('/test-connection', validate(testConnectionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await aiService.testConnection(req.userId!, req.body.provider);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
