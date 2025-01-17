// src/Hooks/useNFTMetadata.jsx

import { useState, useEffect } from 'react';
import { fetchNFTMetadata } from '../Services/NFTMetadataService';

/**
 * Custom hook for fetching NFT metadata
 * @param {string} tokenMetadataURI - The IPFS URI of the metadata
 * @returns {Object} The hook state containing loading, error, metadata, and raw asset
 */
export const useNFTMetadata = (tokenMetadataURI) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    metadata: null,
    rawAsset: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenMetadataURI) {
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      try {
        const { metadata, rawAsset } = await fetchNFTMetadata(tokenMetadataURI);
        setState({
          loading: false,
          error: null,
          metadata,
          rawAsset,
        });
      } catch (error) {
        setState({
          loading: false,
          error: error.message,
          metadata: null,
          rawAsset: null,
        });
      }
    };

    fetchData();
  }, [tokenMetadataURI]);

  return state;
};
