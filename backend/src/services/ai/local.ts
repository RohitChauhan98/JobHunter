import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';

/**
 * Local LLM provider — supports any OpenAI-compatible local server:
 *   - Ollama (default, http://localhost:11434/v1)
 *   - LM Studio (http://localhost:1234/v1)
 *   - vLLM (http://localhost:8000/v1)
 *   - text-generation-webui (http://localhost:5000/v1)
 */
export class LocalLLMProvider implements IAIProvider {
  readonly name = 'local' as const;

  isAvailable(config: ProviderConfig): boolean {
    return !!config.localLlmUrl;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const baseUrl = (config.localLlmUrl || 'http://localhost:11434').replace(/\/+$/, '');
    const model = config.localLlmModel || 'llama3';

    // Build OpenAI-compatible messages
    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    // All major local LLM servers expose an OpenAI-compatible endpoint
    const endpoint = `${baseUrl}/v1/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? config.maxTokens ?? 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`Local LLM error (${response.status}): ${errorBody}`);
    }

    const data: any = await response.json();

    return {
      text: data.choices?.[0]?.message?.content || '',
      provider: 'local',
      model,
      tokensUsed: data.usage?.total_tokens,
    };
  }
}
