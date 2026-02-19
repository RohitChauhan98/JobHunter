/**
 * File: content/shortcutExpander.ts
 * Purpose: Inline shortcut expander for manual form filling.
 *
 * When the user types `@` inside any text input or textarea on a job
 * application page, a floating dropdown appears listing all available
 * shortcuts (e.g. @linkedin, @email, @phone).  As the user types more
 * characters after `@`, the list filters in real time.
 *
 * Selecting a shortcut (via click, Enter, or Tab) replaces the `@keyword`
 * text with the actual profile value (e.g. https://linkedin.com/in/username).
 *
 * The profile data is fetched once from the background service worker and
 * cached. The dropdown auto-hides on blur / Escape / click-outside.
 *
 * Lifecycle:
 *   1. initShortcutExpander() called from content/index.ts
 *   2. Attaches global `input` + `keydown` listeners (delegated)
 *   3. On `@` trigger → fetches profile → shows dropdown
 *   4. On selection → replaces text → dispatches events for React compat
 */

import type { UserProfile } from '@/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const DROPDOWN_ID = 'jh-shortcut-dropdown';
const MAX_VISIBLE = 10;

// ─── Shortcut Definitions ───────────────────────────────────────────────────

interface ShortcutDef {
  /** The keyword typed after `@` */
  keyword: string;
  /** Human-readable label shown in the dropdown */
  label: string;
  /** Emoji icon for visual clarity */
  icon: string;
  /** Function to extract the value from the profile */
  resolve: (p: UserProfile) => string;
}

const SHORTCUTS: ShortcutDef[] = [
  // Identity
  { keyword: 'firstname',  label: 'First Name',      icon: '👤', resolve: (p) => p.personalInfo.firstName },
  { keyword: 'lastname',   label: 'Last Name',       icon: '👤', resolve: (p) => p.personalInfo.lastName },
  { keyword: 'fullname',   label: 'Full Name',       icon: '🪪', resolve: (p) => [p.personalInfo.firstName, p.personalInfo.lastName].filter(Boolean).join(' ') },

  // Contact
  { keyword: 'email',      label: 'Email',           icon: '✉️', resolve: (p) => p.personalInfo.email },
  { keyword: 'phone',      label: 'Phone',           icon: '📱', resolve: (p) => p.personalInfo.phone },

  // Links
  { keyword: 'linkedin',   label: 'LinkedIn URL',    icon: '💼', resolve: (p) => p.personalInfo.linkedinUrl },
  { keyword: 'github',     label: 'GitHub URL',      icon: '🐙', resolve: (p) => p.personalInfo.githubUrl },
  { keyword: 'portfolio',  label: 'Portfolio URL',   icon: '🌐', resolve: (p) => p.personalInfo.portfolioUrl },
  { keyword: 'website',    label: 'Website URL',     icon: '🔗', resolve: (p) => p.personalInfo.website },

  // Location
  { keyword: 'city',       label: 'City',            icon: '🏙️', resolve: (p) => p.personalInfo.city },
  { keyword: 'state',      label: 'State / Province',icon: '📍', resolve: (p) => p.personalInfo.state },
  { keyword: 'country',    label: 'Country',         icon: '🌍', resolve: (p) => p.personalInfo.country },
  { keyword: 'location',   label: 'Full Location',   icon: '📍', resolve: (p) => [p.personalInfo.city, p.personalInfo.state, p.personalInfo.country].filter(Boolean).join(', ') },

  // Work
  { keyword: 'company',    label: 'Current Company', icon: '🏢', resolve: (p) => p.experience?.[0]?.company || '' },
  { keyword: 'title',      label: 'Current Title',   icon: '💼', resolve: (p) => p.experience?.[0]?.title || '' },

  // Education
  { keyword: 'school',     label: 'University / School', icon: '🎓', resolve: (p) => p.education?.[0]?.institution || '' },
  { keyword: 'degree',     label: 'Degree',          icon: '🎓', resolve: (p) => {
    const e = p.education?.[0];
    return e ? `${e.degree} in ${e.field}` : '';
  }},

  // Skills
  { keyword: 'skills',     label: 'Top Skills',      icon: '🛠', resolve: (p) => (p.skills || []).slice(0, 8).map((s) => s.name).join(', ') },

  // Summary
  { keyword: 'summary',    label: 'Professional Summary', icon: '📝', resolve: (p) => (p as any).summary || '' },
];

// ─── State ──────────────────────────────────────────────────────────────────

let profile: UserProfile | null = null;
let profileLoading = false;
let activeInput: HTMLInputElement | HTMLTextAreaElement | null = null;
let triggerIndex = -1; // Cursor position of the `@` that started the shortcut
let selectedIdx = 0;   // Keyboard selection index in the dropdown
let initialized = false;

// ─── Profile Fetcher ────────────────────────────────────────────────────────

async function ensureProfile(): Promise<UserProfile | null> {
  if (profile) return profile;
  if (profileLoading) return null;

  profileLoading = true;
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
    if (response?.profile) {
      profile = response.profile;
    }
  } catch (err) {
    console.warn('[JobHunter Shortcuts] Failed to fetch profile:', err);
  } finally {
    profileLoading = false;
  }
  return profile;
}

// ─── Dropdown UI ────────────────────────────────────────────────────────────

function getDropdown(): HTMLDivElement {
  let el = document.getElementById(DROPDOWN_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = DROPDOWN_ID;
    el.setAttribute('role', 'listbox');
    document.body.appendChild(el);
  }
  return el;
}

function hideDropdown(): void {
  const dd = document.getElementById(DROPDOWN_ID);
  if (dd) dd.style.display = 'none';
  activeInput = null;
  triggerIndex = -1;
  selectedIdx = 0;
}

function showDropdown(
  matches: ShortcutDef[],
  anchor: HTMLInputElement | HTMLTextAreaElement,
): void {
  const dd = getDropdown();
  selectedIdx = 0;

  // Position near the input field
  const rect = anchor.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 4;
  const left = rect.left + window.scrollX;

  dd.style.cssText = `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    z-index: 2147483647;
    min-width: 260px;
    max-width: 360px;
    max-height: 320px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    padding: 4px;
    display: block;
  `;

  dd.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 6px 10px 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    user-select: none;
  `;
  header.textContent = '⚡ Quick Fill Shortcuts';
  dd.appendChild(header);

  if (matches.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding: 12px 10px; color: #94a3b8; text-align: center;';
    empty.textContent = 'No matching shortcut';
    dd.appendChild(empty);
    return;
  }

  matches.forEach((shortcut, idx) => {
    const value = profile ? shortcut.resolve(profile) : '';
    const row = document.createElement('div');
    row.setAttribute('role', 'option');
    row.dataset.idx = String(idx);

    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 7px;
      cursor: pointer;
      transition: background 0.1s;
      ${idx === selectedIdx ? 'background: #f1f5f9;' : ''}
    `;

    row.innerHTML = `
      <span style="font-size:16px;flex-shrink:0;width:22px;text-align:center">${shortcut.icon}</span>
      <span style="flex:1;min-width:0">
        <span style="font-weight:600;color:#1e293b">@${shortcut.keyword}</span>
        <span style="color:#94a3b8;margin-left:4px;font-size:11px">${shortcut.label}</span>
        ${value ? `<div style="font-size:11px;color:#64748b;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px">${escapeHtml(value)}</div>` : ''}
      </span>
    `;

    row.addEventListener('mouseenter', () => {
      // Update visual selection
      dd.querySelectorAll('[role="option"]').forEach((r, i) => {
        (r as HTMLDivElement).style.background = i === idx ? '#f1f5f9' : '';
      });
      selectedIdx = idx;
    });

    row.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevent blur before we handle the click
      applyShortcut(shortcut);
    });

    dd.appendChild(row);
  });
}

function updateDropdownSelection(): void {
  const dd = document.getElementById(DROPDOWN_ID);
  if (!dd) return;
  const rows = dd.querySelectorAll('[role="option"]');
  rows.forEach((row, idx) => {
    (row as HTMLDivElement).style.background = idx === selectedIdx ? '#f1f5f9' : '';
  });
}

// ─── Apply Shortcut ─────────────────────────────────────────────────────────

/**
 * Replace the `@keyword` text in the active input with the resolved value.
 * Dispatches React-compatible input events so frameworks pick up the change.
 */
function applyShortcut(shortcut: ShortcutDef): void {
  if (!activeInput || !profile || triggerIndex < 0) {
    hideDropdown();
    return;
  }

  const value = shortcut.resolve(profile);
  if (!value) {
    hideDropdown();
    return;
  }

  const el = activeInput;
  const currentVal = el.value;
  const cursor = el.selectionStart ?? currentVal.length;

  // The text from `@` to current cursor is the keyword text to replace
  const before = currentVal.slice(0, triggerIndex);
  const after = currentVal.slice(cursor);
  const newValue = before + value + after;

  // Use the native setter trick for React compatibility
  const nativeSetter =
    el instanceof HTMLTextAreaElement
      ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
      : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  if (nativeSetter) {
    nativeSetter.call(el, newValue);
  } else {
    el.value = newValue;
  }

  // Set cursor position after the inserted value
  const newCursor = before.length + value.length;
  el.setSelectionRange(newCursor, newCursor);

  // Dispatch events so React/Vue/Angular pick up the change
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));

  hideDropdown();
  el.focus();
}

// ─── Input Monitoring ───────────────────────────────────────────────────────

/**
 * Extract the current `@keyword` fragment being typed.
 * Returns null if there's no active `@` trigger.
 */
function getActiveQuery(el: HTMLInputElement | HTMLTextAreaElement): string | null {
  const cursor = el.selectionStart ?? 0;
  const text = el.value;

  // Walk backwards from cursor to find the `@` trigger
  let atPos = -1;
  for (let i = cursor - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === '@') {
      // Make sure the `@` is either at the start or preceded by whitespace
      if (i === 0 || /\s/.test(text[i - 1])) {
        atPos = i;
      }
      break;
    }
    // Stop if we hit whitespace (no `@` trigger in this word)
    if (/\s/.test(ch)) break;
  }

  if (atPos < 0) return null;

  triggerIndex = atPos;
  // The query is everything between `@` and the cursor
  return text.slice(atPos + 1, cursor).toLowerCase();
}

function filterShortcuts(query: string): ShortcutDef[] {
  if (!query) return SHORTCUTS.slice(0, MAX_VISIBLE);
  return SHORTCUTS.filter(
    (s) =>
      s.keyword.includes(query) ||
      s.label.toLowerCase().includes(query),
  ).slice(0, MAX_VISIBLE);
}

// ─── Event Handlers ─────────────────────────────────────────────────────────

function handleInput(e: Event): void {
  const el = e.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;

  // Only trigger on text-like inputs
  if (el instanceof HTMLInputElement) {
    const type = el.type.toLowerCase();
    if (!['text', 'email', 'url', 'tel', 'search', ''].includes(type)) return;
  }

  const query = getActiveQuery(el);
  if (query === null) {
    hideDropdown();
    return;
  }

  activeInput = el;

  // Fetch profile if we don't have it yet
  if (!profile) {
    ensureProfile().then((p) => {
      if (p && activeInput === el) {
        const q = getActiveQuery(el);
        if (q !== null) {
          const matches = filterShortcuts(q);
          showDropdown(matches, el);
        }
      }
    });
    // Show a loading state immediately
    const dd = getDropdown();
    const rect = el.getBoundingClientRect();
    dd.style.cssText = `
      position: absolute;
      top: ${rect.bottom + window.scrollY + 4}px;
      left: ${rect.left + window.scrollX}px;
      z-index: 2147483647;
      min-width: 260px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      padding: 12px;
      display: block;
      color: #94a3b8;
      text-align: center;
    `;
    dd.textContent = '⏳ Loading profile…';
    return;
  }

  const matches = filterShortcuts(query);
  showDropdown(matches, el);
}

function handleKeydown(e: KeyboardEvent): void {
  const dd = document.getElementById(DROPDOWN_ID);
  if (!dd || dd.style.display === 'none') return;
  if (!activeInput) return;

  const query = getActiveQuery(activeInput);
  if (query === null) {
    hideDropdown();
    return;
  }

  const matches = filterShortcuts(query);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, matches.length - 1);
      updateDropdownSelection();
      break;

    case 'ArrowUp':
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateDropdownSelection();
      break;

    case 'Enter':
    case 'Tab':
      if (matches.length > 0 && selectedIdx < matches.length) {
        e.preventDefault();
        applyShortcut(matches[selectedIdx]);
      }
      break;

    case 'Escape':
      e.preventDefault();
      hideDropdown();
      break;
  }
}

function handleClickOutside(e: MouseEvent): void {
  const dd = document.getElementById(DROPDOWN_ID);
  if (!dd || dd.style.display === 'none') return;
  if (!dd.contains(e.target as Node)) {
    hideDropdown();
  }
}

function handleFocusOut(_e: FocusEvent): void {
  // Delay hide to allow mousedown on dropdown to fire first
  setTimeout(() => {
    const dd = document.getElementById(DROPDOWN_ID);
    if (!dd) return;
    const active = document.activeElement;
    if (active !== activeInput && !dd.contains(active)) {
      hideDropdown();
    }
  }, 150);
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── Global CSS Injection ───────────────────────────────────────────────────

function injectShortcutStyles(): void {
  const styleId = 'jh-shortcut-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #${DROPDOWN_ID} {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }
    #${DROPDOWN_ID}::-webkit-scrollbar {
      width: 6px;
    }
    #${DROPDOWN_ID}::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    #${DROPDOWN_ID} [role="option"]:hover {
      background: #f1f5f9 !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialize the shortcut expander on the current page.
 * Safe to call multiple times (idempotent).
 */
export function initShortcutExpander(): void {
  if (initialized) return;
  initialized = true;

  injectShortcutStyles();

  // Use event delegation on the document level so we catch dynamically added inputs
  document.addEventListener('input', handleInput, true);
  document.addEventListener('keydown', handleKeydown, true);
  document.addEventListener('mousedown', handleClickOutside, true);
  document.addEventListener('focusout', handleFocusOut, true);

  console.log('[JobHunter] ⚡ Shortcut expander initialized — type @ in any input');
}

/**
 * Tear down the shortcut expander (for cleanup / testing).
 */
export function destroyShortcutExpander(): void {
  if (!initialized) return;
  initialized = false;

  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('keydown', handleKeydown, true);
  document.removeEventListener('mousedown', handleClickOutside, true);
  document.removeEventListener('focusout', handleFocusOut, true);

  const dd = document.getElementById(DROPDOWN_ID);
  if (dd) dd.remove();

  const style = document.getElementById('jh-shortcut-styles');
  if (style) style.remove();
}

/**
 * Force-refresh the cached profile data.
 * Called after user updates their profile from the popup/dashboard.
 */
export function refreshShortcutProfile(): void {
  profile = null;
}

/**
 * Get the list of supported shortcuts (for displaying in UI/help).
 */
export function getShortcutList(): Array<{ keyword: string; label: string; icon: string }> {
  return SHORTCUTS.map(({ keyword, label, icon }) => ({ keyword, label, icon }));
}
