import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';
import { assertSafeLocalLlmUrl } from '../../utils/localLlmUrl.js';

/**
 * Ollama provider — uses Ollama's native API (http://localhost:11434/api/chat).
 *
 * Only loopback hosts are allowed (SSRF protection).
 */
export class OllamaProvider implements IAIProvider {
  readonly name = 'ollama' as const;

  isAvailable(config: ProviderConfig): boolean {
    return !!config.ollamaUrl;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const baseUrl = assertSafeLocalLlmUrl(config.ollamaUrl || 'http://localhost:11434');
    const model = config.ollamaModel || 'llama3';

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.ollamaApiKey) {
      headers.Authorization = `Bearer ${config.ollamaApiKey}`;
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? config.temperature ?? 0.7,
          num_predict: options.maxTokens ?? config.maxTokens ?? 1024,
        },
      }),
    });

    if (!response.ok) {
      // Do not leak upstream response bodies (may contain internal details)
      console.error(`[Ollama] Provider error status=${response.status}`);
      throw new Error(`Ollama request failed (HTTP ${response.status})`);
    }

    const data: any = await response.json();
    return {
      text: data.message?.content || '',
      provider: 'ollama',
      model,
      tokensUsed: (data.prompt_eval_count || 0) + (data.eval_count || 0),
    };
  }

  /** List installed models via /api/tags. */
  async listModels(config: ProviderConfig): Promise<string[]> {
    const baseUrl = assertSafeLocalLlmUrl(config.ollamaUrl || 'http://localhost:11434');
    const headers: Record<string, string> = {};
    if (config.ollamaApiKey) {
      headers.Authorization = `Bearer ${config.ollamaApiKey}`;
    }
    const response = await fetch(`${baseUrl}/api/tags`, { headers });
    if (!response.ok) {
      throw new Error(`Ollama request failed (HTTP ${response.status})`);
    }
    const data: any = await response.json();
    return (data.models || []).map((m: any) => m.name);
  }
}