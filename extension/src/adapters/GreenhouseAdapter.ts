/**
 * File: adapters/GreenhouseAdapter.ts
 * Purpose: Platform adapter for Greenhouse-hosted job application pages.
 *
 * Greenhouse (boards.greenhouse.io, job-boards.greenhouse.io) is one of the
 * most popular ATS platforms used by tech companies. Their application forms
 * follow a fairly consistent structure but vary between the "classic" boards
 * and the newer "job-boards" frontend.
 *
 * Known DOM patterns (may coexist or differ by board version):
 * - Form element: <form> with id containing "application" or wrapped in
 *   #application, #app_body, #main_app, .application--container
 * - Fields use <input> with clear name/id attributes
 * - Required fields have an asterisk (*) in the label
 * - File uploads use hidden <input type="file"> behind custom buttons
 * - Custom questions appear as <textarea>, <select>, or additional <input>
 *
 * Usage:
 *   const adapter = new GreenhouseAdapter();
 *   if (adapter.matches(window.location.href)) {
 *     const result = adapter.detectForm(document);
 *   }
 */

import type { FormDetectionResult, JobDetails, PlatformName } from '@/types';
import { BaseAdapter } from './BaseAdapter';

export class GreenhouseAdapter extends BaseAdapter {
  name: PlatformName = 'greenhouse';

  /**
   * Match Greenhouse job board URLs.
   * Formats:
   * - boards.greenhouse.io/company/jobs/12345
   * - job-boards.greenhouse.io/company/jobs/12345
   * - company.greenhouse.io/jobs/12345
   */
  matches(url: string): boolean {
    return /greenhouse\.io/i.test(url);
  }

  /**
   * Override the base detectForm to use Greenhouse-specific DOM selectors.
   *
   * Greenhouse has several known container patterns for the application form.
   * We try each one, falling back to the generic heuristic if none match.
   */
  detectForm(doc: Document): FormDetectionResult {
    const formRoot = this.findGreenhouseFormRoot(doc);

    if (!formRoot) {
      // Fall back to base class generic detection
      return super.detectForm(doc);
    }

    const fields = this.discoverFields(formRoot);
    const jobDetails = this.extractJobDetails(doc);

    return {
      isApplicationForm: fields.length >= 2,
      platform: this.name,
      fields,
      formElement: formRoot instanceof HTMLFormElement ? formRoot : null,
      jobDetails,
    };
  }

  /**
   * Try multiple strategies to find the Greenhouse application form root.
   *
   * Strategy order (most specific → most general):
   * 1. Known container IDs (#application, #app_body, #main_app)
   * 2. Known container classes (.application--container, .application-form)
   * 3. A <form> whose action URL or id hints at "application"
   * 4. The first <form> on the page that contains enough input fields
   * 5. A section with heading "Apply for this job" and inputs beneath it
   */
  private findGreenhouseFormRoot(doc: Document): HTMLElement | null {
    // 1. Known container IDs
    const knownIds = ['application', 'app_body', 'main_app', 'application-form'];
    for (const id of knownIds) {
      const el = doc.getElementById(id);
      if (el && this.hasFormFields(el)) return el;
    }

    // 2. Known container classes
    const knownSelectors = [
      '.application--container',
      '.application-form',
      '[data-controller="application"]',
      '.job-application',
      '#application_form',
    ];
    for (const sel of knownSelectors) {
      const el = doc.querySelector<HTMLElement>(sel);
      if (el && this.hasFormFields(el)) return el;
    }

    // 3. Any <form> whose action, id, or class contains "application" / "apply"
    const forms = Array.from(doc.querySelectorAll<HTMLFormElement>('form'));
    for (const form of forms) {
      const signals = `${form.action} ${form.id} ${form.className}`.toLowerCase();
      if (/applic|apply|candidate|submit/i.test(signals) && this.hasFormFields(form)) {
        return form;
      }
    }

    // 4. The first <form> that has >= 3 visible inputs (skip login/search forms)
    for (const form of forms) {
      const inputCount = form.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
      ).length;
      if (inputCount >= 3) {
        return form;
      }
    }

    // 5. Look for "Apply for this job" heading and grab the next sibling container
    //    that has inputs — common in newer Greenhouse "job-boards" layout
    const headings = doc.querySelectorAll<HTMLElement>('h1, h2, h3, h4');
    for (const h of headings) {
      if (/apply\s+(for\s+)?(this\s+)?job/i.test(h.textContent || '')) {
        // Walk up to find a parent container that holds the form fields
        let container = h.parentElement;
        while (container && !this.hasFormFields(container)) {
          container = container.parentElement;
        }
        if (container) return container;
      }
    }

    // 6. Last resort: scan the whole document body for inputs
    //    Only do this if we're confident we're on a Greenhouse apply page
    if (/\/jobs\/\d+|\/apply/i.test(doc.location?.pathname || '')) {
      const body = doc.body;
      if (body && this.hasFormFields(body)) {
        return body;
      }
    }

    return null;
  }

  /**
   * Quick check: does a container have at least 2 visible form fields?
   */
  private hasFormFields(root: HTMLElement): boolean {
    const count = root.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
    ).length;
    return count >= 2;
  }

  /**
   * Extract job details from a Greenhouse job page.
   *
   * Greenhouse pages have a fairly consistent DOM structure:
   * - Job title in <h1> or .app-title
   * - Company name in .company-name or the board subdomain
   * - Location in .location
   * - Description in #content or .section-wrapper
   */
  extractJobDetails(doc: Document): JobDetails | null {
    try {
      const title =
        doc.querySelector<HTMLElement>('.app-title')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('h1')?.textContent?.trim() ||
        '';

      const company =
        doc.querySelector<HTMLElement>('.company-name')?.textContent?.trim() ||
        this.extractCompanyFromUrl(doc.location?.href || '');

      const location =
        doc.querySelector<HTMLElement>('.location')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('.body--metadata')?.textContent?.trim() ||
        '';

      const description =
        doc.querySelector<HTMLElement>('#content')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('.section-wrapper')?.textContent?.trim() ||
        '';

      return {
        title,
        company,
        location,
        description: description.slice(0, 2000), // Truncate for storage
        url: doc.location?.href || '',
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract company name from a Greenhouse board URL.
   *
   * @example
   * extractCompanyFromUrl('https://boards.greenhouse.io/acmecorp/jobs/123')
   * // Returns 'acmecorp'
   *
   * extractCompanyFromUrl('https://job-boards.greenhouse.io/acmecorp/jobs/123')
   * // Returns 'acmecorp'
   */
  private extractCompanyFromUrl(url: string): string {
    const match = url.match(/greenhouse\.io\/([^/]+)/);
    return match?.[1] || '';
  }
}
