// src/Hooks/useNFTAsset.js
import { useState, useEffect } from 'react';
import nftAssetService from '../Services/NFTAssetService';

/**
 * Hook for fetching NFT assets from IPFS
 * @param {string} cid - The IPFS CID to fetch
 * @returns {Object} - The state object containing loading, error, and asset data
 */
export const useNFTAsset = (cid) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    asset: null,
  });

  useEffect(() => {
    const fetchAsset = async () => {
      if (!cid) {
        setState(prev => ({ ...prev, error: 'CID is required' }));
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      try {
        const asset = await nftAssetService.getNFTAsset(cid);
        setState({
          loading: false,
          error: null,
          asset,
        });
      } catch (error) {
        setState({
          loading: false,
          error: error.message,
          asset: null,
        });
      }
    };

    fetchAsset();
  }, [cid]);

  return state;
};
