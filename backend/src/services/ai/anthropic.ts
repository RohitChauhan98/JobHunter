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

  // Anthropic has no public list-models endpoint — return the current lineup.
  async listModels(): Promise<string[]> {
    return [
      'claude-opus-4-1-20250805',
      'claude-sonnet-4-5-20250929',
      'claude-sonnet-4-20250514',
      'claude-haiku-4-5-20251001',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-haiku-20241022',
    ];
  }
}
