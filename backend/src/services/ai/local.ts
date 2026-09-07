import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';
import { assertSafeLocalLlmUrl } from '../../utils/localLlmUrl.js';

/**
 * Local LLM provider — supports any OpenAI-compatible local server:
 *   - LM Studio (http://localhost:1234/v1)
 *   - vLLM (http://localhost:8000/v1)
 *   - text-generation-webui (http://localhost:5000/v1)
 *
 * For Ollama use the dedicated `ollama` provider instead.
 * Only loopback hosts are allowed (SSRF protection).
 */
export class LocalLLMProvider implements IAIProvider {
  readonly name = 'local' as const;

  isAvailable(config: ProviderConfig): boolean {
    return !!config.localLlmUrl;
  }

  async generate(options: AIGenerateOptions, config: ProviderConfig): Promise<AIGenerateResult> {
    const baseUrl = assertSafeLocalLlmUrl(config.localLlmUrl || 'http://localhost:11434');
    const model = config.localLlmModel || 'llama3';

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const endpoint = `${baseUrl}/v1/chat/completions`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.localLlmApiKey) {
      headers.Authorization = `Bearer ${config.localLlmApiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? config.maxTokens ?? 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      // Do not leak upstream response bodies (may contain internal details)
      console.error(`[LocalLLM] Provider error status=${response.status}`);
      throw new Error(`Local LLM request failed (HTTP ${response.status})`);
    }

    const data: any = await response.json();

    return {
      text: data.choices?.[0]?.message?.content || '',
      provider: 'local',
      model,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  /** List models via the OpenAI-compatible /v1/models endpoint. */
  async listModels(config: ProviderConfig): Promise<string[]> {
    const baseUrl = assertSafeLocalLlmUrl(config.localLlmUrl || 'http://localhost:11434');
    const headers: Record<string, string> = {};
    if (config.localLlmApiKey) {
      headers.Authorization = `Bearer ${config.localLlmApiKey}`;
    }
    const response = await fetch(`${baseUrl}/v1/models`, { headers });
    if (!response.ok) {
      throw new Error(`Local LLM request failed (HTTP ${response.status})`);
    }
    const data: any = await response.json();
    return (data.data || []).map((m: any) => m.id).sort();
  }
}
