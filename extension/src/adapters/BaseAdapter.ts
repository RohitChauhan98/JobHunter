/**
 * File: adapters/BaseAdapter.ts
 * Purpose: Abstract base class for platform-specific adapters.
 *
 * Provides shared utility methods for form field discovery, label extraction,
 * and signal building. Concrete adapters (Greenhouse, Lever, etc.) extend
 * this class and override detection / extraction logic where necessary.
 *
 * Key functionality:
 * - Common DOM traversal helpers
 * - Label / placeholder / aria-label extraction
 * - Signal string builder used by the FieldMapper
 * - Default form detection heuristic
 */

import type {
  DetectedField,
  FieldType,
  FormDetectionResult,
  JobDetails,
  PlatformAdapter,
  PlatformName,
} from '@/types';
import { FIELD_PATTERNS } from '@/utils/constants';

export abstract class BaseAdapter implements PlatformAdapter {
  abstract name: PlatformName;
  abstract matches(url: string): boolean;

  // -------------------------------------------------------------------
  // Form detection — override in subclass for platform-specific logic
  // -------------------------------------------------------------------

  detectForm(doc: Document): FormDetectionResult {
    const forms = Array.from(doc.querySelectorAll('form'));
    let candidateForm = this.findApplicationForm(forms, doc);

    // Fallback: if no <form> matched, look for common div-based containers
    // that hold application fields (some modern ATS platforms skip <form>)
    if (!candidateForm) {
      const divSelectors = [
        '#application', '#application-form', '.application-form',
        '[role="form"]', '#apply', '#apply-form',
        '[data-testid*="application"]', '[data-testid*="apply"]',
        '[class*="applicationForm"]', '[class*="application-form"]',
        '[class*="apply-form"]', '[class*="job-application"]',
        'main', '[role="main"]',
      ];

      for (const selector of divSelectors) {
        try {
          const containers = doc.querySelectorAll<HTMLElement>(selector);
          for (const container of containers) {
            const inputCount = container.querySelectorAll(
              'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
            ).length;
            if (inputCount >= 3) {
              const fields = this.discoverFields(container);
              const jobDetails = this.extractJobDetails(doc);
              return {
                isApplicationForm: fields.length > 0,
                platform: this.name,
                fields,
                formElement: null,
                jobDetails,
              };
            }
          }
        } catch {
          // Invalid selector — skip
        }
      }

      // Last resort: if the URL looks like an application page, scan the
      // entire body. This catches React SPAs that don't wrap fields in a
      // recognisable container.
      const pathname = doc.location?.pathname || '';
      if (/\/(apply|application)(\/|$|\?)/i.test(pathname)) {
        const body = doc.body;
        if (body) {
          const inputCount = body.querySelectorAll(
            'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
          ).length;
          if (inputCount >= 3) {
            const fields = this.discoverFields(body);
            const jobDetails = this.extractJobDetails(doc);
            return {
              isApplicationForm: fields.length > 0,
              platform: this.name,
              fields,
              formElement: null,
              jobDetails,
            };
          }
        }
      }

      return {
        isApplicationForm: false,
        platform: this.name,
        fields: [],
        formElement: null,
        jobDetails: null,
      };
    }

    const fields = this.discoverFields(candidateForm);
    const jobDetails = this.extractJobDetails(doc);

    return {
      isApplicationForm: fields.length > 0,
      platform: this.name,
      fields,
      formElement: candidateForm,
      jobDetails,
    };
  }

  abstract extractJobDetails(doc: Document): JobDetails | null;

  // -------------------------------------------------------------------
  // Protected helpers available to subclasses
  // -------------------------------------------------------------------

  /**
   * Walk a form (or document) and collect all input-like elements that
   * could be application fields.
   */
  protected discoverFields(root: HTMLElement | Document): DetectedField[] {
    const selectors = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
      'select',
      'textarea',
    ].join(', ');

    const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors));
    const fields: DetectedField[] = [];

    for (const el of elements) {
      const field = this.classifyElement(el);
      if (field) {
        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * Classify a single form element by building a combined signal string
   * from its label, name, id, placeholder, and aria-label, then matching
   * against the centralized FIELD_PATTERNS.
   */
  protected classifyElement(element: HTMLElement): DetectedField | null {
    const inputEl = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const label = this.getFieldLabel(element);
    const name = inputEl.name || inputEl.id || '';
    const placeholder = (inputEl as HTMLInputElement).placeholder || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const autocomplete = element.getAttribute('autocomplete') || '';

    // Build a combined signal string that all patterns are tested against
    const signals = [label, name, placeholder, ariaLabel, autocomplete]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Don't classify if there are no meaningful signals
    if (signals.trim().length < 2) return null;

    const { fieldType, confidence } = this.matchFieldType(signals, element);

    return {
      element,
      fieldType,
      label: label || placeholder || name,
      inputType: this.getInputType(element),
      required: inputEl.required || element.getAttribute('aria-required') === 'true',
      confidence,
    };
  }

  /**
   * Extract the human-readable label text for a form element by checking:
   * 1. An explicit <label for="..."> element
   * 2. A parent <label> wrapping the input
   * 3. aria-label attribute
   * 4. aria-labelledby reference
   * 5. Preceding sibling text
   */
  protected getFieldLabel(element: HTMLElement): string {
    const id = element.id;

    // 1. Explicit <label for="id">
    if (id) {
      const label = element.ownerDocument.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
      if (label) return label.textContent?.trim() || '';
    }

    // 2. Ancestor <label>
    const parentLabel = element.closest('label');
    if (parentLabel) {
      // Get text content excluding the input element's own text
      const clone = parentLabel.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('input, select, textarea').forEach((el) => el.remove());
      const text = clone.textContent?.trim() || '';
      if (text) return text;
    }

    // 3. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    // 4. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const referenced = element.ownerDocument.getElementById(labelledBy);
      if (referenced) return referenced.textContent?.trim() || '';
    }

    // 5. Preceding sibling or parent text
    const prevSibling = element.previousElementSibling;
    if (prevSibling && ['LABEL', 'SPAN', 'DIV', 'P'].includes(prevSibling.tagName)) {
      return prevSibling.textContent?.trim() || '';
    }

    return '';
  }

  /**
   * Match a signal string against FIELD_PATTERNS and return the best
   * classification and a confidence score.
   */
  protected matchFieldType(
    signals: string,
    element: HTMLElement,
  ): { fieldType: FieldType; confidence: number } {
    // Check input type shortcuts first (e.g., type="email", type="tel")
    const inputType = (element as HTMLInputElement).type?.toLowerCase();
    if (inputType === 'email') return { fieldType: 'email', confidence: 0.95 };
    if (inputType === 'tel') return { fieldType: 'phone', confidence: 0.95 };
    if (inputType === 'file') {
      // Determine if it's a resume or cover letter upload
      if (/cover[\s_-]?letter|motivation/i.test(signals)) {
        return { fieldType: 'coverLetter', confidence: 0.85 };
      }
      return { fieldType: 'resume', confidence: 0.85 };
    }

    // Walk through all field patterns and find the best match
    let bestMatch: FieldType = 'unknown';
    let bestConfidence = 0;

    for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(signals)) {
          // More specific patterns get higher confidence
          const specificity = pattern.source.length / 30; // rough heuristic
          const confidence = Math.min(0.95, 0.6 + specificity * 0.15);
          if (confidence > bestConfidence) {
            bestMatch = fieldType as FieldType;
            bestConfidence = confidence;
          }
        }
      }
    }

    return { fieldType: bestMatch, confidence: bestConfidence };
  }

  /**
   * Determine the logical input type of an element (normalises different
   * HTML element types into a simple string).
   */
  protected getInputType(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    if (tag === 'select') return 'select';
    if (tag === 'textarea') return 'textarea';
    return (element as HTMLInputElement).type || 'text';
  }

  /**
   * Find the most likely application form in a list of <form> elements.
   *
   * Heuristic: prefer forms that have multiple text inputs and at least
   * one email/phone field, which is typical for job applications.
   */
  protected findApplicationForm(
    forms: HTMLFormElement[],
    _doc: Document,
  ): HTMLFormElement | null {
    let bestForm: HTMLFormElement | null = null;
    let bestScore = 0;

    for (const form of forms) {
      let score = 0;
      const inputs = form.querySelectorAll(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
      );

      // Score by number of visible inputs
      score += Math.min(inputs.length, 15);

      // Bonus for common application field types
      if (form.querySelector('input[type="email"]')) score += 5;
      if (form.querySelector('input[type="tel"]')) score += 3;
      if (form.querySelector('input[type="file"]')) score += 5;
      if (form.querySelector('textarea')) score += 3;
      if (form.querySelector('select')) score += 2;

      // Bonus for keywords in form action, class, id, or inner HTML attributes
      const formSignals = [form.action, form.className, form.id, form.getAttribute('data-controller') || '']
        .join(' ')
        .toLowerCase();
      if (/apply|application|candidate|submit|job/i.test(formSignals)) score += 10;

      // Bonus if the form's surrounding context looks like a job application
      const parentText = (form.parentElement?.className || '') + ' ' + (form.parentElement?.id || '');
      if (/apply|application|job|career/i.test(parentText)) score += 5;

      if (score > bestScore) {
        bestScore = score;
        bestForm = form;
      }
    }

    // Require a minimum score to avoid false positives (e.g., login forms)
    // A form with just 3 visible inputs (3) scores 3 — not enough.
    // A form with 4+ inputs and an email field scores 9+ — enough.
    return bestScore >= 5 ? bestForm : null;
  }
}
