/**
 * hooks/useSecureStorage.ts
 *
 * PURPOSE:
 * This file implements a custom React Hook called "useSecureStorage" that combines React's state
 * management with secure storage operations. It allows components to easily read, write, update,
 * and delete sensitive data while keeping the UI in sync with the stored values.
 *
 * WHAT IS A CUSTOM HOOK?
 * In React, a custom hook is a JavaScript function that starts with "use" and may call other hooks.
 * Custom hooks let you extract component logic into reusable functions. This particular hook
 * abstracts away all the complexity of working with secure storage.
 *
 * SECURE STORAGE:
 * Secure storage refers to encrypted, protected storage areas on a device where sensitive
 * information (like tokens, user IDs, or preferences) can be safely stored. On iOS, this might
 * use the Keychain, while Android might use the EncryptedSharedPreferences.
 */

import { useState, useCallback } from 'react';
import { saveData, loadData, removeData, updateData } from '../utils/secureStorage';

/**
 * Custom hook for using secure storage with React state
 *
 * This hook synchronizes React state with secure storage, providing a complete
 * interface to work with stored data. It includes loading states, error handling,
 * and methods to manipulate the stored data.
 *
 * The generic type parameter <T> allows this hook to work with any data type,
 * making it versatile for different storage needs (objects, arrays, primitives).
 *
 * @param storageKey - The key to use for storage (like a filename or identifier)
 * @param initialValue - Optional initial value to use before loading from storage
 * @returns Object with value, setter, loading state, and error
 *
 * Example usage:
 * const { value: user, setValue: setUser, isLoading, error } = useSecureStorage('user', null);
 */
function useSecureStorage<T>(storageKey: string, initialValue: T | null = null) {
  /**
   * State for storing the current value
   *
   * This state will be synchronized with the secure storage. When the storage
   * changes, this state updates, which causes React components to re-render.
   *
   * The generic type <T | null> means this can hold either a value of type T or null.
   */
  const [value, setValue] = useState<T | null>(initialValue);

  /**
   * State for tracking loading operations
   *
   * This boolean state indicates whether a storage operation is in progress.
   * Components can use this to show loading indicators during storage operations.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * State for tracking errors
   *
   * If any storage operation fails, this state will hold the error object.
   * Components can use this to display error messages to users.
   */
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize by loading the value from storage
   *
   * This function loads the initial value from secure storage. It's separate
   * from the constructor so components can control when to load data (for example,
   * after handling permissions or other initialization steps).
   *
   * The useCallback hook ensures this function doesn't get recreated on every render,
   * which is important for performance and to prevent infinite loops.
   */
  const initialize = useCallback(async () => {
    try {
      // Set loading state to true to indicate an operation is in progress
      setIsLoading(true);

      // Clear any previous errors
      setError(null);

      // Load the value from secure storage using the provided key
      // The <T> type parameter tells TypeScript what type of data to expect
      const storedValue = await loadData<T>(storageKey);

      // Update our state with the loaded value
      setValue(storedValue);
    } catch (err) {
      // If anything goes wrong during loading, log the error
      console.error(`Error loading from secure storage (${storageKey}):`, err);

      // Store the error in state so the component can access it
      // This checks if err is already an Error object, or converts it to one if not
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      // Whether successful or not, we're done loading
      setIsLoading(false);
    }
  }, [storageKey]); // Only re-create this function if storageKey changes

  /**
   * Set a new value in state and storage
   *
   * This function updates both the React state and the secure storage with a new value.
   * It handles the synchronization between the two, ensuring they stay consistent.
   *
   * If the storage operation fails, it will attempt to revert the state to match
   * what's actually in storage.
   */
  const setStoredValue = useCallback(async (newValue: T) => {
    try {
      // Set loading state to true to indicate an operation is in progress
      setIsLoading(true);

      // Clear any previous errors
      setError(null);

      // Update React state first for immediate UI feedback
      // This creates a responsive user experience even before the async storage completes
      setValue(newValue);

      // Then persist the value to secure storage
      // This is an async operation that might take some time
      await saveData(storageKey, newValue);
    } catch (err) {
      // If saving fails, log the error
      console.error(`Error saving to secure storage (${storageKey}):`, err);

      // Store the error in state
      setError(err instanceof Error ? err : new Error(String(err)));

      // Important: If we failed to save to storage, the state and storage are now out of sync.
      // To fix this, we reload the actual value from storage and update state
      // This ensures our UI accurately reflects what's really in storage
      setValue(await loadData<T>(storageKey));
    } finally {
      // Whether successful or not, we're done loading
      setIsLoading(false);
    }
  }, [storageKey]); // Only re-create this function if storageKey changes

  /**
   * Update partial data
   *
   * This function is specifically for updating objects stored in secure storage.
   * Instead of replacing the entire object, it merges the updates with the existing data.
   *
   * This is useful for large objects where you only want to change a few properties,
   * or when multiple components might update different parts of the same object.
   *
   * @returns The updated value, or null if the operation failed
   */
  const updateStoredValue = useCallback(async (updates: Partial<T>) => {
    try {
      // Set loading state to true to indicate an operation is in progress
      setIsLoading(true);

      // Clear any previous errors
      setError(null);

      // Update in storage first
      // The updateData function merges the updates with the existing data in storage
      // and returns the complete updated object
      const updatedValue = await updateData<T>(storageKey, updates);

      // Then update React state with the complete updated object
      setValue(updatedValue);

      // Return the updated value so the caller can use it if needed
      return updatedValue;
    } catch (err) {
      // If updating fails, log the error
      console.error(`Error updating secure storage (${storageKey}):`, err);

      // Store the error in state
      setError(err instanceof Error ? err : new Error(String(err)));

      // Return null to indicate failure
      return null;
    } finally {
      // Whether successful or not, we're done loading
      setIsLoading(false);
    }
  }, [storageKey]); // Only re-create this function if storageKey changes

  /**
   * Remove the value from storage
   *
   * This function deletes the data from secure storage completely.
   * It also updates the React state to null to reflect that the data no longer exists.
   */
  const removeStoredValue = useCallback(async () => {
    try {
      // Set loading state to true to indicate an operation is in progress
      setIsLoading(true);

      // Clear any previous errors
      setError(null);

      // Update React state to null first for immediate UI feedback
      setValue(null);

      // Then remove the data from secure storage
      await removeData(storageKey);
    } catch (err) {
      // If removal fails, log the error
      console.error(`Error removing from secure storage (${storageKey}):`, err);

      // Store the error in state
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      // Whether successful or not, we're done loading
      setIsLoading(false);
    }
  }, [storageKey]); // Only re-create this function if storageKey changes

  /**
   * Return the hook's interface
   *
   * This object contains everything a component needs to work with secure storage:
   * - The current value
   * - Functions to modify the storage
   * - Loading and error states for UI feedback
   */
  return {
    value,                  // The current value from storage (or initialValue if not loaded yet)
    setValue: setStoredValue,       // Function to completely replace the stored value
    updateValue: updateStoredValue, // Function to update parts of an object in storage
    removeValue: removeStoredValue, // Function to delete the value from storage
    initialize,             // Function to load the initial value from storage
    isLoading,              // Boolean indicating if a storage operation is in progress
    error,                  // Error object if the last operation failed, or null
  };
}

export default useSecureStorage;
