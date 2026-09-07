import type { AIProvider } from '@prisma/client';
import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../utils/errors.js';
import { env } from '../../config/index.js';
import { assertSafeLocalLlmUrl } from '../../utils/localLlmUrl.js';
import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';
import { buildCoverLetterPrompt, buildAnswerPrompt, buildSmartAnswerPrompt, buildResumeOptimizationPrompt } from './types.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenRouterProvider } from './openrouter.js';
import { LocalLLMProvider } from './local.js';
import { OllamaProvider } from './ollama.js';
import { GLMProvider } from './glm.js';

const API_KEY_FIELDS = ['openaiApiKey', 'anthropicApiKey', 'openrouterApiKey', 'localLlmApiKey', 'ollamaApiKey', 'glmApiKey'] as const;

// ─── Provider Registry ──────────────────────────────────────────────────────

const providers = new Map<AIProvider, IAIProvider>();
providers.set('openai', new OpenAIProvider());
providers.set('anthropic', new AnthropicProvider());
providers.set('openrouter', new OpenRouterProvider());
providers.set('local', new LocalLLMProvider());
providers.set('ollama', new OllamaProvider());
providers.set('glm', new GLMProvider());

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
    localLlmApiKey: config.localLlmApiKey || undefined,
    ollamaUrl: config.ollamaUrl || env.LOCAL_LLM_URL || undefined,
    ollamaModel: config.ollamaModel || env.LOCAL_LLM_MODEL,
    ollamaApiKey: config.ollamaApiKey || undefined,
    glmApiKey: config.glmApiKey || env.GLM_API_KEY || undefined,
    glmModel: config.glmModel,
    glmBaseUrl: config.glmBaseUrl || undefined,
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
    localLlmApiKey: maskKey(config.localLlmApiKey),
    ollamaApiKey: maskKey(config.ollamaApiKey),
    glmApiKey: maskKey(config.glmApiKey),
    // Tell the frontend whether a server-level key is available as fallback
    serverHasOpenaiKey: !!env.OPENAI_API_KEY,
    serverHasAnthropicKey: !!env.ANTHROPIC_API_KEY,
    serverHasOpenrouterKey: !!env.OPENROUTER_API_KEY,
    serverHasGlmKey: !!env.GLM_API_KEY,
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
  localLlmApiKey?: string;
  localLlmUrl?: string;
  localLlmModel?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  ollamaApiKey?: string;
  glmApiKey?: string;
  glmModel?: string;
  glmBaseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  // Drop masked/empty keys so a settings "save" cannot overwrite real secrets
  // with values like "sk-o...xxxx" that the GET endpoint returns.
  const cleaned: typeof data = { ...data };
  for (const field of API_KEY_FIELDS) {
    if (isMaskedOrEmptyKey(cleaned[field])) {
      delete cleaned[field];
    }
  }

  if (cleaned.localLlmUrl !== undefined) {
    if (!cleaned.localLlmUrl.trim()) {
      cleaned.localLlmUrl = '';
    } else {
      cleaned.localLlmUrl = assertSafeLocalLlmUrl(cleaned.localLlmUrl);
    }
  }

  if (cleaned.ollamaUrl !== undefined) {
    if (!cleaned.ollamaUrl.trim()) {
      cleaned.ollamaUrl = '';
    } else {
      cleaned.ollamaUrl = assertSafeLocalLlmUrl(cleaned.ollamaUrl);
    }
  }

  await prisma.aIConfig.upsert({
    where: { userId },
    create: { userId, ...cleaned },
    update: cleaned,
  });

  // Always return the masked view — never plaintext keys
  return getAIConfig(userId);
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
    if (err instanceof AppError) throw err;
    console.error(`[AI] Generation failed (${config.activeProvider}):`, err?.message || err);
    throw AppError.badRequest(
      `AI generation failed (${config.activeProvider}). Check your provider settings and try again.`,
      'AI_PROVIDER_ERROR',
    );
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
    console.error(`[AI] Connection test failed (${targetProvider}):`, err?.message || err);
    // Surface the real cause instead of a generic key/model hint
    let hint = `Connection failed for ${targetProvider}.`;
    const msg = String(err?.message || '');
    if (targetProvider === 'ollama' || targetProvider === 'local') {
      if (msg.includes('HTTP 404') || /not found|no such model/i.test(msg)) {
        hint += ` The model is not installed on the server. Run "ollama pull <model>" (check "ollama list"), then retry.`;
      } else if (msg.includes('HTTP 401') || msg.includes('HTTP 403')) {
        hint += ` The server rejected the API key.`;
      } else if (/fetch failed|ECONNREFUSED|ENOTFOUND|timeout/i.test(msg)) {
        hint += ` Cannot reach the server — is it running at the configured URL?`;
      } else {
        hint += ` Check the server URL, key, and model.`;
      }
    } else if (msg.includes('HTTP 401') || msg.includes('401') || /api key/i.test(msg)) {
      hint += ` The API key looks invalid.`;
    } else if (/quota|billing|429|402/i.test(msg)) {
      hint += ` Your account may be out of quota or needs billing set up.`;
    } else if (msg) {
      hint += ` ${msg}`;
    }
    return { success: false, message: hint };
  }
}

/** List available model IDs for a provider (for settings UI dropdowns). */
export async function listModels(userId: string, providerName: AIProvider): Promise<string[]> {
  const config = await getUserAIConfig(userId);
  const provider = getProvider(providerName);
  if (!provider.listModels) {
    throw AppError.badRequest(`Listing models is not supported for ${providerName}.`);
  }
  if (!provider.isAvailable(config)) {
    throw AppError.badRequest(`Provider "${providerName}" is not configured — add your API key or server URL first.`);
  }
  try {
    return await provider.listModels(config);
  } catch (err: any) {
    console.error(`[AI] listModels failed (${providerName}):`, err?.message || err);
    throw AppError.badRequest(
      providerName === 'ollama' || providerName === 'local'
        ? `Could not reach the local server to list models. Check it is running.`
        : `Could not fetch models for ${providerName} — check your API key.`,
    );
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

/** True when the client sent back a masked placeholder or blank key. */
function isMaskedOrEmptyKey(key: string | undefined): boolean {
  if (key === undefined || key === null) return true;
  const trimmed = key.trim();
  if (!trimmed) return true;
  if (trimmed === '***') return true;
  if (trimmed.includes('...')) return true;
  return false;
}
