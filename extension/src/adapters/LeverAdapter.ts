/**
 * File: adapters/LeverAdapter.ts
 * Purpose: Platform adapter for Lever-hosted job application pages.
 *
 * Lever (jobs.lever.co) uses a clean application form structure.
 * Applications live at jobs.lever.co/company/jobId/apply.
 *
 * Key patterns:
 * - Application form is on the /apply page
 * - Fields are wrapped in .application-field divs
 * - Labels are in .application-label elements
 * - File uploads use a custom drag-and-drop component
 * - Custom questions use .custom-question class
 */

import type { DetectedField, FormDetectionResult, JobDetails, PlatformName } from '@/types';
import { BaseAdapter } from './BaseAdapter';

export class LeverAdapter extends BaseAdapter {
  name: PlatformName = 'lever';

  matches(url: string): boolean {
    return /jobs\.lever\.co/i.test(url);
  }

  /**
   * Override default form detection to use Lever-specific DOM structure.
   * Lever's form doesn't always use a <form> tag — sometimes it's a div
   * with .application-form or #application-form.
   */
  detectForm(doc: Document): FormDetectionResult {
    // Check if we're on the /apply page
    const isApplyPage = /\/apply\/?$/i.test(doc.location?.pathname || '');

    // Lever wraps application fields in a known container
    const formContainer =
      doc.querySelector<HTMLElement>('#application-form') ||
      doc.querySelector<HTMLElement>('.application-form') ||
      doc.querySelector<HTMLFormElement>('form');

    if (!formContainer || !isApplyPage) {
      return {
        isApplicationForm: false,
        platform: this.name,
        fields: [],
        formElement: null,
        jobDetails: this.extractJobDetails(doc),
      };
    }

    const fields = this.discoverLeverFields(formContainer);

    return {
      isApplicationForm: fields.length > 0,
      platform: this.name,
      fields,
      formElement: formContainer instanceof HTMLFormElement ? formContainer : null,
      jobDetails: this.extractJobDetails(doc),
    };
  }

  extractJobDetails(doc: Document): JobDetails | null {
    try {
      const title =
        doc.querySelector<HTMLElement>('.posting-headline h2')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('h1')?.textContent?.trim() ||
        '';

      const company =
        doc.querySelector<HTMLElement>('.posting-headline .company')?.textContent?.trim() ||
        this.extractCompanyFromUrl(doc.location?.href || '');

      const location =
        doc.querySelector<HTMLElement>('.posting-categories .location')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('.sort-by-time.posting-category')?.textContent?.trim() ||
        '';

      // Lever shows description on the job page (before /apply)
      const description =
        doc.querySelector<HTMLElement>('.section-wrapper.page-full-width')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('[data-qa="job-description"]')?.textContent?.trim() ||
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

  /**
   * Lever uses .application-field wrappers with .application-label children.
   * This method walks those wrappers for more accurate label extraction.
   */
  private discoverLeverFields(root: HTMLElement): DetectedField[] {
    // First try Lever-specific field wrappers
    const fieldWrappers = root.querySelectorAll<HTMLElement>('.application-field, .custom-question');
    const fields: DetectedField[] = [];

    for (const wrapper of fieldWrappers) {
      const input = wrapper.querySelector<HTMLElement>('input, select, textarea');
      if (!input) continue;

      const field = this.classifyElement(input);
      if (field) {
        // Override label with Lever-specific label element if available
        const leverLabel = wrapper.querySelector<HTMLElement>('.application-label, label');
        if (leverLabel) {
          field.label = leverLabel.textContent?.trim() || field.label;
        }
        fields.push(field);
      }
    }

    // Fall back to generic discovery if Lever-specific wrappers aren't found
    if (fields.length === 0) {
      return this.discoverFields(root);
    }

    return fields;
  }

  private extractCompanyFromUrl(url: string): string {
    const match = url.match(/lever\.co\/([^/]+)/);
    return match?.[1] || '';
  }
}
