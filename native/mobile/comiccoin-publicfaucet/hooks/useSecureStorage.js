// hooks/useSecureStorage.ts
import { useState, useCallback } from 'react';
import { saveData, loadData, removeData, updateData } from '../utils/secureStorage';

/**
 * Custom hook for using secure storage with React state
 *
 * @param storageKey - The key to use for storage
 * @param initialValue - Optional initial value
 * @returns Object with value, setter, loading state, and error
 */
function useSecureStorage<T>(storageKey: string, initialValue: T | null = null) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize by loading the value from storage
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storedValue = await loadData<T>(storageKey);
      setValue(storedValue);
    } catch (err) {
      console.error(`Error loading from secure storage (${storageKey}):`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Set a new value in state and storage
  const setStoredValue = useCallback(async (newValue: T) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update state
      setValue(newValue);

      // Save to storage
      await saveData(storageKey, newValue);
    } catch (err) {
      console.error(`Error saving to secure storage (${storageKey}):`, err);
      setError(err instanceof Error ? err : new Error(String(err)));

      // Revert state change on error
      setValue(await loadData<T>(storageKey));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Update partial data
  const updateStoredValue = useCallback(async (updates: Partial<T>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update in storage
      const updatedValue = await updateData<T>(storageKey, updates);

      // Update state
      setValue(updatedValue);

      return updatedValue;
    } catch (err) {
      console.error(`Error updating secure storage (${storageKey}):`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Remove the value from storage
  const removeStoredValue = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear state
      setValue(null);

      // Remove from storage
      await removeData(storageKey);
    } catch (err) {
      console.error(`Error removing from secure storage (${storageKey}):`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  return {
    value,
    setValue: setStoredValue,
    updateValue: updateStoredValue,
    removeValue: removeStoredValue,
    initialize,
    isLoading,
    error,
  };
}

export default useSecureStorage;
