import type { AIProvider } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../utils/errors.js';
import { env } from '../../config/index.js';
import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';
import { buildCoverLetterPrompt, buildAnswerPrompt, buildSmartAnswerPrompt, buildResumeOptimizationPrompt } from './types.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenRouterProvider } from './openrouter.js';
import { LocalLLMProvider } from './local.js';

// ─── Provider Registry ──────────────────────────────────────────────────────

const providers = new Map<AIProvider, IAIProvider>();
providers.set('openai', new OpenAIProvider());
providers.set('anthropic', new AnthropicProvider());
providers.set('openrouter', new OpenRouterProvider());
providers.set('local', new LocalLLMProvider());

function getProvider(name: AIProvider): IAIProvider {
  const provider = providers.get(name);
  if (!provider) throw AppError.badRequest(`Unknown AI provider: ${name}`);
  return provider;
}

// ─── Config Helpers ─────────────────────────────────────────────────────────

async function getUserAIConfig(userId: string): Promise<ProviderConfig & { activeProvider: AIProvider }> {
  const config = await prisma.aIConfig.findUnique({ where: { userId } });
  if (!config) throw AppError.notFound('AI configuration not found. Please set up your AI provider.');

  // Merge: user keys take priority, fall back to server .env keys
  return {
    activeProvider: config.activeProvider,
    openaiApiKey: config.openaiApiKey || env.OPENAI_API_KEY || undefined,
    openaiModel: config.openaiModel,
    anthropicApiKey: config.anthropicApiKey || env.ANTHROPIC_API_KEY || undefined,
    anthropicModel: config.anthropicModel,
    openrouterApiKey: config.openrouterApiKey || env.OPENROUTER_API_KEY || undefined,
    openrouterModel: config.openrouterModel,
    localLlmUrl: config.localLlmUrl || env.LOCAL_LLM_URL || undefined,
    localLlmModel: config.localLlmModel || env.LOCAL_LLM_MODEL,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  };
}

export async function getAIConfig(userId: string) {
  const config = await prisma.aIConfig.findUnique({ where: { userId } });
  if (!config) throw AppError.notFound('AI configuration not found');

  // Strip API keys for response (only show masked versions)
  // If user has no key but server has one, show "Server key" indicator
  return {
    ...config,
    openaiApiKey: maskKey(config.openaiApiKey),
    anthropicApiKey: maskKey(config.anthropicApiKey),
    openrouterApiKey: maskKey(config.openrouterApiKey),
    // Tell the frontend whether a server-level key is available as fallback
    serverHasOpenaiKey: !!env.OPENAI_API_KEY,
    serverHasAnthropicKey: !!env.ANTHROPIC_API_KEY,
    serverHasOpenrouterKey: !!env.OPENROUTER_API_KEY,
  };
}

export async function updateAIConfig(userId: string, data: {
  activeProvider?: AIProvider;
  openaiApiKey?: string;
  openaiModel?: string;
  anthropicApiKey?: string;
  anthropicModel?: string;
  openrouterApiKey?: string;
  openrouterModel?: string;
  localLlmUrl?: string;
  localLlmModel?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return prisma.aIConfig.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// ─── Generation Functions ───────────────────────────────────────────────────

export async function generate(userId: string, options: AIGenerateOptions): Promise<AIGenerateResult> {
  const config = await getUserAIConfig(userId);
  const provider = getProvider(config.activeProvider);

  if (!provider.isAvailable(config)) {
    throw AppError.badRequest(
      `Provider "${config.activeProvider}" is not configured. Please add your API key in AI settings.`,
    );
  }

  try {
    return await provider.generate(options, config);
  } catch (err: any) {
    // Wrap provider-specific errors
    if (err instanceof AppError) throw err;
    throw AppError.badRequest(`AI generation failed (${config.activeProvider}): ${err.message}`);
  }
}

export async function generateCoverLetter(userId: string, jobDescription: string): Promise<AIGenerateResult> {
  const profile = await getFullProfile(userId);
  const prompt = buildCoverLetterPrompt(profile, jobDescription);
  return generate(userId, prompt);
}

export async function generateAnswer(userId: string, question: string, context?: string): Promise<AIGenerateResult> {
  const profile = await getFullProfile(userId);
  const prompt = buildAnswerPrompt(profile, question, context);
  return generate(userId, prompt);
}

export async function generateSmartAnswer(userId: string, data: {
  question: string;
  companyName?: string;
  companyInfo?: string;
  jobDescription?: string;
  jobUrl?: string;
  jobTitle?: string;
  maxLength?: number;
}): Promise<AIGenerateResult> {
  const profile = await getFullProfile(userId);
  const prompt = buildSmartAnswerPrompt(profile, data);
  return generate(userId, prompt);
}

export async function generateResumeOptimization(userId: string, jobDescription: string): Promise<AIGenerateResult> {
  const profile = await getFullProfile(userId);
  const prompt = buildResumeOptimizationPrompt(profile, jobDescription);
  return generate(userId, prompt);
}

export async function testConnection(userId: string, providerName?: AIProvider): Promise<{ success: boolean; message: string }> {
  const config = await getUserAIConfig(userId);
  const targetProvider = providerName || config.activeProvider;
  const provider = getProvider(targetProvider);

  if (!provider.isAvailable(config)) {
    return { success: false, message: `Provider "${targetProvider}" is not configured.` };
  }

  try {
    const result = await provider.generate(
      { prompt: 'Say "Connection successful!" in exactly those words.', maxTokens: 20 },
      config,
    );
    return { success: true, message: `Connected to ${targetProvider} (${result.model})` };
  } catch (err: any) {
    return { success: false, message: `Connection failed: ${err.message}` };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getFullProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experience: { orderBy: { startDate: 'desc' } },
      education: { orderBy: { startDate: 'desc' } },
      skills: true,
      customAnswers: true,
    },
  });
  if (!profile) throw AppError.notFound('Profile not found. Please set up your profile first.');
  return profile;
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? '***' : '';
  return key.slice(0, 4) + '...' + key.slice(-4);
}
