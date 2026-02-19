import OpenAI from 'openai';
import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';

export class OpenAIProvider implements IAIProvider {
  readonly name = 'openai' as const;

  isAvailable(config: ProviderConfig): boolean {
    return !!config.openaiApiKey;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const client = new OpenAI({ apiKey: config.openaiApiKey });
    const model = config.openaiModel || 'gpt-4o-mini';

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
      provider: 'openai',
      model,
      tokensUsed: response.usage?.total_tokens,
    };
  }
}
