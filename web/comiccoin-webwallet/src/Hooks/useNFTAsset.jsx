// monorepo/web/comiccoin-webwallet/src/Hooks/useNFTAsset.js
import { useState, useEffect } from 'react'
import nftAssetService from '../Services/NFTAssetService'
import { useNFTCache } from './useNFTCache'

/**
 * Hook for fetching NFT assets from IPFS with caching support
 * @param {string} cid - The IPFS CID to fetch
 * @param {Object} options - Configuration options
 * @param {number} options.cacheDuration - Duration in milliseconds before cache expires (default: 24 hours)
 * @returns {Object} - The state object containing loading, error, asset data, and source
 */
export const useNFTAsset = (cid, options = {}) => {
    const { cacheDuration = 24 * 60 * 60 * 1000 } = options // Default: 24 hours
    const { saveToCache, getFromCache } = useNFTCache()

    const [state, setState] = useState({
        loading: false,
        error: null,
        asset: null,
        source: null, // 'cache' or 'network'
    })

    useEffect(() => {
        const fetchAsset = async () => {
            if (!cid) {
                setState((prev) => ({ ...prev, error: 'CID is required' }))
                return
            }

            setState((prev) => ({ ...prev, loading: true }))

            try {
                // Check cache first
                const cachedData = getFromCache(cid)

                if (cachedData) {
                    const { timestamp, asset } = cachedData

                    // Check if cache is still valid
                    if (Date.now() - timestamp < cacheDuration) {
                        setState({
                            loading: false,
                            error: null,
                            asset,
                            source: 'cache',
                        })
                        return
                    }
                }

                // Fetch from network if no cache or cache expired
                const asset = await nftAssetService.getNFTAsset(cid)

                // Save to cache
                saveToCache(cid, {
                    timestamp: Date.now(),
                    asset,
                })

                setState({
                    loading: false,
                    error: null,
                    asset,
                    source: 'network',
                })
            } catch (error) {
                setState({
                    loading: false,
                    error: error.message,
                    asset: null,
                    source: null,
                })
            }
        }

        fetchAsset()
    }, [cid, cacheDuration])

    return state
}
