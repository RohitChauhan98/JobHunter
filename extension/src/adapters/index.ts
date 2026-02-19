/**
 * File: adapters/index.ts
 * Purpose: Adapter registry that resolves the correct platform adapter for a URL.
 *
 * Adapters are checked in priority order (specific platforms first, generic last).
 * The registry caches the resolved adapter for the current page to avoid re-running
 * URL matching on every operation.
 *
 * Usage:
 *   const adapter = AdapterRegistry.resolve(window.location.href);
 *   const result = adapter.detectForm(document);
 */

import type { PlatformAdapter } from '@/types';
import { GreenhouseAdapter } from './GreenhouseAdapter';
import { LeverAdapter } from './LeverAdapter';
import { WorkdayAdapter } from './WorkdayAdapter';
import { AshbyAdapter } from './AshbyAdapter';
import { GenericAdapter } from './GenericAdapter';

/**
 * Ordered list of adapters, checked from first to last.
 * The GenericAdapter must always be last since it matches all URLs.
 */
const adapters: PlatformAdapter[] = [
  new GreenhouseAdapter(),
  new LeverAdapter(),
  new WorkdayAdapter(),
  new AshbyAdapter(),
  // Add new platform adapters above this line
  new GenericAdapter(),
];

/** Cache the last resolved adapter to avoid redundant URL matching */
let cachedUrl: string | null = null;
let cachedAdapter: PlatformAdapter | null = null;

export const AdapterRegistry = {
  /**
   * Find the first adapter whose `matches()` returns true for the given URL.
   *
   * @param url  The current page URL.
   * @returns The best matching PlatformAdapter (never null — GenericAdapter is the fallback).
   */
  resolve(url: string): PlatformAdapter {
    if (url === cachedUrl && cachedAdapter) {
      return cachedAdapter;
    }

    for (const adapter of adapters) {
      if (adapter.matches(url)) {
        cachedUrl = url;
        cachedAdapter = adapter;
        return adapter;
      }
    }

    // Should never happen because GenericAdapter.matches() always returns true
    const fallback = adapters[adapters.length - 1];
    cachedUrl = url;
    cachedAdapter = fallback;
    return fallback;
  },

  /**
   * Return all registered adapters (useful for testing and debugging).
   */
  getAll(): PlatformAdapter[] {
    return [...adapters];
  },

  /**
   * Clear the URL cache (useful when navigating to a new page via SPA routing).
   */
  clearCache(): void {
    cachedUrl = null;
    cachedAdapter = null;
  },
};
