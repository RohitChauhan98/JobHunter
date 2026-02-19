/**
 * File: adapters/AshbyAdapter.ts
 * Purpose: Platform adapter for Ashby-hosted job application pages.
 *
 * Ashby (jobs.ashbyhq.com) is a modern ATS used by many startups and
 * tech companies. It renders application forms as a React SPA, which
 * means the form content is loaded dynamically after the initial page load.
 *
 * Key characteristics:
 * - URL pattern: jobs.ashbyhq.com/{company}/{jobId}/application
 * - The page uses a tab layout: "Overview" | "Application"
 * - The form is a React-rendered SPA — no server-rendered <form> tag initially
 * - Fields include: Name, Email, Resume (file upload), Phone, custom questions
 * - Ashby wraps fields in custom div containers (not standard <form> in many cases)
 * - Uses standard HTML5 input types but within React component wrappers
 * - Has "Submit Application" button at the bottom
 * - Some inputs use aria-label or data attributes instead of visible <label> tags
 *
 * Usage:
 *   const adapter = new AshbyAdapter();
 *   if (adapter.matches(window.location.href)) {
 *     const result = adapter.detectForm(document);
 *   }
 */

import type { DetectedField, FormDetectionResult, JobDetails, PlatformName } from '@/types';
import { BaseAdapter } from './BaseAdapter';

export class AshbyAdapter extends BaseAdapter {
  name: PlatformName = 'ashby';

  /**
   * Match Ashby job board URLs.
   * Primary format: jobs.ashbyhq.com/{company}/{jobId}/application
   * Also matches the job listing page (overview) at:
   *   jobs.ashbyhq.com/{company}/{jobId}
   */
  matches(url: string): boolean {
    return /ashbyhq\.com/i.test(url);
  }

  /**
   * Override the base detectForm with Ashby-specific strategies.
   *
   * Ashby renders its application as a React SPA, so we need to be flexible
   * about finding the form root. The form may be:
   * 1. A <form> element (sometimes present)
   * 2. A container div with specific Ashby class names or data attributes
   * 3. A section containing the "Submit Application" button
   * 4. Simply the region of the page with input fields
   */
  detectForm(doc: Document): FormDetectionResult {
    const isApplyPage = /\/application\/?(\?.*)?$/i.test(doc.location?.pathname || '');

    const formRoot = this.findAshbyFormRoot(doc);

    if (!formRoot) {
      // If we're on the application page but couldn't find a form root,
      // try a broader scan of the document body
      if (isApplyPage) {
        return this.broadScan(doc);
      }

      return {
        isApplicationForm: false,
        platform: this.name,
        fields: [],
        formElement: null,
        jobDetails: this.extractJobDetails(doc),
      };
    }

    const fields = this.discoverAshbyFields(formRoot);
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
   * Try multiple strategies to find the Ashby application form root.
   *
   * Strategy order (most specific → most general):
   * 1. A <form> element on the page (Ashby sometimes uses one)
   * 2. Known Ashby container selectors (class names, data attributes)
   * 3. A container that holds the "Submit Application" button
   * 4. A container with [role="form"] or aria attributes
   * 5. The largest container with 3+ form inputs
   */
  private findAshbyFormRoot(doc: Document): HTMLElement | null {
    // 1. Any <form> element with enough fields
    const forms = Array.from(doc.querySelectorAll<HTMLFormElement>('form'));
    for (const form of forms) {
      if (this.hasFormFields(form, 2)) return form;
    }

    // 2. Known Ashby-specific container selectors
    const ashbySelectors = [
      // Ashby uses various container patterns
      '[data-testid*="application"]',
      '[data-testid*="apply"]',
      '[class*="application"]',
      '[class*="applicationForm"]',
      '[class*="Application"]',
      '[class*="apply-form"]',
      '[class*="job-application"]',
      '[id*="application"]',
      '[id*="apply"]',
      '[role="form"]',
    ];
    for (const selector of ashbySelectors) {
      try {
        const el = doc.querySelector<HTMLElement>(selector);
        if (el && this.hasFormFields(el, 2)) return el;
      } catch {
        // Invalid selector — skip
      }
    }

    // 3. Find the container around the "Submit Application" button
    const buttons = doc.querySelectorAll<HTMLElement>('button, [type="submit"], [role="button"]');
    for (const btn of buttons) {
      const text = btn.textContent?.trim().toLowerCase() || '';
      if (/submit\s*application|apply\s*now|submit/i.test(text)) {
        // Walk up to find a parent that contains form fields
        let container = btn.parentElement;
        let depth = 0;
        while (container && depth < 15) {
          if (this.hasFormFields(container, 3)) return container;
          container = container.parentElement;
          depth++;
        }
      }
    }

    // 4. Look for any container that looks like a form section
    const containers = doc.querySelectorAll<HTMLElement>(
      'main, [role="main"], article, section',
    );
    for (const c of containers) {
      if (this.hasFormFields(c, 3)) return c;
    }

    return null;
  }

  /**
   * Broad scan fallback: when we're on the /application URL but no
   * container was found, scan the entire body for inputs.
   * This handles cases where Ashby's React SPA uses deeply nested
   * components without a clear form wrapper.
   */
  private broadScan(doc: Document): FormDetectionResult {
    const body = doc.body;
    if (!body) {
      return {
        isApplicationForm: false,
        platform: this.name,
        fields: [],
        formElement: null,
        jobDetails: null,
      };
    }

    const fields = this.discoverAshbyFields(body);
    const jobDetails = this.extractJobDetails(doc);

    return {
      isApplicationForm: fields.length >= 2,
      platform: this.name,
      fields,
      formElement: null,
      jobDetails,
    };
  }

  /**
   * Discover fields with Ashby-aware label extraction.
   *
   * Ashby often wraps each field in a div with:
   * - A label/span above the input with the field name
   * - An asterisk (*) for required fields
   * - Sometimes a description/help text below
   *
   * This method first tries Ashby-specific field wrappers, then falls
   * back to generic discovery.
   */
  private discoverAshbyFields(root: HTMLElement): DetectedField[] {
    const fields: DetectedField[] = [];
    const seen = new WeakSet<HTMLElement>();

    // Strategy A: Walk all visible inputs/selects/textareas and classify
    const inputSelector = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
      'select',
      'textarea',
    ].join(', ');

    const elements = Array.from(root.querySelectorAll<HTMLElement>(inputSelector));

    for (const el of elements) {
      if (seen.has(el)) continue;
      seen.add(el);

      // Skip inputs that are likely part of the search/nav (outside main content)
      if (this.isNavigationElement(el)) continue;

      const field = this.classifyElement(el);
      if (!field) continue;

      // Try enhanced label extraction for Ashby
      const enhancedLabel = this.getAshbyFieldLabel(el);
      if (enhancedLabel) {
        field.label = enhancedLabel;

        // Re-classify with the better label if the field was "unknown"
        if (field.fieldType === 'unknown') {
          const reclassified = this.reclassifyWithLabel(enhancedLabel, el);
          if (reclassified) {
            field.fieldType = reclassified.fieldType;
            field.confidence = reclassified.confidence;
          }
        }
      }

      fields.push(field);
    }

    return fields;
  }

  /**
   * Enhanced label extraction for Ashby fields.
   *
   * Ashby's React components sometimes don't use standard <label for="...">
   * associations. This method tries additional strategies:
   * 1. Look for a preceding sibling or parent-level text node
   * 2. Check for a nearby span/div that acts as a visual label
   * 3. Walk the DOM tree up and check for heading-like text
   * 4. Use the closest container's text content (excluding the input itself)
   */
  private getAshbyFieldLabel(element: HTMLElement): string {
    // First try standard extraction (from BaseAdapter)
    const standardLabel = this.getFieldLabel(element);
    if (standardLabel) return standardLabel;

    // Strategy: Walk up to the nearest field wrapper and extract its label text
    let container = element.parentElement;
    let depth = 0;
    while (container && depth < 5) {
      // Look for label-like elements in this container
      const labelCandidates = container.querySelectorAll<HTMLElement>(
        'label, [class*="label"], [class*="Label"], span, p, div',
      );

      for (const candidate of labelCandidates) {
        // Skip the input element itself and its children
        if (candidate.contains(element) || element.contains(candidate)) continue;

        const text = candidate.textContent?.trim() || '';
        // A valid label should be short-ish (not a paragraph of help text)
        if (text.length > 1 && text.length < 100 && !text.includes('\n')) {
          // Remove trailing asterisk (required marker)
          return text.replace(/\s*\*\s*$/, '').trim();
        }
      }

      container = container.parentElement;
      depth++;
    }

    return '';
  }

  /**
   * Re-classify a field using the enhanced label.
   */
  private reclassifyWithLabel(
    label: string,
    element: HTMLElement,
  ): { fieldType: import('@/types').FieldType; confidence: number } | null {
    const signals = label.toLowerCase();
    if (signals.length < 2) return null;
    const result = this.matchFieldType(signals, element);
    return result.fieldType !== 'unknown' ? result : null;
  }

  /**
   * Check if an element is part of the site's navigation/header
   * rather than the application form.
   */
  private isNavigationElement(el: HTMLElement): boolean {
    const nav = el.closest('nav, header, [role="navigation"], [role="banner"]');
    return nav !== null;
  }

  /**
   * Quick check: does a container have at least N visible form fields?
   */
  private hasFormFields(root: HTMLElement, minCount: number = 2): boolean {
    const count = root.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
    ).length;
    return count >= minCount;
  }

  /**
   * Extract job details from an Ashby page.
   *
   * Ashby pages typically have:
   * - Job title in <h1>
   * - Company name in the header or subdomain path
   * - Location, employment type, department in structured sections
   * - Description on the "Overview" tab
   */
  extractJobDetails(doc: Document): JobDetails | null {
    try {
      // Job title — usually the first/most prominent <h1>
      const title =
        doc.querySelector<HTMLElement>('h1')?.textContent?.trim() || '';

      // Company name — extract from URL or page meta
      const company =
        doc.querySelector<HTMLElement>('meta[property="og:site_name"]')
          ?.getAttribute('content')?.trim() ||
        this.extractCompanyFromUrl(doc.location?.href || '');

      // Location — look for known Ashby layout patterns
      const location = this.extractTextNear(doc, /location/i) || '';

      // Description — try common Ashby description containers
      const description =
        doc.querySelector<HTMLElement>('[data-testid*="description"]')?.textContent?.trim() ||
        doc.querySelector<HTMLElement>('[class*="description"]')?.textContent?.trim() ||
        '';

      return {
        title: title.slice(0, 200),
        company,
        location: location.slice(0, 200),
        description: description.slice(0, 2000),
        url: doc.location?.href || '',
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract company name from Ashby URL.
   * URL format: jobs.ashbyhq.com/{companySlug}/...
   */
  private extractCompanyFromUrl(url: string): string {
    const match = url.match(/ashbyhq\.com\/([^/?#]+)/);
    return match?.[1] || '';
  }

  /**
   * Try to extract text content near an element whose heading/label
   * matches the given pattern. Used for extracting structured job details.
   */
  private extractTextNear(doc: Document, pattern: RegExp): string {
    const headings = doc.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, dt, th, strong, b');
    for (const heading of headings) {
      if (pattern.test(heading.textContent || '')) {
        // Check next sibling
        const next = heading.nextElementSibling;
        if (next) return next.textContent?.trim() || '';
        // Check parent's next sibling
        const parentNext = heading.parentElement?.nextElementSibling;
        if (parentNext) return parentNext.textContent?.trim() || '';
      }
    }
    return '';
  }
}
