// src/Hooks/useNFTCache.jsx
import { useState, useEffect } from 'react';

export const useNFTCache = () => {
  const CACHE_KEY_PREFIX = 'nft_cache_';

  const getCacheKey = (tokenId) => `${CACHE_KEY_PREFIX}${tokenId}`;

  const saveToCache = (tokenId, data) => {
    try {
      const key = getCacheKey(tokenId);
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
      console.log('Saved to cache:', { tokenId, data });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const getFromCache = (tokenId) => {
    try {
      const key = getCacheKey(tokenId);
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('Retrieved from cache:', { tokenId, data: parsed.data });
        return parsed.data;
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
    return null;
  };

  return {
    saveToCache,
    getFromCache
  };
};
