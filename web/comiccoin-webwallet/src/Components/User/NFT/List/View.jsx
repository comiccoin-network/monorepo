// monorepo/web/comiccoin-webwallet/src/Components/User/NFTs/ListView.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
    Loader2,
    ImageIcon,
    ExternalLink,
    AlertCircle,
    ArrowUpRight,
    ImageOff,
    Clock,
    Search,
    Tag,
    Coins,
    CheckCircle,
} from 'lucide-react'
import { useWallet } from '../../../../Hooks/useWallet'
import { useNFTCollection } from '../../../../Hooks/useNFTCollection'
import { convertIPFSToGatewayURL } from '../../../../Services/NFTMetadataService'
import NavigationMenu from '../../NavigationMenu/View'
import FooterMenu from '../../FooterMenu/View'
import walletService from '../../../../Services/WalletService'
import { useTransactionNotifications } from '../../../../Contexts/TransactionNotificationsContext'

// Comic Book NFT Card
const NFTCard = ({ nft, currentWallet }) => {
    const lastTx = nft.transactions[0]
    const isReceived = lastTx.to.toLowerCase() === currentWallet.address.toLowerCase()
    const [imageError, setImageError] = useState(false)

    const getNFTImageUrl = (nft) => {
        if (!nft) return null

        if (nft.metadata?.image) {
            return convertIPFSToGatewayURL(nft.metadata.image)
        }

        if (nft.asset?.content) {
            try {
                const blob = new Blob([nft.asset.content], {
                    type: nft.asset.content_type || 'image/png',
                })
                return URL.createObjectURL(blob)
            } catch (error) {
                console.error('Error creating blob URL:', error)
                return null
            }
        }

        return null
    }

    const imageUrl = getNFTImageUrl(nft)

    return (
        <div className="group">
            <Link
                to={`/nft?token_id=${nft.tokenId}&token_metadata_uri=${lastTx.tokenMetadataURI}`}
                className="block bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg border border-purple-100 hover:border-purple-300 touch-manipulation"
            >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-purple-50 to-white">
                    {imageUrl && !imageError ? (
                        <img
                            src={imageUrl}
                            alt={nft.metadata?.name || `Comic NFT #${nft.tokenId}`}
                            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-16 md:w-24 h-16 md:h-24 text-purple-200" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        <div
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                isReceived
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                        >
                            {isReceived ? (
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4" />
                                    In Collection
                                </span>
                            ) : (
                                'Transferred'
                            )}
                        </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                            <div className="text-white">
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <Tag className="w-4 h-4 md:w-5 md:h-5" />
                                    <span className="text-sm md:text-base font-medium">#{nft.tokenId}</span>
                                </div>
                                <p className="text-sm md:text-base line-clamp-3 opacity-90">
                                    {nft.metadata?.description || 'A unique comic book NFT'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6">
                    <h3
                        className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-1"
                        style={{ fontFamily: 'Comic Sans MS' }}
                    >
                        {nft.metadata?.name || `Comic #${nft.tokenId}`}
                    </h3>

                    <div className="mt-2 md:mt-3 flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(lastTx.timestamp).toLocaleDateString()}</span>
                        {nft.metadata?.attributes?.grade && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-1.5">
                                    <Coins className="w-4 h-4 text-yellow-500" />
                                    Grade: {nft.metadata.attributes.grade}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
}

// Search Bar Component
const SearchBar = ({ onSearch }) => (
    <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
            type="text"
            placeholder="Search your comic collection..."
            className="w-full h-12 md:h-10 pl-10 pr-4 bg-white border rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
            onChange={(e) => onSearch(e.target.value)}
        />
    </div>
)

const NFTListPage = () => {
    const { currentWallet, logout, loading: serviceLoading, error: serviceError } = useWallet()

    const [forceURL, setForceURL] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [error, setError] = useState(null)
    const [isSessionExpired, setIsSessionExpired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const handleSignOut = () => {
        logout()
        setForceURL('/logout')
    }

    const getWalletAddress = () => {
        if (!currentWallet) return ''
        return currentWallet.address
    }

    const {
        nftCollection,
        loading: nftLoading,
        error: nftError,
        statistics,
        reload: txrefresh,
    } = useNFTCollection(getWalletAddress())

    // Filter NFTs based on search
    const filteredNFTs = (nftCollection || []).filter((nft) => {
        return (
            !searchTerm ||
            nft.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nft.tokenId.toString().includes(searchTerm)
        )
    })

    useEffect(() => {
        let mounted = true

        if (mounted) {
            window.scrollTo(0, 0)
        }

        const checkWalletSession = async () => {
            try {
                if (!mounted) return
                setIsLoading(true)

                if (serviceLoading) return

                if (!currentWallet) {
                    if (mounted) setForceURL('/logout')
                    return
                }

                if (!walletService.checkSession()) {
                    throw new Error('Session expired')
                }

                if (mounted) {
                    setError(null)
                    setForceURL('')
                    setWalletAddress(getWalletAddress())
                }
            } catch (error) {
                if (error.message === 'Session expired' && mounted) {
                    setIsSessionExpired(true)
                    logout()
                    setError('Your session has expired. Please sign in again.')
                    setTimeout(() => setForceURL('/logout'), 3000)
                } else if (mounted) {
                    setError(error.message)
                }
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        checkWalletSession()
        const sessionCheckInterval = setInterval(checkWalletSession, 60000)

        return () => {
            mounted = false
            clearInterval(sessionCheckInterval)
        }
    }, [currentWallet, serviceLoading, logout])

    // PART 1 of 3: Connect to ComicCoin Blockchain Authority and get SSE for latest updates. If our wallet has a new transcation (either we sent or received) then call the `txrefresh` function to fetch latest data for this page and this page will refresh with latest data.
    const { handleNewTransaction } = useTransactionNotifications()

    // PART 2 of 3: Use a stable callback reference with useCallback
    const handleTransactionUpdate = useCallback(
        (transactionData) => {
            console.log('Transaction update received:', transactionData)
            txrefresh() // Refresh the transactions list
        },
        [txrefresh]
    )

    // PART 3 of 3: Set up the transaction listener
    useEffect(() => {
        if (currentWallet) {
            handleNewTransaction(currentWallet, handleTransactionUpdate)
        }
    }, [currentWallet, handleNewTransaction, handleTransactionUpdate])

    if (forceURL !== '' && !serviceLoading) {
        return <Navigate to={forceURL} />
    }

    if (serviceLoading || isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex items-center justify-center flex-grow">
                    <div className="bg-white p-8 rounded-xl shadow-lg flex items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <div>
                            <h3 className="font-bold text-gray-900">Loading Your Collection</h3>
                            <p className="text-gray-500">Please wait while we fetch your NFTs...</p>
                        </div>
                    </div>
                </div>
                <FooterMenu />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <NavigationMenu onSignOut={handleSignOut} />

            <div className="flex-grow flex flex-col pt-6 pb-24 md:py-12">
                {/* Header */}
                <div className="px-4 md:px-6 lg:px-12 w-full max-w-[1200px] mx-auto">
                    <h1
                        className="text-2xl md:text-4xl font-bold text-purple-800 mb-2"
                        style={{ fontFamily: 'Comic Sans MS' }}
                    >
                        My NFT Collection
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Manage and showcase your digital comic book collectibles
                    </p>
                </div>

                {/* Search */}
                {(searchTerm || filteredNFTs.length !== 0) && (
                    <div className="mt-6 md:mt-8 px-4 md:px-6 lg:px-12 w-full max-w-[1200px] mx-auto">
                        <SearchBar onSearch={setSearchTerm} />
                    </div>
                )}

                {/* NFT Container */}
                <div className="mt-6 md:mt-8 px-4 md:px-6 lg:px-12 w-full max-w-[1200px] mx-auto">
                    <div className="bg-white rounded-xl border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-gray-100 gap-4 md:gap-0">
                            <div className="flex items-center gap-2 md:gap-3">
                                <ImageIcon className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg md:text-xl font-semibold">Your Comics</h2>
                                <span className="text-sm md:text-base text-gray-500">
                                    ({filteredNFTs.length} total)
                                </span>
                            </div>

                            <a
                                href="https://cpscapsule.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 h-12 md:h-10 px-4 md:px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-base touch-manipulation"
                            >
                                Grade New Comics
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                        {nftLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                <span className="ml-3 text-base text-gray-600">Loading your comics...</span>
                            </div>
                        ) : filteredNFTs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4 md:mb-6">
                                    <ImageOff className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                                </div>
                                <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 md:mb-3 text-center">
                                    No Comics Found
                                </h3>
                                <p className="text-base text-gray-500 mb-6 md:mb-8 text-center max-w-md">
                                    {searchTerm
                                        ? 'Try adjusting your search'
                                        : 'Start your collection by getting your comics professionally graded'}
                                </p>
                                <a
                                    href="https://cpscapsule.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 h-12 md:h-10 px-6 md:px-8 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-base touch-manipulation"
                                >
                                    Submit Comics for Grading
                                    <ArrowUpRight className="w-5 h-5" />
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                                {filteredNFTs.map((nft) => (
                                    <NFTCard key={nft.tokenId} nft={nft} currentWallet={currentWallet} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FooterMenu />
        </div>
    )
}

export default NFTListPage
