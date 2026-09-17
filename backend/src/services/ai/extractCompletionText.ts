/**
 * Pull visible assistant text out of OpenAI-compatible chat payloads.
 *
 * Reasoning models (Gemma 4, GLM-4.6, Phi thinking, etc.) often put tokens in
 * `reasoning_content` / `<think>` blocks and leave `message.content` empty
 * (or only a closed think wrapper). Prefer cleaned content, then fall back.
 */

type ContentPart = {
  type?: string;
  text?: string;
  content?: string;
};

function normalizeContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return (content as ContentPart[])
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part && typeof part === 'object') {
        if (typeof part.text === 'string') return part.text;
        if (typeof part.content === 'string') return part.content;
      }
      return '';
    })
    .join('');
}

export function stripThinkTags(text: string): string {
  return text.replace(/<think\b[^>]*>[\s\S]*?<\/think>/gi, '').trim();
}

/** Prefer text after the last closed think block; otherwise strip wrappers. */
function finalizeAssistantText(raw: string): string {
  if (!raw) return '';
  const afterThink = raw.split(/<\/think>/i).pop() ?? raw;
  const cleaned = stripThinkTags(afterThink).trim();
  if (cleaned) return cleaned;
  return stripThinkTags(raw).trim();
}

export function extractCompletionText(payload: unknown): string {
  const root = payload as Record<string, unknown> | null;
  if (!root || typeof root !== 'object') return '';

  const choice = Array.isArray(root.choices)
    ? (root.choices[0] as Record<string, unknown> | undefined)
    : undefined;
  const message = (choice?.message ?? root.message ?? {}) as Record<string, unknown>;

  const candidates = [
    normalizeContent(message.content),
    normalizeContent(choice?.text),
    normalizeContent(message.reasoning_content),
    normalizeContent(message.thinking),
  ];

  for (const candidate of candidates) {
    const text = finalizeAssistantText(candidate);
    if (text) return text;
  }

  return '';
}
