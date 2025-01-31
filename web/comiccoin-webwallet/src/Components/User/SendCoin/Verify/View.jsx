// monorepo/web/comiccoin-webwallet/src/Components/User/SendCoin/Verify/View.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    Info,
    Wallet,
    CheckCircle,
    ArrowLeft,
    ExternalLink,
    AlertCircle,
    AlertTriangle,
    RefreshCcw,
} from 'lucide-react'
import { useTransactionNotifications } from '../../../../Contexts/TransactionNotificationsContext'
import { useWallet } from '../../../../Hooks/useWallet'

const SendCoinsVerifyTransactionPage = () => {
    const { currentWallet } = useWallet()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState(0) // 0: processing, 1: success, 2: error
    const [errorDetails, setErrorDetails] = useState({
        code: 'TRANSACTION_FAILED',
        message: 'The transaction could not be processed due to insufficient funds.',
        suggestion: 'Please check your balance and try again.',
    })

    // Get amount from URL parameter and log initial setup
    const expectedAmount = parseInt(searchParams.get('amount') || '0')

    useEffect(() => {
        console.log('Component initialized:', {
            expectedAmount,
            walletAddress: currentWallet?.address,
            searchParams: Object.fromEntries(searchParams),
        })
    }, [])

    // Set up timeout for transaction
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (status === 0) {
                console.log('Transaction timeout reached, showing error state')
                setStatus(2)
                setErrorDetails({
                    code: 'TRANSACTION_TIMEOUT',
                    message: 'The transaction has timed out after waiting for 1 minute.',
                    suggestion: 'Please try sending your transaction again.',
                })
            }
        }, 60000) // 1 minute timeout

        return () => clearTimeout(timeoutId)
    }, [status])

    // Handle transaction updates
    const handleTransactionUpdate = useCallback(
        (transactionData) => {
            console.log('Transaction update received:', transactionData)

            if (
                transactionData.direction === 'FROM' &&
                transactionData.type === 'coin' &&
                parseInt(transactionData.value) === expectedAmount
            ) {
                console.log('Transaction matched! Setting success state')
                setStatus(1)
            }
        },
        [expectedAmount]
    )

    // Set up transaction listener
    const { handleNewTransaction } = useTransactionNotifications()

    useEffect(() => {
        if (currentWallet) {
            const cleanup = handleNewTransaction(currentWallet, handleTransactionUpdate)
            return () => {
                console.log('Cleaning up transaction listener')
                cleanup() // This line is causing the error because cleanup is undefined
            }
        }
    }, [currentWallet, handleNewTransaction, handleTransactionUpdate])

    const ProcessingView = () => (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    {/* Icon and Loading Container */}
                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center animate-spin">
                                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                    <circle cx="32" cy="32" r="30" stroke="#E9D5FF" strokeWidth="4" />
                                    <path
                                        d="M32 2A30 30 0 0 1 62 32"
                                        stroke="#A855F7"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                className="text-purple-600"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Processing Transaction</h2>

                    <p className="text-gray-600 mb-8">
                        Your transaction is being processed on the blockchain network. This usually takes a few moments.
                        Please don't close this window.
                    </p>

                    {/* Transaction Details */}
                    <div className="w-full space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status</span>
                            <div className="flex items-center gap-2 text-purple-600">
                                <span>Processing</span>
                                <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Network</span>
                            <span className="text-gray-900">ComicCoin Network</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Estimated Time</span>
                            <span className="text-gray-900">~30 seconds</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="w-full flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                        <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        <p className="text-sm text-left text-blue-900">
                            Once your transaction is confirmed, you'll receive a notification and be redirected to the
                            transaction details page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    const SuccessView = () => (
        <div className="flex-grow flex flex-col">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-md mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/send-coins')}
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="text-base font-medium">Back to Send</span>
                    </button>
                </div>
            </div>

            {/* Success Content */}
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                        {/* Success Icon */}
                        <div className="mb-6">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Transaction Successful!</h2>

                        <p className="text-gray-600 mb-8">
                            Your payment has been successfully processed and confirmed on the blockchain network.
                        </p>

                        {/* Transaction Details */}
                        <div className="w-full space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Status</span>
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Confirmed</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Transaction Hash</span>
                                <a
                                    href="/transactions"
                                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                >
                                    <span>View</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full space-y-3">
                            <button
                                onClick={() => navigate('/transactions')}
                                className="w-full bg-purple-600 text-white rounded-xl py-3 px-4 font-medium hover:bg-purple-700 transition-colors"
                            >
                                View Transaction Details
                            </button>
                            <button
                                onClick={() => navigate('/send-coins')}
                                className="w-full bg-white text-purple-600 border border-purple-200 rounded-xl py-3 px-4 font-medium hover:bg-purple-50 transition-colors"
                            >
                                Send Another Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const ErrorView = () => (
        <div className="flex-grow flex flex-col">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-md mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/send-coins')}
                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="text-base font-medium">Back to Send</span>
                    </button>
                </div>
            </div>

            {/* Error Content */}
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 max-w-md w-full">
                    <div className="flex flex-col items-center text-center">
                        {/* Error Icon */}
                        <div className="mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Transaction Failed</h2>

                        <p className="text-gray-600 mb-8">
                            We encountered an issue while processing your transaction. Don't worry, no funds have been
                            deducted from your wallet.
                        </p>

                        {/* Error Details */}
                        <div className="w-full bg-red-50 rounded-xl p-4 mb-6">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-red-800 font-medium mb-1">{errorDetails.message}</p>
                                    <p className="text-red-700 text-sm">{errorDetails.suggestion}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full space-y-3">
                            <button
                                onClick={() => navigate('/send-coins')}
                                className="w-full bg-purple-600 text-white rounded-xl py-3 px-4 font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/help')}
                                className="w-full bg-white text-purple-600 border border-purple-200 rounded-xl py-3 px-4 font-medium hover:bg-purple-50 transition-colors"
                            >
                                Get Help
                            </button>
                        </div>

                        {/* Technical Details (Collapsible) */}
                        <div className="w-full mt-6 pt-6 border-t border-gray-100">
                            <div className="text-left">
                                <p className="text-sm text-gray-500 mb-2">Error Code</p>
                                <code className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    {errorDetails.code}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col bg-purple-50">
            {/* Main Content - Conditionally render based on status */}
            {status === 0 ? <ProcessingView /> : status === 1 ? <SuccessView /> : <ErrorView />}

            {/* Footer */}
            <div className="p-4 text-gray-600">
                <div className="max-w-md mx-auto flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        <span>ComicCoin Wallet</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M8 1.33334L10 7.33334H15L11 11.3333L12.6667 15.3333L8 12.6667L3.33333 15.3333L5 11.3333L1 7.33334H6L8 1.33334Z" />
                        </svg>
                        <span>Secure Transaction</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SendCoinsVerifyTransactionPage
