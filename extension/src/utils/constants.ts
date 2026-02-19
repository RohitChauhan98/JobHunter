/**
 * File: utils/constants.ts
 * Purpose: Application-wide constants for field patterns, platform URLs,
 *          default settings, and storage keys.
 *
 * All magic strings and regex patterns are centralized here so that
 * adapters and utilities can import them instead of duplicating patterns.
 */

import type { ExtensionSettings, StorageSchema } from '@/types';

// ---------------------------------------------------------------------------
// Field Detection Patterns
// ---------------------------------------------------------------------------

/**
 * Regex patterns for classifying form fields.
 *
 * Each key is a FieldType, and the value is an array of patterns that are
 * tested against the combined "signal string" (label + name + placeholder +
 * aria-label) of a form element.
 */
export const FIELD_PATTERNS: Record<string, RegExp[]> = {
  firstName: [
    /first[\s_-]?name/i,
    /given[\s_-]?name/i,
    /\bfname\b/i,
    /^first$/i,
    /prénom/i,
  ],
  lastName: [
    /last[\s_-]?name/i,
    /family[\s_-]?name/i,
    /\blname\b/i,
    /surname/i,
    /^last$/i,
  ],
  fullName: [
    /full[\s_-]?name/i,
    /your[\s_-]?name/i,
    /^name\b/i,
    /candidate[\s_-]?name/i,
    /\bapplicant[\s_-]?name/i,
  ],
  email: [
    /e[\s_-]?mail/i,
    /email[\s_-]?address/i,
    /\bemail\b/i,
  ],
  phone: [
    /phone/i,
    /mobile/i,
    /cell/i,
    /telephone/i,
    /\btel\b/i,
    /contact[\s_-]?number/i,
  ],
  city: [
    /\bcity\b/i,
    /town/i,
    /municipality/i,
  ],
  state: [
    /\bstate\b/i,
    /province/i,
    /region/i,
  ],
  country: [
    /\bcountry\b/i,
    /nation/i,
  ],
  zipCode: [
    /zip/i,
    /postal/i,
    /post[\s_-]?code/i,
  ],
  address: [
    /address/i,
    /street/i,
    /\baddr\b/i,
  ],
  linkedinUrl: [
    /linkedin/i,
    /linked[\s_-]?in/i,
  ],
  githubUrl: [
    /github/i,
    /git[\s_-]?hub/i,
  ],
  portfolioUrl: [
    /portfolio/i,
    /personal[\s_-]?(website|site|page)/i,
  ],
  website: [
    /website/i,
    /\burl\b/i,
    /web[\s_-]?page/i,
    /homepage/i,
  ],
  currentCompany: [
    /current[\s_-]?(company|employer|organization)/i,
    /present[\s_-]?employer/i,
  ],
  currentTitle: [
    /current[\s_-]?(title|position|role)/i,
    /job[\s_-]?title/i,
  ],
  yearsOfExperience: [
    /years?[\s_-]?of[\s_-]?experience/i,
    /total[\s_-]?experience/i,
    /experience[\s_-]?years?/i,
  ],
  salary: [
    /salary/i,
    /compensation/i,
    /pay[\s_-]?expect/i,
    /desired[\s_-]?pay/i,
  ],
  startDate: [
    /start[\s_-]?date/i,
    /available[\s_-]?date/i,
    /earliest[\s_-]?start/i,
    /when[\s_-]?can[\s_-]?you[\s_-]?start/i,
  ],
  coverLetter: [
    /cover[\s_-]?letter/i,
    /motivation[\s_-]?(letter)?/i,
  ],
  resume: [
    /resume/i,
    /\bcv\b/i,
    /curriculum[\s_-]?vitae/i,
  ],
  howDidYouHear: [
    /how[\s_-]?did[\s_-]?you[\s_-]?(hear|find|learn)/i,
    /referral[\s_-]?source/i,
    /source/i,
  ],
  workAuthorization: [
    /work[\s_-]?auth/i,
    /legally[\s_-]?(authorized|eligible|permitted)/i,
    /right[\s_-]?to[\s_-]?work/i,
    /authorized[\s_-]?to[\s_-]?work/i,
  ],
  sponsorship: [
    /sponsor/i,
    /visa[\s_-]?sponsor/i,
    /immigration[\s_-]?sponsor/i,
    /require[\s_-]?sponsor/i,
  ],
  gender: [
    /\bgender\b/i,
    /sex/i,
  ],
  ethnicity: [
    /ethnic/i,
    /race/i,
    /racial/i,
  ],
  veteranStatus: [
    /veteran/i,
    /military/i,
    /protected[\s_-]?veteran/i,
  ],
  disability: [
    /disability/i,
    /disabled/i,
    /handicap/i,
  ],
};

// ---------------------------------------------------------------------------
// Platform URL Patterns
// ---------------------------------------------------------------------------

/**
 * URL patterns used to determine which platform adapter to activate.
 * Each key is a PlatformName, and the value is a regex tested against
 * the full page URL.
 */
export const PLATFORM_URL_PATTERNS: Record<string, RegExp> = {
  greenhouse: /boards\.greenhouse\.io|job-boards\.greenhouse\.io|\.greenhouse\.io\/.*\/jobs/i,
  lever: /jobs\.lever\.co/i,
  workday: /\.myworkdayjobs\.com/i,
  wellfound: /wellfound\.com/i,
  ashby: /jobs\.ashbyhq\.com/i,
  smartrecruiters: /jobs\.smartrecruiters\.com/i,
};

// ---------------------------------------------------------------------------
// Default Values
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: ExtensionSettings = {
  autoDetect: true,
  showNotifications: true,
  defaultResumeId: null,
  aiEnabled: false, // Off by default — requires setup later
};

export const DEFAULT_STORAGE: StorageSchema = {
  profile: null,
  applications: [],
  settings: DEFAULT_SETTINGS,
  undoSnapshot: null,
};

// ---------------------------------------------------------------------------
// Storage Keys
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  PROFILE: 'profile',
  APPLICATIONS: 'applications',
  SETTINGS: 'settings',
  UNDO_SNAPSHOT: 'undoSnapshot',
} as const;

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** Maximum number of tracked applications kept in local storage */
export const MAX_TRACKED_APPLICATIONS = 500;

/** Version of the storage schema — bump when making breaking changes */
export const STORAGE_SCHEMA_VERSION = 1;
