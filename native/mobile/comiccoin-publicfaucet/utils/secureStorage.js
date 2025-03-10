// utils/secureStorage.js
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for storage keys
export const AUTH_STORAGE_KEY = "auth_data";

// Maximum size for SecureStore values (varies by device but ~2KB is safe)
const MAX_SECURE_STORE_SIZE = 2000; // characters

/**
 * Check if the data size exceeds the maximum size for SecureStore
 * @param {string} value - Value to check
 * @returns {boolean} True if the value is too large for SecureStore
 */
const isDataTooLarge = (value) => {
  return value && value.length > MAX_SECURE_STORE_SIZE;
};

/**
 * Save data securely with fallback to AsyncStorage for large data
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {Promise<void>}
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);

    // Log size of data for debugging purposes during development
    if (__DEV__) {
      console.log(
        `📦 Storage: Saving data for ${key}, size: ${jsonValue.length} chars`,
      );
    }

    // Use SecureStore if data is small enough
    if (!isDataTooLarge(jsonValue)) {
      await SecureStore.setItemAsync(key, jsonValue);

      // Also remove any potential fallback from AsyncStorage to avoid stale data
      await AsyncStorage.removeItem(`fallback_${key}`);

      if (__DEV__) {
        console.log(`🔒 Saved to SecureStore: ${key}`);
      }
    } else {
      // For large data, fall back to AsyncStorage with a warning
      console.warn(
        `⚠️ Data for ${key} exceeds secure storage size limits (${jsonValue.length} chars). Using AsyncStorage fallback.`,
      );
      await AsyncStorage.setItem(`fallback_${key}`, jsonValue);
    }
  } catch (error) {
    console.error(`❌ Error saving data for ${key}:`, error);
    throw error;
  }
};

/**
 * Load data from secure storage with fallback from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<any>} Parsed data or null if not found
 */
export const loadData = async (key) => {
  try {
    // Try SecureStore first
    let jsonValue = await SecureStore.getItemAsync(key);

    // If not found in SecureStore, check AsyncStorage fallback
    if (!jsonValue) {
      jsonValue = await AsyncStorage.getItem(`fallback_${key}`);

      if (jsonValue && __DEV__) {
        console.log(`📤 Retrieved from AsyncStorage fallback: ${key}`);
      }
    } else if (__DEV__) {
      console.log(`🔓 Retrieved from SecureStore: ${key}`);
    }

    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`❌ Error loading data for ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from both secure storage and AsyncStorage fallback
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export const removeData = async (key) => {
  try {
    // Remove from both SecureStore and AsyncStorage to ensure it's fully deleted
    await SecureStore.deleteItemAsync(key);
    await AsyncStorage.removeItem(`fallback_${key}`);

    if (__DEV__) {
      console.log(`🗑️ Removed data: ${key}`);
    }
  } catch (error) {
    console.error(`❌ Error removing data for ${key}:`, error);
    throw error;
  }
};

/**
 * Update specific fields within a stored object while preserving other fields
 * @param {string} key - Storage key
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} Updated data object
 */
export const updateData = async (key, updates) => {
  try {
    // Get existing data
    const existingData = (await loadData(key)) || {};

    // Merge with updates
    const updatedData = { ...existingData, ...updates };

    // Save the updated data
    await saveData(key, updatedData);

    return updatedData;
  } catch (error) {
    console.error(`❌ Error updating data for ${key}:`, error);
    throw error;
  }
};
