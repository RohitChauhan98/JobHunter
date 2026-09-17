import type { IAIProvider, AIGenerateOptions, AIGenerateResult, ProviderConfig } from './types.js';
import { assertSafeLocalLlmUrl } from '../../utils/localLlmUrl.js';
import { extractCompletionText } from './extractCompletionText.js';

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
    const baseUrl = normalizeLocalBaseUrl(
      assertSafeLocalLlmUrl(config.localLlmUrl || 'http://localhost:11434'),
    );
    const model = (config.localLlmModel || '').trim() || 'mistralai/ministral-3-3b';
    const maxTokens = options.maxTokens ?? config.maxTokens ?? 1024;

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.localLlmApiKey) {
      headers.Authorization = `Bearer ${config.localLlmApiKey}`;
    }

    let data = await this.chat(baseUrl, headers, model, messages, options, config, maxTokens);
    let text = extractCompletionText(data);

    // Reasoning models often burn a small budget on thinking only — retry once larger.
    if (!text.trim() && maxTokens < 2048) {
      data = await this.chat(baseUrl, headers, model, messages, options, config, Math.min(4096, maxTokens * 4));
      text = extractCompletionText(data);
    }

    return {
      text,
      provider: 'local',
      model: data.model || model,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  private async chat(
    baseUrl: string,
    headers: Record<string, string>,
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: AIGenerateOptions,
    config: ProviderConfig,
    maxTokens: number,
  ): Promise<any> {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? config.temperature ?? 0.7,
        max_tokens: maxTokens,
        stream: false,
        // Reasoning models (Gemma 4, Qwen3, GLM, …) otherwise spend the
        // whole budget on reasoning_content and return an empty answer.
        thinking: { type: 'disabled' },
        chat_template_kwargs: { enable_thinking: false },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[LocalLLM] Provider error status=${response.status} body=${body.slice(0, 500)}`);
      throw new Error(`Local LLM request failed (HTTP ${response.status}): ${body.slice(0, 200)}`);
    }

    return response.json();
  }

  /** List models via the OpenAI-compatible /v1/models endpoint. */
  async listModels(config: ProviderConfig): Promise<string[]> {
    const baseUrl = normalizeLocalBaseUrl(
      assertSafeLocalLlmUrl(config.localLlmUrl || 'http://localhost:11434'),
    );
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

/** Accept both `http://localhost:1234` and `http://localhost:1234/v1`. */
function normalizeLocalBaseUrl(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/v1$/i, '');
}
