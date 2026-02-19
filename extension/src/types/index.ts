/**
 * File: types/index.ts
 * Purpose: Central type definitions for the JobHunter extension.
 *
 * All shared interfaces and types live here so that every module
 * (background, content, popup, options) imports from a single source of truth.
 */

// ---------------------------------------------------------------------------
// User Profile
// ---------------------------------------------------------------------------

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  website: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string; // ISO date string
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'language';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  customAnswers: CustomAnswer[];
  preferences: JobPreferences;
}

export interface CustomAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface JobPreferences {
  roles: string[];
  locations: string[];
  remoteOnly: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
}

// ---------------------------------------------------------------------------
// Form Detection
// ---------------------------------------------------------------------------

/** The classification of a detected form field */
export type FieldType =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'city'
  | 'state'
  | 'country'
  | 'zipCode'
  | 'address'
  | 'linkedinUrl'
  | 'githubUrl'
  | 'portfolioUrl'
  | 'website'
  | 'currentCompany'
  | 'currentTitle'
  | 'yearsOfExperience'
  | 'salary'
  | 'startDate'
  | 'coverLetter'
  | 'resume'
  | 'howDidYouHear'
  | 'workAuthorization'
  | 'sponsorship'
  | 'gender'
  | 'ethnicity'
  | 'veteranStatus'
  | 'disability'
  | 'customQuestion'
  | 'unknown';

/** A single detected form field with its metadata */
export interface DetectedField {
  element: HTMLElement;
  fieldType: FieldType;
  label: string;
  inputType: string; // 'text' | 'select' | 'textarea' | 'radio' | 'checkbox' | 'file'
  required: boolean;
  confidence: number; // 0–1 score of how confident we are about the classification
}

/** Result of scanning a page for application forms */
export interface FormDetectionResult {
  isApplicationForm: boolean;
  platform: PlatformName;
  fields: DetectedField[];
  formElement: HTMLFormElement | null;
  jobDetails: JobDetails | null;
}

/** Extracted job details from the page */
export interface JobDetails {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Form Filling
// ---------------------------------------------------------------------------

/** Result of filling a single field */
export interface FillResult {
  field: DetectedField;
  success: boolean;
  valueFilled: string;
  previousValue: string;
  error?: string;
}

/** Result of filling an entire form */
export interface FormFillResult {
  totalFields: number;
  filledFields: number;
  skippedFields: number;
  failedFields: number;
  results: FillResult[];
}

// ---------------------------------------------------------------------------
// Platform Adapters
// ---------------------------------------------------------------------------

export type PlatformName =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'wellfound'
  | 'ashby'
  | 'smartrecruiters'
  | 'generic';

/** Interface that every platform adapter must implement */
export interface PlatformAdapter {
  name: PlatformName;

  /** Returns true if this adapter can handle the current URL */
  matches(url: string): boolean;

  /** Scans the page and returns detected form fields */
  detectForm(document: Document): FormDetectionResult;

  /** Extracts job details (title, company, description) from the page */
  extractJobDetails(document: Document): JobDetails | null;
}

// ---------------------------------------------------------------------------
// Messaging (Content Script ↔ Background ↔ Popup)
// ---------------------------------------------------------------------------

export type MessageType =
  | 'DETECT_FORM'
  | 'FORM_DETECTED'
  | 'FILL_FORM'
  | 'FILL_RESULT'
  | 'UNDO_FILL'
  | 'UNDO_RESULT'
  | 'GET_PROFILE'
  | 'PROFILE_DATA'
  | 'SAVE_PROFILE'
  | 'PROFILE_SAVED'
  | 'GET_PLATFORM_STATUS'
  | 'PLATFORM_STATUS'
  | 'TRACK_APPLICATION'
  | 'APPLICATION_TRACKED'
  | 'PING'
  | 'PONG'
  // Backend integration messages
  | 'BACKEND_LOGIN'
  | 'BACKEND_REGISTER'
  | 'BACKEND_LOGOUT'
  | 'BACKEND_STATUS'
  | 'BACKEND_SYNC_PROFILE'
  | 'BACKEND_TRACK_APPLICATION'
  | 'AI_GENERATE_COVER_LETTER'
  | 'AI_GENERATE_ANSWER'
  | 'AI_SMART_ANSWER'
  | 'TRY_IMPORT_WEB_TOKEN';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  data?: T;
}

// ---------------------------------------------------------------------------
// Application Tracking
// ---------------------------------------------------------------------------

export type ApplicationStatus = 'draft' | 'submitted' | 'rejected' | 'interview' | 'offer';

export interface TrackedApplication {
  id: string;
  jobTitle: string;
  company: string;
  platform: PlatformName;
  jobUrl: string;
  status: ApplicationStatus;
  appliedAt: string | null; // ISO date
  lastUpdated: string; // ISO date
  notes: string;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** Shape of everything we persist in chrome.storage.local */
export interface StorageSchema {
  profile: UserProfile | null;
  applications: TrackedApplication[];
  settings: ExtensionSettings;
  /** Map of original field values before last auto-fill, keyed by CSS selector */
  undoSnapshot: Record<string, string> | null;
}

export interface ExtensionSettings {
  autoDetect: boolean;
  showNotifications: boolean;
  defaultResumeId: string | null;
  aiEnabled: boolean;
}
