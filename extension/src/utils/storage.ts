/**
 * File: utils/storage.ts
 * Purpose: Typed wrapper around chrome.storage.local.
 *
 * Provides type-safe get/set helpers and manages default values.
 * All extension components should use these helpers instead of
 * calling chrome.storage directly.
 *
 * Usage:
 *   const profile = await storage.get('profile');
 *   await storage.set('profile', updatedProfile);
 */

import type { StorageSchema } from '@/types';
import { DEFAULT_STORAGE, STORAGE_KEYS } from './constants';

type StorageKey = keyof StorageSchema;

/**
 * Read a single value from chrome.storage.local with a typed default fallback.
 *
 * @param key  The storage key to read.
 * @returns The stored value, or the default from DEFAULT_STORAGE.
 */
async function get<K extends StorageKey>(key: K): Promise<StorageSchema[K]> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as StorageSchema[K]) ?? DEFAULT_STORAGE[key];
}

/**
 * Write a single value to chrome.storage.local.
 *
 * @param key    The storage key.
 * @param value  The value to persist.
 */
async function set<K extends StorageKey>(key: K, value: StorageSchema[K]): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Read the entire storage schema at once.
 *
 * @returns A full StorageSchema object, with defaults filled in for any missing keys.
 */
async function getAll(): Promise<StorageSchema> {
  const keys = Object.values(STORAGE_KEYS);
  const result = await chrome.storage.local.get(keys);
  return {
    profile: result[STORAGE_KEYS.PROFILE] ?? DEFAULT_STORAGE.profile,
    applications: result[STORAGE_KEYS.APPLICATIONS] ?? DEFAULT_STORAGE.applications,
    settings: result[STORAGE_KEYS.SETTINGS] ?? DEFAULT_STORAGE.settings,
    undoSnapshot: result[STORAGE_KEYS.UNDO_SNAPSHOT] ?? DEFAULT_STORAGE.undoSnapshot,
  };
}

/**
 * Clear all extension data from chrome.storage.local.
 * Primarily useful for debugging and testing.
 */
async function clear(): Promise<void> {
  await chrome.storage.local.clear();
}

export const storage = { get, set, getAll, clear };
