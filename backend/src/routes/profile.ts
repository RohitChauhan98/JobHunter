import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as profileService from '../services/profile.js';

const router = Router();

// All profile routes require auth
router.use(authenticate);

// ─── Schemas ────────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  portfolioUrl: z.string().url().or(z.literal('')).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  summary: z.string().optional(),
  resumeUrl: z.string().url().or(z.literal('')).optional(),
  resumeFileName: z.string().optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  gpa: z.string().optional(),
});

const skillsSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string().min(1),
      category: z.enum(['technical', 'soft', 'language']),
      proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    }),
  ),
});

const customAnswerSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const preferencesSchema = z.object({
  roles: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  remoteOnly: z.boolean().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().optional(),
});

// ─── Full Profile ───────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfile(req.userId!);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

router.put('/', validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.updateProfile(req.userId!, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// ─── Experience ─────────────────────────────────────────────────────────────

router.post('/experience', validate(experienceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exp = await profileService.addExperience(req.userId!, req.body);
    res.status(201).json(exp);
  } catch (err) {
    next(err);
  }
});

router.put('/experience/:id', validate(experienceSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exp = await profileService.updateExperience(req.userId!, req.params.id as string, req.body);
    res.json(exp);
  } catch (err) {
    next(err);
  }
});

router.delete('/experience/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await profileService.deleteExperience(req.userId!, req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ─── Education ──────────────────────────────────────────────────────────────

router.post('/education', validate(educationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const edu = await profileService.addEducation(req.userId!, req.body);
    res.status(201).json(edu);
  } catch (err) {
    next(err);
  }
});

router.put('/education/:id', validate(educationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const edu = await profileService.updateEducation(req.userId!, req.params.id as string, req.body);
    res.json(edu);
  } catch (err) {
    next(err);
  }
});

router.delete('/education/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await profileService.deleteEducation(req.userId!, req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ─── Skills ─────────────────────────────────────────────────────────────────

router.put('/skills', validate(skillsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await profileService.setSkills(req.userId!, req.body.skills);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Custom Answers ─────────────────────────────────────────────────────────

router.post('/custom-answers', validate(customAnswerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const answer = await profileService.addCustomAnswer(req.userId!, req.body.question, req.body.answer);
    res.status(201).json(answer);
  } catch (err) {
    next(err);
  }
});

router.put('/custom-answers/:id', validate(customAnswerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const answer = await profileService.updateCustomAnswer(req.userId!, req.params.id as string, req.body);
    res.json(answer);
  } catch (err) {
    next(err);
  }
});

router.delete('/custom-answers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await profileService.deleteCustomAnswer(req.userId!, req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ─── Preferences ────────────────────────────────────────────────────────────

router.put('/preferences', validate(preferencesSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prefs = await profileService.upsertPreferences(req.userId!, req.body);
    res.json(prefs);
  } catch (err) {
    next(err);
  }
});

export default router;
