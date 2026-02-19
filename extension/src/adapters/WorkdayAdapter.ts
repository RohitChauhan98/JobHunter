/**
 * File: adapters/WorkdayAdapter.ts
 * Purpose: Platform adapter for Workday-hosted job application pages.
 *
 * Workday (*.myworkdayjobs.com) is one of the most complex ATS platforms
 * because it renders entirely via a client-side framework with custom
 * web components and shadow DOM.
 *
 * Key challenges:
 * - Heavy use of custom elements and shadow DOM
 * - Dynamic rendering — fields appear after AJAX calls
 * - Multi-step wizard forms
 * - Field IDs are auto-generated and change between loads
 *
 * Strategy:
 * - Use aria-label and data attributes as primary signals
 * - Wait for dynamic content with MutationObserver
 * - Rely on label text more than field names
 */

import type { JobDetails, PlatformName } from '@/types';
import { BaseAdapter } from './BaseAdapter';

export class WorkdayAdapter extends BaseAdapter {
  name: PlatformName = 'workday';

  matches(url: string): boolean {
    return /\.myworkdayjobs\.com/i.test(url);
  }

  extractJobDetails(doc: Document): JobDetails | null {
    try {
      // Workday uses data-automation-id attributes for key elements
      const title =
        doc.querySelector<HTMLElement>('[data-automation-id="jobPostingHeader"]')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('h2')?.textContent?.trim() ||
        '';

      const company =
        doc.querySelector<HTMLElement>('[data-automation-id="company"]')?.textContent?.trim() ||
        this.extractCompanyFromUrl(doc.location?.href || '');

      const location =
        doc.querySelector<HTMLElement>('[data-automation-id="locations"]')?.textContent?.trim() ||
        '';

      const description =
        doc.querySelector<HTMLElement>('[data-automation-id="jobPostingDescription"]')?.textContent?.trim() ||
        '';

      return {
        title,
        company,
        location,
        description: description.slice(0, 2000),
        url: doc.location?.href || '',
      };
    } catch {
      return null;
    }
  }

  private extractCompanyFromUrl(url: string): string {
    // https://company.wd1.myworkdayjobs.com/...
    const match = url.match(/\/\/([^.]+)\./);
    return match?.[1] || '';
  }
}
