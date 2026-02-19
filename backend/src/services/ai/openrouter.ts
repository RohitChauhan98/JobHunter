import OpenAI from 'openai';
import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';

/**
 * OpenRouter provides access to many models via an OpenAI-compatible API.
 * See: https://openrouter.ai/docs
 */
export class OpenRouterProvider implements IAIProvider {
  readonly name = 'openrouter' as const;

  private static BASE_URL = 'https://openrouter.ai/api/v1';

  isAvailable(config: ProviderConfig): boolean {
    return !!config.openrouterApiKey;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const client = new OpenAI({
      apiKey: config.openrouterApiKey,
      baseURL: OpenRouterProvider.BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': 'https://jobhunter.app',
        'X-Title': 'JobHunter',
      },
    });

    const model = config.openrouterModel || 'anthropic/claude-sonnet-4-20250514';

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
      provider: 'openrouter',
      model,
      tokensUsed: response.usage?.total_tokens,
    };
  }
}
