/**
 * File: adapters/GenericAdapter.ts
 * Purpose: Fallback adapter for unrecognized job application pages.
 *
 * When no platform-specific adapter matches the URL, the GenericAdapter
 * attempts to detect application forms using broad heuristics. It is
 * intentionally conservative to avoid false positives on non-application
 * pages (e.g., login forms, search bars, contact forms).
 *
 * The generic adapter works best on custom company career pages that
 * use standard HTML forms without heavy JavaScript frameworks.
 */

import type { JobDetails, PlatformName } from '@/types';
import { BaseAdapter } from './BaseAdapter';

export class GenericAdapter extends BaseAdapter {
  name: PlatformName = 'generic';

  /**
   * The generic adapter matches all URLs — it's the fallback.
   * The AdapterRegistry only reaches this adapter if no specific one matched.
   */
  matches(_url: string): boolean {
    return true;
  }

  extractJobDetails(doc: Document): JobDetails | null {
    try {
      // Best-effort extraction using common page structures
      const title =
        doc.querySelector<HTMLElement>('h1')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('h2')?.textContent?.trim() ||
        doc.title || '';

      // Try to find company name from page metadata or logo alt text
      const company =
        doc.querySelector<HTMLElement>('meta[property="og:site_name"]')
          ?.getAttribute('content')?.trim() ||
        doc.querySelector<HTMLElement>('img[class*="logo"]')?.getAttribute('alt')?.trim() ||
        new URL(doc.location?.href || '').hostname.replace('www.', '').split('.')[0] || '';

      // Location is very hard to detect generically
      const location = '';

      // Look for a job description section
      const description =
        doc.querySelector<HTMLElement>('[class*="description"], [id*="description"]')
          ?.textContent?.trim() ||
        '';

      return {
        title: title.slice(0, 200),
        company,
        location,
        description: description.slice(0, 2000),
        url: doc.location?.href || '',
      };
    } catch {
      return null;
    }
  }
}
