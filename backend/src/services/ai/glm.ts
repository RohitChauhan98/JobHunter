import OpenAI from 'openai';
import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';

/**
 * GLM provider — Z.ai's OpenAI-compatible chat completions API.
 * Docs: https://docs.z.ai/
 */
export class GLMProvider implements IAIProvider {
  readonly name = 'glm' as const;

  isAvailable(config: ProviderConfig): boolean {
    return !!config.glmApiKey;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const client = new OpenAI({
      apiKey: config.glmApiKey,
      baseURL: config.glmBaseUrl || 'https://api.z.ai/api/paas/v4',
    });

    const model = config.glmModel || 'glm-4.6';

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? config.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? config.maxTokens ?? 1024,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      provider: 'glm',
      model,
      tokensUsed: response.usage?.total_tokens,
    };
  }

  // Z.ai has no public list-models endpoint — return the current lineup.
  async listModels(): Promise<string[]> {
    return ['glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4.5-flash'];
  }
}