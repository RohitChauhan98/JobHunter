/**
 * File: content/fieldMapper.ts
 * Purpose: Maps detected field types to values from the user's profile.
 *
 * Given a UserProfile and a FieldType, the mapper returns the appropriate
 * value to fill. Handles direct mappings (firstName → personalInfo.firstName)
 * and computed values (fullName → firstName + " " + lastName).
 *
 * Key functionality:
 * - Direct 1:1 field→profile mappings
 * - Computed / derived values (full name, years of experience)
 * - Dropdown option matching (finds closest option to desired value)
 *
 * Usage:
 *   const value = getFieldValue('firstName', userProfile);
 *   const option = findBestDropdownOption(selectElement, 'United States');
 */

import type { FieldType, UserProfile } from '@/types';

/**
 * Get the value from a user's profile that corresponds to a given field type.
 *
 * @param fieldType  The classified type of the form field.
 * @param profile    The user's stored profile data.
 * @returns The string value to fill, or empty string if no mapping exists.
 */
export function getFieldValue(fieldType: FieldType, profile: UserProfile): string {
  const { personalInfo, experience, preferences } = profile;

  // Most recent experience entry (sorted by start date, current first)
  const latestExperience = experience
    .slice()
    .sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    })[0];

  const mappings: Partial<Record<FieldType, string>> = {
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    fullName: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
    email: personalInfo.email,
    phone: personalInfo.phone,
    city: personalInfo.city,
    state: personalInfo.state,
    country: personalInfo.country,
    linkedinUrl: personalInfo.linkedinUrl,
    githubUrl: personalInfo.githubUrl,
    portfolioUrl: personalInfo.portfolioUrl,
    website: personalInfo.website || personalInfo.portfolioUrl,
    currentCompany: latestExperience?.company || '',
    currentTitle: latestExperience?.title || '',
    yearsOfExperience: computeYearsOfExperience(experience),
    salary: formatSalary(preferences.salaryMin, preferences.salaryMax, preferences.salaryCurrency),
  };

  return mappings[fieldType] || '';
}

/**
 * Given a <select> element and a desired value, find the option whose text
 * is the closest match. Uses case-insensitive substring and prefix matching.
 *
 * @param selectEl  The <select> HTML element.
 * @param desired   The value we want to match (e.g., "United States").
 * @returns The value attribute of the best-matching <option>, or null.
 *
 * @example
 * findBestDropdownOption(countrySelect, 'United States');
 * // Returns the value of the option with text "United States"
 */
export function findBestDropdownOption(
  selectEl: HTMLSelectElement,
  desired: string,
): string | null {
  if (!desired) return null;

  const options = Array.from(selectEl.options);
  const target = desired.toLowerCase().trim();

  // 1. Exact match
  const exact = options.find(
    (opt) => opt.text.toLowerCase().trim() === target || opt.value.toLowerCase().trim() === target,
  );
  if (exact) return exact.value;

  // 2. Starts-with match
  const startsWith = options.find(
    (opt) =>
      opt.text.toLowerCase().trim().startsWith(target) ||
      target.startsWith(opt.text.toLowerCase().trim()),
  );
  if (startsWith) return startsWith.value;

  // 3. Substring match
  const substring = options.find(
    (opt) =>
      opt.text.toLowerCase().includes(target) || target.includes(opt.text.toLowerCase().trim()),
  );
  if (substring) return substring.value;

  return null;
}

/**
 * Calculate total years of professional experience from work history entries.
 *
 * Handles overlapping date ranges by simply using the earliest start and
 * latest end (this slightly over-counts but is the standard convention).
 */
function computeYearsOfExperience(
  experience: UserProfile['experience'],
): string {
  if (experience.length === 0) return '';

  const now = new Date();
  let totalMonths = 0;

  for (const exp of experience) {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent || !exp.endDate ? now : new Date(exp.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  const years = Math.round(totalMonths / 12);
  return years.toString();
}

/**
 * Format a salary range into a human-readable string.
 */
function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
): string {
  if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `${currency} ${min.toLocaleString()}`;
  if (max) return `${currency} ${max.toLocaleString()}`;
  return '';
}
