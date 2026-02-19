/**
 * File: content/formFiller.ts
 * Purpose: Core form-filling engine with undo capability.
 *
 * Takes a list of DetectedFields and a UserProfile, then fills each field
 * with the appropriate value. Handles different input types (text, select,
 * textarea, radio, checkbox) and dispatches proper DOM events so that
 * React/Vue/Angular controlled inputs register the change.
 *
 * Key functionality:
 * - Fill text inputs, textareas, selects, radio buttons, and checkboxes
 * - Dispatch synthetic events (input, change, blur) for framework compat
 * - Snapshot original values before filling (for undo)
 * - Restore original values on undo
 * - Skip file inputs (browser security prevents programmatic setting)
 * - Skip EEO/demographic fields by default (user privacy)
 *
 * Usage:
 *   const result = await fillForm(detectedFields, userProfile);
 *   // Later, to undo:
 *   await undoFill(result.results);
 */

import type {
  DetectedField,
  FieldType,
  FillResult,
  FormFillResult,
  UserProfile,
} from '@/types';
import { getFieldValue, findBestDropdownOption } from './fieldMapper';

/** Field types that are skipped by default (EEO / demographic) */
const SKIP_FIELD_TYPES: Set<FieldType> = new Set([
  'gender',
  'ethnicity',
  'veteranStatus',
  'disability',
]);

/** Field types that cannot be auto-filled (need manual user action) */
const UNFILLABLE_FIELD_TYPES: Set<FieldType> = new Set([
  'resume',
  'coverLetter',
]);

/**
 * Fill all detected form fields with values from the user's profile.
 *
 * Skips EEO fields and file uploads. Records original values for undo.
 *
 * @param fields   Array of detected and classified form fields.
 * @param profile  The user's profile data.
 * @returns A FormFillResult summarizing what happened to each field.
 */
export async function fillForm(
  fields: DetectedField[],
  profile: UserProfile,
): Promise<FormFillResult> {
  const results: FillResult[] = [];
  let filled = 0;
  let skipped = 0;
  let failed = 0;

  for (const field of fields) {
    // Skip fields we shouldn't or can't auto-fill
    if (SKIP_FIELD_TYPES.has(field.fieldType)) {
      skipped++;
      results.push({
        field,
        success: false,
        valueFilled: '',
        previousValue: '',
        error: 'Skipped (EEO/demographic field)',
      });
      continue;
    }

    if (UNFILLABLE_FIELD_TYPES.has(field.fieldType)) {
      skipped++;
      results.push({
        field,
        success: false,
        valueFilled: '',
        previousValue: '',
        error: 'File upload requires manual action',
      });
      continue;
    }

    if (field.fieldType === 'unknown' || field.fieldType === 'customQuestion') {
      skipped++;
      results.push({
        field,
        success: false,
        valueFilled: '',
        previousValue: '',
        error: 'Unknown or custom question — skipped',
      });
      continue;
    }

    // Get the value to fill from the profile
    const value = getFieldValue(field.fieldType, profile);
    if (!value) {
      skipped++;
      results.push({
        field,
        success: false,
        valueFilled: '',
        previousValue: '',
        error: 'No profile data for this field',
      });
      continue;
    }

    // Attempt to fill the field
    const result = fillSingleField(field, value);
    results.push(result);

    if (result.success) {
      filled++;
    } else {
      failed++;
    }
  }

  return {
    totalFields: fields.length,
    filledFields: filled,
    skippedFields: skipped,
    failedFields: failed,
    results,
  };
}

/**
 * Fill a single form field with a value, dispatching the proper DOM events.
 *
 * For React/Vue/Angular controlled inputs, simply setting `.value` doesn't
 * work because the framework's state doesn't update. We must dispatch
 * synthetic `input`, `change`, and `blur` events to trigger the framework's
 * event handlers.
 *
 * @param field  The detected field to fill.
 * @param value  The string value to set.
 * @returns A FillResult recording success/failure and the previous value.
 */
function fillSingleField(field: DetectedField, value: string): FillResult {
  const element = field.element;
  const previousValue = getCurrentValue(element);

  try {
    switch (field.inputType) {
      case 'select':
        return fillSelect(field, element as HTMLSelectElement, value, previousValue);

      case 'textarea':
        return fillTextInput(field, element as HTMLTextAreaElement, value, previousValue);

      case 'radio':
        return fillRadio(field, element as HTMLInputElement, value, previousValue);

      case 'checkbox':
        return fillCheckbox(field, element as HTMLInputElement, value, previousValue);

      default:
        // text, email, tel, url, number, date, etc.
        return fillTextInput(field, element as HTMLInputElement, value, previousValue);
    }
  } catch (error) {
    return {
      field,
      success: false,
      valueFilled: '',
      previousValue,
      error: `Fill failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Fill a text input or textarea using the React-compatible nativeInputValueSetter
 * trick when available, falling back to direct value assignment.
 */
function fillTextInput(
  field: DetectedField,
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  previousValue: string,
): FillResult {
  // Use React's internal value setter to bypass controlled component checks.
  // React overrides the `value` property on inputs — we need to call the
  // native HTMLInputElement.prototype.value setter to actually change it.
  const nativeSetter =
    element instanceof HTMLTextAreaElement
      ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
      : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  if (nativeSetter) {
    nativeSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Dispatch synthetic events in the correct order
  dispatchInputEvents(element);

  return {
    field,
    success: true,
    valueFilled: value,
    previousValue,
  };
}

/**
 * Fill a <select> dropdown by finding the best matching option.
 */
function fillSelect(
  field: DetectedField,
  element: HTMLSelectElement,
  value: string,
  previousValue: string,
): FillResult {
  const bestOption = findBestDropdownOption(element, value);

  if (!bestOption) {
    return {
      field,
      success: false,
      valueFilled: '',
      previousValue,
      error: `No matching option found for "${value}"`,
    };
  }

  element.value = bestOption;
  dispatchInputEvents(element);

  return {
    field,
    success: true,
    valueFilled: bestOption,
    previousValue,
  };
}

/**
 * Fill a radio button group by finding and clicking the matching option.
 */
function fillRadio(
  field: DetectedField,
  element: HTMLInputElement,
  value: string,
  previousValue: string,
): FillResult {
  // Find all radio buttons in the same group
  const name = element.name;
  if (!name) {
    return { field, success: false, valueFilled: '', previousValue, error: 'Radio has no name' };
  }

  const radios = element.ownerDocument.querySelectorAll<HTMLInputElement>(
    `input[type="radio"][name="${name}"]`,
  );

  const target = value.toLowerCase();
  let matched = false;

  for (const radio of radios) {
    const radioLabel = radio.labels?.[0]?.textContent?.toLowerCase().trim() || '';
    const radioValue = radio.value.toLowerCase().trim();

    if (radioValue === target || radioLabel.includes(target) || target.includes(radioLabel)) {
      radio.checked = true;
      dispatchInputEvents(radio);
      matched = true;
      break;
    }
  }

  return {
    field,
    success: matched,
    valueFilled: matched ? value : '',
    previousValue,
    error: matched ? undefined : `No matching radio option for "${value}"`,
  };
}

/**
 * Fill a checkbox — checks it if value is truthy, unchecks otherwise.
 */
function fillCheckbox(
  field: DetectedField,
  element: HTMLInputElement,
  value: string,
  previousValue: string,
): FillResult {
  const shouldCheck = /^(yes|true|1|on|y)$/i.test(value);
  element.checked = shouldCheck;
  dispatchInputEvents(element);

  return {
    field,
    success: true,
    valueFilled: shouldCheck ? 'checked' : 'unchecked',
    previousValue,
  };
}

/**
 * Dispatch synthetic events on an element in the order that browsers and
 * frameworks expect: focus → input → change → blur.
 *
 * This ensures React's onChange, Vue's v-model, and Angular's ngModel
 * all pick up the value change.
 */
function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event('focus', { bubbles: true }));
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Get the current value of a form element (before we overwrite it).
 */
function getCurrentValue(element: HTMLElement): string {
  if (element instanceof HTMLSelectElement) return element.value;
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      return element.checked ? 'checked' : 'unchecked';
    }
    return element.value;
  }
  if (element instanceof HTMLTextAreaElement) return element.value;
  return '';
}

/**
 * Undo a previous form fill by restoring original values from FillResult records.
 *
 * @param results  The array of FillResult from a previous fillForm() call.
 * @returns The number of fields successfully restored.
 */
export function undoFill(results: FillResult[]): number {
  let restored = 0;

  for (const result of results) {
    if (!result.success) continue; // Nothing to undo for fields that weren't filled

    try {
      const element = result.field.element;

      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = result.previousValue === 'checked';
        } else {
          element.value = result.previousValue;
        }
      } else if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        element.value = result.previousValue;
      }

      dispatchInputEvents(element);
      restored++;
    } catch {
      // Element may have been removed from DOM — skip silently
    }
  }

  return restored;
}
