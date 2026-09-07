import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import applicationRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';
import billingRoutes from './routes/billing.js';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: [env.CORS_ORIGIN, /^chrome-extension:\/\//],
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      // Preserve raw body for Razorpay webhook signature verification
      if (req.url?.includes('/billing/webhook')) {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString('utf8');
      }
    },
  }),
);

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/billing', billingRoutes);

// ─── Error Handling ─────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
});

app.use(errorHandler);

// ─── Start ──────────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`🚀 JobHunter API running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});

export default app;
