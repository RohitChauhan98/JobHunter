import Anthropic from '@anthropic-ai/sdk';
import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';

export class AnthropicProvider implements IAIProvider {
  readonly name = 'anthropic' as const;

  isAvailable(config: ProviderConfig): boolean {
    return !!config.anthropicApiKey;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const client = new Anthropic({ apiKey: config.anthropicApiKey });
    const model = config.anthropicModel || 'claude-sonnet-4-20250514';

    const response = await client.messages.create({
      model,
      max_tokens: options.maxTokens ?? config.maxTokens ?? 1024,
      ...(options.systemPrompt && { system: options.systemPrompt }),
      messages: [{ role: 'user', content: options.prompt }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      text,
      provider: 'anthropic',
      model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }
}
