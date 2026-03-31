/**
 * File: content/pageScraper.ts
 * Purpose: Extracts company info, job description, and question context from
 *          the current job application page.
 *
 * This module scrapes page content to build rich context for AI-generated
 * smart answers. It works across multiple ATS platforms with generic fallbacks.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageContext {
  companyName: string;
  companyInfo: string;
  jobTitle: string;
  jobDescription: string;
  jobUrl: string;
}

export interface QuestionContext {
  question: string;
  element: HTMLTextAreaElement | HTMLInputElement;
  /** Maximum character length from maxlength attribute or character counter, if any */
  maxLength?: number;
}

function isVisible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;

  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function queryFirstVisible(root: ParentNode, selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const matches = root.querySelectorAll(selector);
    for (const match of matches) {
      if (isVisible(match)) return match;
    }
  }

  return null;
}

function extractText(el: Element | null | undefined, maxLength: number): string {
  return el?.textContent?.replace(/\s+/g, ' ').trim().slice(0, maxLength) || '';
}

function pickLongestVisibleText(root: ParentNode, selectors: string[], minLength = 0, maxLength = 5000): string {
  let best = '';

  for (const selector of selectors) {
    const matches = root.querySelectorAll(selector);

    for (const match of matches) {
      if (!isVisible(match)) continue;

      const text = extractText(match, maxLength);
      if (text.length >= minLength && text.length > best.length) {
        best = text;
      }
    }
  }

  return best;
}

function findAncestorWithText(el: HTMLElement | null, minLength: number): HTMLElement | null {
  let current = el?.parentElement ?? null;
  let depth = 0;

  while (current && current !== document.body && depth < 6) {
    const text = extractText(current, 12000);
    if (text.length >= minLength) return current;
    current = current.parentElement;
    depth++;
  }

  return null;
}

const WELLFOUND_TITLE_SELECTORS = [
  '[data-test="JobDetail-title"]',
  '[data-test*="JobDetail"][data-test*="title"]',
  'h1[class*="title"]',
  '[class*="job-detail"] h1',
  '[class*="jobDetail"] h1',
  'main h1',
  'article h1',
  'h1',
];

const WELLFOUND_COMPANY_SELECTORS = [
  '[data-test="JobDetail-companyName"]',
  '[data-test*="JobDetail"][data-test*="company"]',
  'a[href*="/company/"]',
  'h2[class*="company"]',
  '[class*="company-name"]',
  '[class*="companyName"]',
];

const WELLFOUND_DESCRIPTION_SELECTORS = [
  '[data-test="JobDetail-description"]',
  '[data-test*="JobDetail"][data-test*="description"]',
  '[class*="job-description"]',
  '[class*="jobDescription"]',
  '[class*="listing-description"]',
  'article',
  'section',
];

const WELLFOUND_COMPANY_INFO_SELECTORS = [
  '[data-test="CompanyDescription"]',
  '[data-test*="CompanyDescription"]',
  '[class*="company-description"]',
  '[class*="companyDescription"]',
  '[class*="about-company"]',
  '[class*="aboutCompany"]',
  '[class*="about-section"]',
];

function resolveWellfoundDetailRoot(anchor?: HTMLElement | null): HTMLElement | null {
  if (anchor) {
    let current: HTMLElement | null = anchor;
    let best: HTMLElement | null = null;
    let depth = 0;

    while (current && current !== document.body && depth < 10) {
      const hasTitle = !!queryFirstVisible(current, WELLFOUND_TITLE_SELECTORS);
      const hasDescription = !!pickLongestVisibleText(current, WELLFOUND_DESCRIPTION_SELECTORS, 200, 5000);

      if (hasTitle || hasDescription) {
        best = current;
      }

      if (hasTitle && hasDescription) {
        return current;
      }

      current = current.parentElement;
      depth++;
    }

    if (best) return best;
  }

  const title = queryFirstVisible(document, [
    '[data-test="JobDetail-title"]',
    '[data-test*="JobDetail"][data-test*="title"]',
    '[class*="job-detail"] h1',
    '[class*="jobDetail"] h1',
    'main h1',
    'article h1',
  ]);

  if (!title) return null;

  return (
    title.closest<HTMLElement>('[data-test*="JobDetail"]') ||
    title.closest<HTMLElement>('main') ||
    title.closest<HTMLElement>('article') ||
    title.closest<HTMLElement>('section') ||
    findAncestorWithText(title, 600)
  );
}

// ---------------------------------------------------------------------------
// Platform-Specific Scrapers
// ---------------------------------------------------------------------------

function scrapeGreenhouse(): Partial<PageContext> {
  const ctx: Partial<PageContext> = {};

  // Company name: usually in the header or logo alt text
  const companyEl = document.querySelector('.company-name, [class*="company"], .logo img');
  if (companyEl) {
    ctx.companyName = companyEl instanceof HTMLImageElement
      ? companyEl.alt
      : companyEl.textContent?.trim() || '';
  }

  // Job title
  const titleEl = document.querySelector('.app-title, h1.heading, .job-title');
  ctx.jobTitle = titleEl?.textContent?.trim() || '';

  // Job description — Greenhouse puts it in #content or .job-post-content
  const descEl = document.querySelector('#content .body, .job-post-content, [class*="job-description"]');
  ctx.jobDescription = descEl?.textContent?.trim().slice(0, 5000) || '';

  return ctx;
}

function scrapeLever(): Partial<PageContext> {
  const ctx: Partial<PageContext> = {};

  const titleEl = document.querySelector('.posting-headline h2, .posting-title');
  ctx.jobTitle = titleEl?.textContent?.trim() || '';

  const companyEl = document.querySelector('.posting-headline .company-name, .main-header-logo img');
  if (companyEl) {
    ctx.companyName = companyEl instanceof HTMLImageElement
      ? companyEl.alt
      : companyEl.textContent?.trim() || '';
  }

  // Lever puts description in .posting-page sections
  const sections = document.querySelectorAll('.section-wrapper .section');
  const descParts: string[] = [];
  sections.forEach((s) => {
    const text = s.textContent?.trim();
    if (text && text.length > 50) descParts.push(text);
  });
  ctx.jobDescription = descParts.join('\n\n').slice(0, 5000);

  return ctx;
}

function scrapeWellfoundFromAnchor(anchor?: HTMLElement | null): Partial<PageContext> {
  const ctx: Partial<PageContext> = {};
  const detailRoot = resolveWellfoundDetailRoot(anchor) || resolveWellfoundDetailRoot() || document;
  const detailRootEl = detailRoot instanceof HTMLElement ? detailRoot : null;

  const titleEl = queryFirstVisible(detailRoot, WELLFOUND_TITLE_SELECTORS);
  ctx.jobTitle = extractText(titleEl, 300);

  const companyEl = queryFirstVisible(detailRoot, WELLFOUND_COMPANY_SELECTORS);
  ctx.companyName = extractText(companyEl, 300);

  ctx.companyInfo = pickLongestVisibleText(detailRoot, WELLFOUND_COMPANY_INFO_SELECTORS, 80, 2000);
  ctx.jobDescription = pickLongestVisibleText(detailRoot, WELLFOUND_DESCRIPTION_SELECTORS, 200, 5000);

  if (!ctx.jobDescription && detailRootEl) {
    ctx.jobDescription = extractText(detailRootEl, 5000);
  }

  if (!ctx.companyName) {
    ctx.companyName = extractText(queryFirstVisible(detailRoot, ['[class*="company"]', 'a[href*="/company/"]']), 300);
  }

  if (!ctx.jobTitle) {
    ctx.jobTitle = extractText(queryFirstVisible(detailRoot, ['h1', 'h2']), 300);
  }

  return ctx;
}

function shouldUseGenericFallback(url: string): boolean {
  // Wellfound keeps job lists mounted beside the active detail pane, so global
  // selectors often resolve to the wrong card. For this platform we rely on
  // the scoped scraper above instead of document-wide fallbacks.
  return !(url.includes('wellfound.com') || url.includes('angel.co'));
}

function scrapeWorkday(): Partial<PageContext> {
  const ctx: Partial<PageContext> = {};

  const titleEl = document.querySelector('[data-automation-id="jobPostingHeader"], h2[data-automation-id]');
  ctx.jobTitle = titleEl?.textContent?.trim() || '';

  // Workday usually has company in the URL or page title
  const pageTitle = document.title;
  const match = pageTitle.match(/^(.*?)\s*[-–|]/);
  if (match) ctx.companyName = match[1].trim();

  const descEl = document.querySelector('[data-automation-id="jobPostingDescription"]');
  ctx.jobDescription = descEl?.textContent?.trim().slice(0, 5000) || '';

  return ctx;
}

// ---------------------------------------------------------------------------
// Generic Scraper (Fallback)
// ---------------------------------------------------------------------------

function scrapeGeneric(): Partial<PageContext> {
  const ctx: Partial<PageContext> = {};

  // Try to extract company name from meta tags, og:site_name, or page title
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  ctx.companyName = ogSiteName?.getAttribute('content')?.trim()
    || document.title.split(/[-–|]/)[0]?.trim()
    || '';

  // Job title from h1 or og:title
  const h1 = document.querySelector('h1');
  ctx.jobTitle = h1?.textContent?.trim()
    || ogTitle?.getAttribute('content')?.trim()
    || '';

  // Job description: look for common containers
  const descSelectors = [
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[class*="description"]',
    '[id*="job-description"]',
    '[id*="jobDescription"]',
    'article',
    '.content',
    'main',
  ];

  for (const sel of descSelectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 200) {
      ctx.jobDescription = text.slice(0, 5000);
      break;
    }
  }

  // Company about section
  const aboutSelectors = [
    '[class*="company-description"]',
    '[class*="companyDescription"]',
    '[class*="about-company"]',
    '[class*="aboutCompany"]',
    '[class*="company-info"]',
  ];

  for (const sel of aboutSelectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim();
    if (text && text.length > 50) {
      ctx.companyInfo = text.slice(0, 2000);
      break;
    }
  }

  return ctx;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scrape the current page for company info, job details, and context.
 * Auto-detects the platform and uses the appropriate scraper with
 * generic fallbacks for any missing fields.
 */
export function scrapePageContext(anchor?: HTMLElement | null): PageContext {
  const url = window.location.href;
  let platformCtx: Partial<PageContext> = {};

  if (url.includes('greenhouse.io') || url.includes('boards.greenhouse')) {
    platformCtx = scrapeGreenhouse();
  } else if (url.includes('lever.co') || url.includes('jobs.lever')) {
    platformCtx = scrapeLever();
  } else if (url.includes('wellfound.com') || url.includes('angel.co')) {
    platformCtx = scrapeWellfoundFromAnchor(anchor);
  } else if (url.includes('myworkdayjobs.com') || url.includes('workday.com')) {
    platformCtx = scrapeWorkday();
  }

  // Fill gaps with generic scraper for platforms where document-wide selectors
  // are safe enough to use.
  const generic = shouldUseGenericFallback(url) ? scrapeGeneric() : {};
  const merged: PageContext = {
    companyName: platformCtx.companyName || generic.companyName || '',
    companyInfo: platformCtx.companyInfo || generic.companyInfo || '',
    jobTitle: platformCtx.jobTitle || generic.jobTitle || '',
    jobDescription: platformCtx.jobDescription || generic.jobDescription || '',
    jobUrl: url,
  };

  return merged;
}

/**
 * Find all question-type textareas and text inputs on the page that
 * likely need custom answers (e.g., "Why do you want to work here?").
 *
 * Returns elements that:
 * - Are textareas or large text inputs
 * - Have an associated label/question text
 * - Are not already auto-filled standard fields (name, email, etc.)
 */
export function findQuestionFields(): QuestionContext[] {
  const questions: QuestionContext[] = [];

  // Standard field keywords to exclude
  const standardFieldPatterns = /^(first\s*name|last\s*name|full\s*name|email|phone|city|state|country|zip|address|linkedin|github|portfolio|website|salary|resume|cv|cover\s*letter)$/i;

  // Find all textareas
  const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');
  textareas.forEach((ta) => {
    const label = getFieldLabel(ta);
    if (label && !standardFieldPatterns.test(label.trim()) && label.length > 5) {
      const maxLen = detectMaxLength(ta);
      questions.push({ question: label, element: ta, ...(maxLen ? { maxLength: maxLen } : {}) });
    }
  });

  // Find text inputs that are likely question fields (large inputs with question-like labels)
  const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
  inputs.forEach((input) => {
    const label = getFieldLabel(input);
    if (!label || standardFieldPatterns.test(label.trim())) return;

    // Only include if the label looks like a question (has "?", "why", "what", "how", "describe", etc.)
    const questionLike = /\?|why|what|how|describe|explain|tell\s+us|share|elaborate|interested|motivat|excit/i;
    if (questionLike.test(label) && label.length > 10) {
      const maxLen = detectMaxLength(input);
      questions.push({ question: label, element: input, ...(maxLen ? { maxLength: maxLen } : {}) });
    }
  });

  return questions;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect the maximum character length for a field.
 * Checks: maxlength attribute, aria-valuenow, and nearby character counter text.
 */
function detectMaxLength(element: HTMLElement): number | null {
  // 1. Direct maxlength attribute
  const maxLengthAttr = element.getAttribute('maxlength');
  if (maxLengthAttr) {
    const val = parseInt(maxLengthAttr, 10);
    if (!isNaN(val) && val > 0) return val;
  }

  // 2. Look for character counter text near the field
  const container = element.closest('.field, .form-group, .form-field, [class*="question"], [class*="field"]') || element.parentElement;
  if (container) {
    const counterPatterns = [
      /\/\s*(\d+)/,              // "0 / 500" or "12/500"
      /(\d+)\s*character/i,      // "500 characters max"
      /max(?:imum)?[:\s]*(\d+)/i, // "max: 500"
      /limit[:\s]*(\d+)/i,       // "limit: 500"
    ];
    const textNodes = container.querySelectorAll('span, div, p, small, label');
    for (const node of textNodes) {
      if (node === element) continue;
      const text = node.textContent?.trim() || '';
      if (text.length > 100) continue;
      for (const pattern of counterPatterns) {
        const match = text.match(pattern);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > 0 && num < 100000) return num;
        }
      }
    }
  }

  return null;
}

/**
 * Extract the label/question text for a form field.
 * Checks: <label>, aria-label, placeholder, preceding text, parent label.
 */
function getFieldLabel(element: HTMLElement): string {
  // 1. Explicit <label for="id">
  if (element.id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`);
    if (label?.textContent?.trim()) return label.textContent.trim();
  }

  // 2. Wrapping <label>
  const parentLabel = element.closest('label');
  if (parentLabel) {
    // Get label text excluding the input's own text
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, textarea, select').forEach((el) => el.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }

  // 3. aria-label or aria-labelledby
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelEl = document.getElementById(ariaLabelledBy);
    if (labelEl?.textContent?.trim()) return labelEl.textContent.trim();
  }

  // 4. Preceding sibling or parent text
  const prevSibling = element.previousElementSibling;
  if (prevSibling && (prevSibling.tagName === 'LABEL' || prevSibling.tagName === 'SPAN' || prevSibling.tagName === 'DIV')) {
    const text = prevSibling.textContent?.trim();
    if (text && text.length > 3 && text.length < 500) return text;
  }

  // 4b. Walk up DOM checking siblings at each parent level.
  //     Handles ATS platforms (Lever, etc.) where the textarea is nested
  //     inside wrapper divs and the question text is a sibling of a parent.
  {
    let walker: HTMLElement | null = element.parentElement;
    for (let lvl = 0; lvl < 4 && walker && walker !== document.body && walker.tagName !== 'FORM'; lvl++) {
      const prevSib = walker.previousElementSibling as HTMLElement | null;
      if (prevSib && !prevSib.querySelector('input, textarea, select')) {
        const text = prevSib.textContent?.trim();
        if (text && text.length > 5 && text.length < 1000) return text;
      }
      walker = walker.parentElement;
    }
  }

  // 5. Look up in parent container for a question/label element.
  //    Try up to 2 matching container levels in case the nearest match
  //    is only the input wrapper (e.g. "posting-field__input") rather
  //    than the full question wrapper.
  {
    const containerSel = [
      '.field', '.form-group', '.form-field',
      '[class*="question"]', '[class*="field"]',
      '.custom-question', '.application-field',
      '.application-additional', '.application-question',
    ].join(', ');
    const labelSel = 'label, .label, [class*="label"], [class*="question-text"], h3, h4, h5, legend, p';

    let ctr: Element | null = element.closest(containerSel);
    for (let attempt = 0; attempt < 2 && ctr && ctr !== document.body; attempt++) {
      const labelEl = ctr.querySelector(labelSel);
      if (labelEl?.textContent?.trim()) return labelEl.textContent.trim();
      ctr = ctr.parentElement?.closest(containerSel) || null;
    }
  }

  // 5b. Last-resort container text extraction: walk up to 4 parents,
  //     clone the subtree, remove form elements, and use remaining text.
  {
    let tp: HTMLElement | null = element.parentElement;
    for (let i = 0; i < 4 && tp && tp !== document.body && tp.tagName !== 'FORM'; i++) {
      const clone = tp.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('input, textarea, select, button, script, style').forEach(el => el.remove());
      const raw = clone.textContent?.trim();
      if (raw && raw.length > 10 && raw.length < 1000) return raw;
      tp = tp.parentElement;
    }
  }

  // 6. Placeholder as last resort
  const placeholder = element.getAttribute('placeholder');
  if (placeholder?.trim()) return placeholder.trim();

  return '';
}
