// monorepo/web/comiccoin-webwallet/src/Hooks/useNFTCollection.jsx
import { useState, useEffect, useMemo } from 'react'
import { useNFTTransactions } from './useNFTTransactions'
import { fetchNFTMetadata } from '../Services/NFTMetadataService'
import { useNFTCache } from './useNFTCache'

export const useNFTCollection = (walletAddress) => {
    const [nftCollection, setNftCollection] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    // Fetch metadata for owned NFTs
    useEffect(() => {
        const fetchMetadataForNFTs = async () => {
            // Only set loading true if we're actually going to fetch something
            if (txLoading) return

            // If transactions are loaded but there are no owned NFTs, we're done
            if (!txLoading && ownedNFTs.size === 0) {
                setLoading(false)
                setNftCollection([])
                return
            }

            setLoading(true)
            const nftsWithMetadata = []

            try {
                await Promise.all(
                    Array.from(ownedNFTs.values()).map(async (nft) => {
                        try {
                            const cachedData = getFromCache(nft.tokenId)

                            if (cachedData?.timestamp && Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
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
        }

        fetchMetadataForNFTs()
    }, [ownedNFTs, txLoading])

    return {
        nftCollection,
        loading: loading || txLoading,
        error: error || txError,
        statistics,
    }
}
