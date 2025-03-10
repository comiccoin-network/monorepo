// utils/secureStorage.d.ts
export const AUTH_STORAGE_KEY: string;

/**
 * Save data securely with fallback to AsyncStorage for large data
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 * @returns Promise resolving when data is saved
 */
export function saveData<T>(key: string, value: T): Promise<void>;

/**
 * Load data from secure storage with fallback from AsyncStorage
 * @param key - Storage key
 * @returns Promise resolving to parsed data or null if not found
 */
export function loadData<T>(key: string): Promise<T | null>;

/**
 * Remove data from both secure storage and AsyncStorage fallback
 * @param key - Storage key
 * @returns Promise resolving when data is removed
 */
export function removeData(key: string): Promise<void>;

/**
 * Update specific fields within a stored object while preserving other fields
 * @param key - Storage key
 * @param updates - Object with fields to update
 * @returns Promise resolving to updated data object
 */
export function updateData<T extends Record<string, any>>(
  key: string,
  updates: Partial<T>,
): Promise<T>;
