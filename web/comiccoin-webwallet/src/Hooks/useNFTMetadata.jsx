// src/Hooks/useNFTMetadata.jsx
import { useState, useEffect } from 'react';
import { fetchNFTMetadata } from '../Services/NFTMetadataService';
import { useNFTCache } from './useNFTCache';

/**
 * Custom hook for fetching NFT metadata with caching support
 * @param {string} tokenMetadataURI - The IPFS URI of the metadata
 * @param {Object} options - Configuration options
 * @param {number} options.cacheDuration - Duration in milliseconds before cache expires (default: 1 hour)
 * @returns {Object} The hook state containing loading, error, metadata, and raw asset
 */
export const useNFTMetadata = (tokenMetadataURI, options = {}) => {
  const { cacheDuration = 60 * 60 * 1000 } = options; // Default: 1 hour
  const { saveToCache, getFromCache } = useNFTCache();

  const [state, setState] = useState({
    loading: false,
    error: null,
    metadata: null,
    rawAsset: null,
    source: null, // 'cache' or 'network'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenMetadataURI) {
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      try {
        // Check cache first
        const cachedData = getFromCache(tokenMetadataURI);

        if (cachedData) {
          const { timestamp, metadata, rawAsset } = cachedData;

          // Check if cache is still valid
          if (Date.now() - timestamp < cacheDuration) {
            setState({
              loading: false,
              error: null,
              metadata,
              rawAsset,
              source: 'cache'
            });
            return;
          }
        }

        // Fetch from network if no cache or cache expired
        const { metadata, rawAsset } = await fetchNFTMetadata(tokenMetadataURI);

        // Save to cache
        saveToCache(tokenMetadataURI, {
          timestamp: Date.now(),
          metadata,
          rawAsset
        });

        setState({
          loading: false,
          error: null,
          metadata,
          rawAsset,
          source: 'network'
        });
      } catch (error) {
        setState({
          loading: false,
          error: error.message,
          metadata: null,
          rawAsset: null,
          source: null
        });
      }
    };

    fetchData();
  }, [tokenMetadataURI, cacheDuration]);

  return state;
};
