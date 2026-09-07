import { AppError } from './errors.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/**
 * Restrict local LLM URLs to loopback hosts to prevent SSRF against
 * cloud metadata endpoints or internal network services.
 */
export function assertSafeLocalLlmUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw AppError.badRequest('Invalid local LLM URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw AppError.badRequest('Local LLM URL must use http or https');
  }

  const host = url.hostname.toLowerCase();
  const isLoopback =
    LOCAL_HOSTS.has(host) ||
    host.endsWith('.localhost') ||
    host === '0.0.0.0';

  if (!isLoopback) {
    throw AppError.badRequest(
      'Local LLM URL must point to localhost (e.g. http://localhost:11434). Remote hosts are not allowed.',
    );
  }

  // Strip credentials if present — never forward userinfo
  url.username = '';
  url.password = '';

  return url.toString().replace(/\/+$/, '');
}
