// utils/secureStorage.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for storage keys
export const AUTH_STORAGE_KEY = 'auth_data';

// Maximum size for SecureStore values (2KB is safe)
const MAX_SECURE_STORE_SIZE = 2000; // characters

/**
 * Split large objects into smaller chunks for secure storage
 * @param {string} key - Base key for storage
 * @param {Object} value - Large object to split
 * @returns {Object} Object with sensitive fields separated
 */
const splitLargeObject = (key, value) => {
  if (!value || typeof value !== 'object') return { mainData: value };

  // For auth data, separate the tokens from user info
  if (key === AUTH_STORAGE_KEY) {
    const { access_token, refresh_token, user, ...otherData } = value;

    return {
      // Store tokens securely
      sensitive: { access_token, refresh_token },
      // Store other data in regular storage
      mainData: { ...otherData, user }
    };
  }

  return { mainData: value };
};

/**
 * Save data securely with chunking for large objects
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {Promise<void>}
 */
export const saveData = async (key, value) => {
  try {
    // Split large objects for efficient secure storage
    const { sensitive, mainData } = splitLargeObject(key, value);

    if (sensitive) {
      // Store sensitive data in SecureStore
      const sensitiveJson = JSON.stringify(sensitive);
      if (__DEV__) {
        console.log(`🔒 Saving sensitive data for ${key}, size: ${sensitiveJson.length} chars`);
      }
      await SecureStore.setItemAsync(`${key}_sensitive`, sensitiveJson);
    }

    // Store main data
    const mainJson = JSON.stringify(mainData);
    if (__DEV__) {
      console.log(`📦 Saving main data for ${key}, size: ${mainJson.length} chars`);
    }

    // Use SecureStore if possible, otherwise AsyncStorage
    if (mainJson.length <= MAX_SECURE_STORE_SIZE) {
      await SecureStore.setItemAsync(key, mainJson);
      if (__DEV__) {
        console.log(`🔒 Saved to SecureStore: ${key}`);
      }
    } else {
      // For large data, fall back to AsyncStorage
      console.log(`ℹ️ Data for ${key} using AsyncStorage fallback (${mainJson.length} chars)`);
      await AsyncStorage.setItem(key, mainJson);
    }
  } catch (error) {
    console.error(`❌ Error saving data for ${key}:`, error);
    throw error;
  }
};

/**
 * Load data from secure storage with reassembly of split objects
 * @param {string} key - Storage key
 * @returns {Promise<any>} Parsed data or null if not found
 */
export const loadData = async (key) => {
  try {
    // Try to load sensitive data
    let sensitiveData = {};
    const sensitiveJson = await SecureStore.getItemAsync(`${key}_sensitive`);
    if (sensitiveJson) {
      sensitiveData = JSON.parse(sensitiveJson);
      if (__DEV__) {
        console.log(`🔓 Retrieved sensitive data for ${key}`);
      }
    }

    // Load main data
    let mainData = null;
    let mainJson = await SecureStore.getItemAsync(key);

    // If not in SecureStore, try AsyncStorage
    if (!mainJson) {
      mainJson = await AsyncStorage.getItem(key);
      if (mainJson && __DEV__) {
        console.log(`📤 Retrieved main data from AsyncStorage: ${key}`);
      }
    } else if (__DEV__) {
      console.log(`🔓 Retrieved main data from SecureStore: ${key}`);
    }

    if (mainJson) {
      mainData = JSON.parse(mainJson);
    }

    // If we have no data at all, return null
    if (!mainData && Object.keys(sensitiveData).length === 0) {
      return null;
    }

    // Reassemble the complete object
    return { ...mainData, ...sensitiveData };
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
    // Remove from both storage types and all chunks
    await SecureStore.deleteItemAsync(key);
    await SecureStore.deleteItemAsync(`${key}_sensitive`);
    await AsyncStorage.removeItem(key);

    if (__DEV__) {
      console.log(`🗑️ Removed all data for: ${key}`);
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
    const existingData = await loadData(key) || {};

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
