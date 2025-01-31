// monorepo/web/comiccoin-webwallet/src/Hooks/useNFTCollection.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNFTTransactions } from './useNFTTransactions'
import { fetchNFTMetadata } from '../Services/NFTMetadataService'
import { useNFTCache } from './useNFTCache'

export const useNFTCollection = (walletAddress) => {
    const [nftCollection, setNftCollection] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [reloadTrigger, setReloadTrigger] = useState(0)

    const { saveToCache, getFromCache } = useNFTCache()

    const { transactions, loading: txLoading, error: txError, statistics } = useNFTTransactions(walletAddress)

    // Get owned NFTs from transactions
    const ownedNFTs = useMemo(() => {
        if (!transactions || !walletAddress) return new Map()

        const nftMap = new Map()
        for (const tx of transactions) {
            const normalizedWallet = walletAddress.toLowerCase()
            const isOutgoing = tx.from.toLowerCase() === normalizedWallet
            const isIncoming = tx.to.toLowerCase() === normalizedWallet

            if (isOutgoing) {
                nftMap.delete(tx.tokenId)
            } else if (isIncoming && !nftMap.has(tx.tokenId)) {
                nftMap.set(tx.tokenId, {
                    tokenId: tx.tokenId,
                    tokenMetadataURI: tx.tokenMetadataURI,
                    transactions: [tx],
                })
            }
        }
        return nftMap
    }, [transactions, walletAddress])

    const fetchMetadataForNFTs = useCallback(
        async (skipCache = false) => {
            // Don't fetch if we're still loading transactions
            if (txLoading) {
                console.log('Skipping metadata fetch - transactions still loading')
                return
            }

            // If transactions are loaded but there are no owned NFTs, we're done
            if (!txLoading && ownedNFTs.size === 0) {
                console.log('No owned NFTs found')
                setNftCollection([])
                setLoading(false)
                return
            }

            console.log('Starting metadata fetch', {
                skipCache,
                nftCount: ownedNFTs.size,
            })

            const nftsWithMetadata = []

            try {
                await Promise.all(
                    Array.from(ownedNFTs.values()).map(async (nft) => {
                        try {
                            const cachedData = getFromCache(nft.tokenId)

                            if (
                                !skipCache &&
                                cachedData?.timestamp &&
                                Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000
                            ) {
                                nftsWithMetadata.push({
                                    ...nft,
                                    metadata: cachedData.metadata,
                                    rawAsset: cachedData.rawAsset,
                                    source: 'cache',
                                })
                                return
                            }

                            const { metadata, rawAsset } = await fetchNFTMetadata(nft.tokenMetadataURI)

                            saveToCache(nft.tokenId, {
                                timestamp: Date.now(),
                                metadata,
                                rawAsset,
                            })

                            nftsWithMetadata.push({
                                ...nft,
                                metadata,
                                rawAsset,
                                source: 'network',
                            })
                        } catch (err) {
                            console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, err)
                            nftsWithMetadata.push({
                                ...nft,
                                metadata: null,
                                rawAsset: null,
                                error: err.message,
                            })
                        }
                    })
                )

                setNftCollection(nftsWithMetadata)
                setError(null)
            } catch (err) {
                console.error('Error fetching NFT collection:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        },
        [ownedNFTs, txLoading, getFromCache, saveToCache]
    )

    // Only fetch metadata when transactions change or reload is triggered
    useEffect(() => {
        // Set loading state before starting fetch
        if (!txLoading && ownedNFTs.size > 0) {
            setLoading(true)
        }

        console.log('Effect triggered:', {
            hasTransactions: !!transactions,
            reloadTrigger,
            nftCount: ownedNFTs.size,
        })

        fetchMetadataForNFTs(false)
    }, [transactions, reloadTrigger]) // Only depend on transactions and reloadTrigger

    const reload = useCallback(
        async (options = { skipCache: false }) => {
            try {
                console.log('Manual reload triggered', {
                    skipCache: options.skipCache,
                    nftCount: ownedNFTs.size,
                })

                if (options.skipCache) {
                    setLoading(true)
                    await fetchMetadataForNFTs(true)
                } else {
                    setReloadTrigger((prev) => prev + 1)
                }

                console.log('Reload completed successfully')
            } catch (err) {
                console.error('Error during reload:', err)
                throw err
            }
        },
        [fetchMetadataForNFTs]
    )

    return {
        nftCollection,
        loading: loading || txLoading,
        error: error || txError,
        statistics,
        reload,
    }
}
