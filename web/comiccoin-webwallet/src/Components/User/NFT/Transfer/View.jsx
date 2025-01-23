// monorepo/web/comiccoin-webwallet/src/Components/User/NFT/Transfer/View.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Send, Loader2, Info, Key, LinkIcon, Wallet, Coins } from 'lucide-react'
import { useWallet } from '../../../../Hooks/useWallet'
import { useWalletTransactions } from '../../../../Hooks/useWalletTransactions'
import { useNFTTransfer } from '../../../../Hooks/useNFTTransfer'
import NavigationMenu from '../../NavigationMenu/View'
import FooterMenu from '../../FooterMenu/View'
import walletService from '../../../../Services/WalletService'

const TransferNFTPage = () => {
    const navigate = useNavigate()
    const { currentWallet, logout, loading: serviceLoading, error: serviceError } = useWallet()
    const { statistics } = useWalletTransactions(currentWallet?.address)
    const { submitTransaction, loading: transactionLoading, error: transactionError } = useNFTTransfer(1)
    const [searchParams] = useSearchParams()
    const tokenId = searchParams.get('token_id')
    const tokenMetadataUri = searchParams.get('token_metadata_uri')

    // States
    const [forceURL, setForceURL] = useState('')
    const [generalError, setGeneralError] = useState(null)
    const [isSessionExpired, setIsSessionExpired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        recipientAddress: '',
        password: '',
        tokenID: tokenId,
        tokenMetadataURI: tokenMetadataUri,
    })
    const [formErrors, setFormErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)

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
                    if (mounted) {
                        setForceURL('/login')
                    }
                    return
                }

                if (!walletService.checkSession()) {
                    throw new Error('Session expired')
                }

                if (mounted) {
                    setForceURL('')
                }
            } catch (error) {
                console.error('Session check error:', error)
                if (error.message === 'Session expired' && mounted) {
                    handleSessionExpired()
                } else if (mounted) {
                    setGeneralError(error.message)
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        checkWalletSession()
        const sessionCheckInterval = setInterval(checkWalletSession, 60000)

        return () => {
            mounted = false
            clearInterval(sessionCheckInterval)
        }
    }, [currentWallet, serviceLoading])

    const handleSessionExpired = () => {
        setIsSessionExpired(true)
        logout()
        setGeneralError('Your session has expired. Please sign in again.')
        setTimeout(() => {
            setForceURL('/login')
        }, 3000)
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.recipientAddress) {
            newErrors.recipientAddress = 'Recipient address is required'
        } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipientAddress)) {
            newErrors.recipientAddress = 'Invalid wallet address format'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required to authorize transaction'
        }
        if (!formData.tokenID) {
            newErrors.tokenID = 'Token ID is required'
        }
        if (!formData.tokenMetadataURI) {
            newErrors.tokenMetadataURI = 'Token metadata URI is required'
        }

        // Check if we have enough balance for network fee
        if ((statistics?.totalCoinValue || 0) < 1) {
            newErrors.balance = 'Insufficient balance for network fee'
        }

        setFormErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        setShowConfirmation(true)
    }

    const handleConfirmTransaction = async () => {
        setIsSubmitting(true)
        try {
            await submitTransaction(
                formData.recipientAddress,
                '1',
                '',
                currentWallet,
                formData.password,
                formData.tokenID,
                formData.tokenMetadataURI
            )
            navigate('/nfts', {
                state: {
                    transactionSuccess: true,
                    message: 'NFT transferred successfully!',
                },
            })
        } catch (error) {
            console.error('Transaction failed:', error)
            setFormErrors((prev) => ({ ...prev, submit: error.message }))
            setShowConfirmation(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSignOut = () => {
        logout()
        setForceURL('/login')
    }

    if (forceURL !== '' && !serviceLoading) {
        return <Navigate to={forceURL} />
    }

    if (serviceLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading wallet...</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <NavigationMenu onSignOut={handleSignOut} />

            <main className="flex-grow w-full max-w-3xl mx-auto px-3 py-6 md:px-4 md:py-12 mb-16 md:mb-0">
                <Link
                    to={`/nft?token_id=${tokenId}&token_metadata_uri=${tokenMetadataUri}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 md:mb-6 text-sm md:text-base"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                    Back to NFT Details
                </Link>

                {/* Error Messages */}
                {generalError && (
                    <div className="mb-4 md:mb-6 bg-red-50 border-l-4 border-red-500 p-3 md:p-4 rounded-r-lg flex items-start gap-2 md:gap-3">
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm md:text-base">{generalError}</p>
                    </div>
                )}

                {isSessionExpired && (
                    <div className="mb-4 md:mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-3 md:p-4 rounded-r-lg flex items-start gap-2 md:gap-3">
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-800 text-sm md:text-base">Session expired. Redirecting to login...</p>
                    </div>
                )}

                {/* Form Errors */}
                {Object.keys(formErrors).length > 0 && (
                    <div className="mb-4 md:mb-6 bg-red-50 border-l-4 border-red-500 p-3 md:p-4 rounded-r-lg">
                        <div className="flex items-start gap-2 md:gap-3">
                            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-800 text-sm md:text-base">Transaction Error</h3>
                                <div className="text-xs md:text-sm text-red-600 mt-1">
                                    {Object.values(formErrors).map((error, index) => (
                                        <p key={index} className="flex items-center gap-2">
                                            <span>•</span> {error}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    {/* Balance Section */}
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Available Balance</h2>
                                    <p className="text-xl md:text-2xl font-bold text-purple-600">
                                        {statistics?.totalCoinValue || 0} CC
                                    </p>
                                </div>
                                <div className="mt-2 pt-2 border-t space-y-1">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-red-600">Network Fee</span>
                                        <span className="text-red-600">- 1 CC</span>
                                    </div>
                                    <div className="flex justify-between text-xs md:text-sm font-medium">
                                        <span className="text-gray-600">Remaining Balance</span>
                                        <span className="text-gray-900">
                                            = {(statistics?.totalCoinValue || 0) - 1} CC
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Token Information */}
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <LinkIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-xs md:text-sm font-medium text-gray-600">NFT Information</span>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-500">Token ID</label>
                                    <div className="text-xs md:text-sm font-mono text-gray-900 break-all">
                                        {tokenId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notices */}
                    <div className="p-4 md:p-6 border-b border-gray-100 space-y-4">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 md:p-4 flex gap-2 md:gap-3">
                            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs md:text-sm text-amber-800">
                                <p className="font-semibold mb-1">Important Notice</p>
                                <p>
                                    All transactions are final and cannot be undone. Please verify all details before
                                    transferring.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 md:p-4 flex gap-2 md:gap-3">
                            <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs md:text-sm text-blue-800">
                                <p className="font-semibold mb-1">Transaction Fee Information</p>
                                <p>
                                    A network fee of 1 CC will be deducted from your wallet to ensure timely processing.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6" autoComplete="off">
                        <div>
                            <label htmlFor="recipientAddress" className="block">
                                <span className="text-xs md:text-sm font-medium text-gray-700">
                                    Transfer To <span className="text-red-500">*</span>
                                </span>
                                <div className="mt-1 relative">
                                    <input
                                        type="text"
                                        id="recipientAddress"
                                        name="recipientAddress"
                                        value={formData.recipientAddress}
                                        onChange={handleInputChange}
                                        className={`mt-2 block w-full px-3 md:px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-base font-mono ${
                                            formErrors.recipientAddress ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter recipient's wallet address"
                                        inputMode="text"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        enterKeyHint="next"
                                        // Add these attributes
                                        data-lpignore="true"
                                        autoComplete="off"
                                    />
                                    {formErrors.recipientAddress && (
                                        <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1 md:gap-2">
                                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                                            {formErrors.recipientAddress}
                                        </p>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div>
                            <label htmlFor="password" className="block">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs md:text-sm font-medium text-gray-700">
                                        Wallet Password <span className="text-red-500">*</span>
                                    </span>
                                </div>
                                <div className="mt-1 relative">
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 md:px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-base ${
                                            formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                        placeholder="Enter your wallet password"
                                        enterKeyHint="done"
                                        // Add these attributes
                                        data-lpignore="true"
                                        autoComplete="off"
                                    />
                                    {formErrors.password && (
                                        <p className="mt-1 text-xs md:text-sm text-red-600 flex items-center gap-1 md:gap-2">
                                            <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                                            {formErrors.password}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs md:text-sm text-gray-600 flex items-start gap-1 md:gap-2">
                                        <Info className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Your wallet is encrypted and stored locally. The password is required to
                                            authorize this transaction.
                                        </span>
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/nft?token_id=${tokenId}&token_metadata_uri=${tokenMetadataUri}`)
                                }
                                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                            >
                                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || (statistics?.totalCoinValue || 0) < 1}
                                className="flex-1 bg-purple-600 text-white py-2 px-3 md:px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3 h-3 md:w-4 md:h-4" />
                                        Transfer NFT
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <FooterMenu />

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-3 p-4 md:p-6">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Confirm NFT Transfer</h3>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-3 md:p-4 rounded-lg space-y-3 md:space-y-4">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">Network Fee</p>
                                    <p className="text-base md:text-lg font-medium text-red-600">- 1 CC</p>
                                </div>

                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">Remaining Balance</p>
                                    <p className="text-base md:text-lg font-medium text-gray-900">
                                        {(statistics?.totalCoinValue || 0) - 1} CC
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">Transfer To</p>
                                    <p className="text-base md:text-lg font-medium text-gray-900 break-all">
                                        {formData.recipientAddress}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">Token ID</p>
                                    <p className="text-base md:text-lg font-medium text-gray-900 break-all">
                                        {formData.tokenID}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 md:p-4">
                                <p className="text-xs md:text-sm text-amber-800">
                                    Please verify all details before confirming. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 md:gap-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmTransaction}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    'Confirm Transfer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransferNFTPage
