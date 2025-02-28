import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Coins, Gift, Clock, AlertCircle, ArrowLeft, Star, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'

import { withAuth } from '../hocs/withAuth'
import withWallet from '../hocs/withWallet'
import { useMe } from '../hooks/useMe'
import { useClaimCoins } from '../hooks/useClaimCoins'
import { useGetFaucet } from '../hooks/useGetFaucet'

// Animated loading spinner component
const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" aria-hidden="true" />
)

// Enhanced card component with customizable visual styles
interface CardProps {
    children: React.ReactNode
    className?: string
    withGlow?: boolean
    withBorder?: boolean
    withShadow?: 'sm' | 'md' | 'lg' | ''
    gradient?: boolean
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    withGlow = false,
    withBorder = false,
    withShadow = 'sm',
    gradient = false,
}) => (
    <div
        className={`
      bg-white rounded-xl
      ${withBorder ? 'border border-purple-100' : ''}
      ${withShadow === 'sm' ? 'shadow-sm' : withShadow === 'md' ? 'shadow-md' : withShadow === 'lg' ? 'shadow-lg' : ''}
      ${withGlow ? 'ring-2 ring-purple-100 ring-opacity-50' : ''}
      ${gradient ? 'bg-gradient-to-br from-white to-purple-50' : ''}
      ${className}
    `}
        style={withGlow ? { boxShadow: '0 0 15px rgba(147, 51, 234, 0.1)' } : {}}
    >
        {children}
    </div>
)

// Confetti animation component for successful claims
interface ClaimConfettiProps {
    visible: boolean
}

const ClaimConfetti: React.FC<ClaimConfettiProps> = ({ visible }) => {
    if (!visible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
            {[...Array(30)].map((_, i) => {
                const size = Math.random() * 10 + 5
                const left = Math.random() * 100
                const animationDuration = Math.random() * 3 + 2
                const animationDelay = Math.random() * 0.5
                const color = ['bg-purple-500', 'bg-indigo-400', 'bg-pink-400', 'bg-yellow-300', 'bg-blue-400'][
                    Math.floor(Math.random() * 5)
                ]

                return (
                    <div
                        key={i}
                        className={`absolute ${color} rounded-full`}
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${left}%`,
                            top: '-10px',
                            animation: `confetti ${animationDuration}s ease-in ${animationDelay}s forwards`,
                        }}
                    />
                )
            })}
            <style>{`
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(calc(100vh + 10px)) rotate(720deg); opacity: 0; }
        }
      `}</style>
        </div>
    )
}

// Define interface for component props
interface ClaimCoinsPageProps {}

const ClaimCoinsPage: React.FC<ClaimCoinsPageProps> = () => {
    const navigate = useNavigate()
    const { refetch, user } = useMe()
    const { claimCoins, isLoading: isClaimingCoins } = useClaimCoins()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isButtonPressed, setIsButtonPressed] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [claimSuccess, setClaimSuccess] = useState(false)
    const mainContainerRef = useRef<HTMLDivElement>(null)

    // Track if redirection is scheduled
    const redirectionScheduledRef = useRef<boolean>(false)

    // Get faucet data
    const { faucet, isLoading: isFaucetLoading } = useGetFaucet({
        chainId: 1,
        refreshInterval: 60000, // Refresh every minute
    })

    // Get the daily reward amount from faucet data
    const dailyReward = faucet?.daily_coins_reward || 2 // Fallback to 2 if not available yet

    // Optimize for iOS and touch devices
    useEffect(() => {
        // Add viewport meta tag for iOS
        let viewportMeta = document.querySelector('meta[name="viewport"]')
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta')
            viewportMeta.setAttribute('name', 'viewport')
            document.head.appendChild(viewportMeta)
        }

        viewportMeta.setAttribute(
            'content',
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        )

        // Apply momentum scrolling for iOS
        if (mainContainerRef.current) {
            // Use indexing to avoid TypeScript errors with vendor prefixes
            ;(mainContainerRef.current.style as any)['WebkitOverflowScrolling'] = 'touch'
        }

        // Fix for white borders and ensure full viewport coverage
        document.body.style.margin = '0'
        document.body.style.padding = '0'
        document.body.style.backgroundColor = '#8b5cf6' // Purple fallback color that matches the header
        document.documentElement.style.margin = '0'
        document.documentElement.style.padding = '0'
        document.documentElement.style.height = '100%'
        document.documentElement.style.backgroundColor = '#8b5cf6'

        // Detect header height and adjust content accordingly
        const adjustForHeader = () => {
            const header = document.querySelector('header, nav, .navbar')
            if (header && mainContainerRef.current) {
                const headerHeight = header.getBoundingClientRect().height
                mainContainerRef.current.style.paddingTop = `calc(${headerHeight}px + 1rem)`
            }
        }

        // Run once and also add resize listener to adjust if header size changes
        adjustForHeader()
        window.addEventListener('resize', adjustForHeader)

        // Prevent elastic scrolling on iOS
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.style.overflowY = 'auto'

        // Add custom animation styling to document
        const style = document.createElement('style')
        style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
        100% { transform: translateY(0px); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `
        document.head.appendChild(style)

        // Cleanup function
        return () => {
            document.body.style.position = ''
            document.body.style.width = ''
            document.body.style.height = ''
            document.body.style.overflowY = ''
            document.body.style.margin = ''
            document.body.style.padding = ''
            document.body.style.backgroundColor = ''
            document.documentElement.style.margin = ''
            document.documentElement.style.padding = ''
            document.documentElement.style.height = ''
            document.documentElement.style.backgroundColor = ''
            window.removeEventListener('resize', adjustForHeader)
            if (document.head.contains(style)) {
                document.head.removeChild(style)
            }
        }
    }, [])

    // Effect to handle redirection after successful claim
    useEffect(() => {
        if (claimSuccess && !redirectionScheduledRef.current) {
            redirectionScheduledRef.current = true

            // Redirect to dashboard after a delay to show the success animation
            const redirectTimer = setTimeout(() => {
                navigate('/user/dashboard')
            }, 2500) // Wait 2.5 seconds to show confetti animation

            // Cleanup timer if component unmounts
            return () => {
                clearTimeout(redirectTimer)
            }
        }
    }, [claimSuccess, navigate])

    // Function to handle coin claiming
    const handleClaimCoins = async () => {
        // Clear any previous error
        setErrorMessage(null)

        try {
            // Step 1: Claim coins
            await claimCoins()

            // Step 2: Refresh user profile data - add safety check
            if (typeof refetch === 'function') {
                try {
                    await refetch()
                } catch (refetchError) {
                    console.warn('Failed to refresh user data, but coins were claimed successfully:', refetchError)
                    // Continue with the success flow even if refetch fails
                }
            } else {
                console.warn('Refetch is not available, but coins were claimed successfully')
            }

            // Show confetti animation
            setShowConfetti(true)
            setClaimSuccess(true)

            // Step 3: Show success toast
            toast.success(`You've claimed ${dailyReward} ComicCoins!`, {
                autoClose: 3000,
                position: 'bottom-center',
                style: {
                    background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                    color: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundImage: 'rgba(255, 255, 255, 0.4)',
                },
            })

            // Announce success for screen readers
            const successAnnouncement = document.createElement('div')
            successAnnouncement.setAttribute('aria-live', 'assertive')
            successAnnouncement.setAttribute('role', 'status')
            successAnnouncement.className = 'sr-only'
            successAnnouncement.textContent = `Success! You've claimed ${dailyReward} ComicCoins!`
            document.body.appendChild(successAnnouncement)

            // Remove announcement after it's been read
            setTimeout(() => {
                document.body.removeChild(successAnnouncement)
            }, 4000)

            // Note: The redirection is handled by the useEffect above
        } catch (err: unknown) {
            console.error('Error during claim process:', err)

            // Extract detailed error message from backend response
            let message = 'Unable to claim coins'

            if (err instanceof Error) {
                message = err.message

                // For axios errors
                if ('response' in err && err.response && typeof err.response === 'object') {
                    const errorResponse = err.response as any
                    if (errorResponse.data) {
                        if (errorResponse.data.detail) {
                            message = errorResponse.data.detail
                        } else if (errorResponse.data.message) {
                            message = errorResponse.data.message
                        }
                    }
                }
            }

            // Set the error message to display on the page
            setErrorMessage(message)

            // Also show the error as a toast
            toast.error('Claim Failed: ' + message, {
                autoClose: 5000,
                position: 'bottom-center',
                style: {
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '4px',
                },
            })
        }
    }

    // Handle button press visual feedback
    const handleButtonPress = () => setIsButtonPressed(true)
    const handleButtonRelease = () => setIsButtonPressed(false)

    return (
        <div
            ref={mainContainerRef}
            className="min-h-screen bg-gradient-to-b from-purple-100 via-indigo-50 to-white py-6 px-4 sm:px-6 md:py-8 overflow-auto"
            style={{
                WebkitTapHighlightColor: 'transparent',
                paddingBottom: 'env(safe-area-inset-bottom, 20px)',
                paddingTop: 'calc(env(safe-area-inset-top, 20px) + 60px)', // Add extra padding for the header
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                margin: 0,
            }}
        >
            {/* Confetti animation for successful claims */}
            <ClaimConfetti visible={showConfetti} />

            {/* Main Content Container */}
            <div className="max-w-md mx-auto space-y-6">
                {/* Back button for better navigation */}
                <button
                    onClick={() => navigate('/user/dashboard')}
                    className="flex items-center text-purple-600 font-medium text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md p-2 hover:bg-white hover:bg-opacity-50 transition-colors"
                    aria-label="Go back to dashboard"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    Back to Dashboard
                </button>

                {/* Header with animation */}
                <div className="text-center mb-8 pt-6 sm:pt-8">
                    <div className="inline-block mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-400 rounded-full opacity-20 blur-xl transform scale-110"></div>
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-3 rounded-full shadow-lg">
                                <Coins className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 mb-3">
                        Claim Your ComicCoins!
                    </h1>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                        Your daily reward is ready to be collected. Claim now and start exploring premium content!
                    </p>
                </div>

                {/* Error message display with improved accessibility */}
                {errorMessage && (
                    <div
                        className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4 flex items-start shadow-sm animate-pulse"
                        role="alert"
                        aria-labelledby="error-heading"
                        style={{ animation: 'pulse 2s ease-in-out' }}
                    >
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
                        <div>
                            <h3 id="error-heading" className="text-sm font-medium text-red-800">
                                Claim failed
                            </h3>
                            <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Claim Card with enhanced visual appeal */}
                <Card
                    className="p-6 space-y-6 transform transition-all duration-300"
                    withGlow={!claimSuccess}
                    withShadow="md"
                    gradient={true}
                >
                    {/* Success state */}
                    {claimSuccess ? (
                        <div className="text-center py-4">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
                                style={{ animation: 'pulse 2s ease-in-out infinite' }}
                            >
                                <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-bold text-green-700 mb-2">Claim Successful!</h3>
                            <p className="text-gray-600">
                                Congratulations! {dailyReward} ComicCoins have been added to your wallet.
                            </p>
                            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <>
                            {/* Reward Header */}
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-full shadow-md">
                                    <Gift className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Daily Reward Ready!</h2>
                                    <p className="text-sm text-gray-600">Claim your {dailyReward} ComicCoins today</p>
                                </div>
                            </div>

                            {/* Reward Display */}
                            <div
                                className="relative overflow-hidden bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 text-center shadow-inner"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                                }}
                            >
                                {/* Decorative stars */}
                                <div className="absolute top-3 left-3 text-yellow-400 opacity-70" aria-hidden="true">
                                    <Star size={16} fill="currentColor" />
                                </div>
                                <div
                                    className="absolute bottom-3 right-3 text-yellow-400 opacity-70"
                                    aria-hidden="true"
                                >
                                    <Star size={16} fill="currentColor" />
                                </div>

                                <p className="text-sm text-gray-600 mb-2" id="reward-label">
                                    Today's Reward
                                </p>
                                <div className="flex items-center justify-center gap-3" aria-labelledby="reward-label">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-400 rounded-full opacity-30 blur-sm"></div>
                                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-full shadow-md relative">
                                            <Coins className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600"
                                            style={
                                                !isFaucetLoading ? { animation: 'pulse 3s ease-in-out infinite' } : {}
                                            }
                                            aria-live="polite"
                                        >
                                            {isFaucetLoading ? (
                                                <span className="text-sm text-purple-500 opacity-70 flex items-center">
                                                    <LoadingSpinner />
                                                    <span className="ml-2">Loading...</span>
                                                </span>
                                            ) : (
                                                `${dailyReward} CC`
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">ComicCoins</div>
                                    </div>
                                </div>
                            </div>

                            {/* Claim Button with enhanced accessibility and visual feedback */}
                            <button
                                onClick={handleClaimCoins}
                                onTouchStart={handleButtonPress}
                                onTouchEnd={handleButtonRelease}
                                onMouseDown={handleButtonPress}
                                onMouseUp={handleButtonRelease}
                                onMouseLeave={handleButtonRelease}
                                disabled={isClaimingCoins || isFaucetLoading}
                                className={`w-full rounded-lg py-4 px-4 text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-white shadow-md ${
                                    isButtonPressed
                                        ? 'bg-gradient-to-r from-purple-800 to-indigo-800 scale-95 shadow-inner'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                                }`}
                                style={{
                                    backgroundSize: isClaimingCoins ? '200% 200%' : '100% 100%',
                                    animation: isClaimingCoins ? 'shimmer 2s infinite linear' : 'none',
                                }}
                                aria-live="polite"
                                aria-busy={isClaimingCoins}
                            >
                                {isClaimingCoins ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Claiming your coins...</span>
                                    </>
                                ) : (
                                    <>
                                        <Coins className="h-5 w-5" aria-hidden="true" />
                                        <span>Claim {dailyReward} ComicCoins</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </Card>

                {/* Next Claim Time Information */}
                <Card className="p-5" withBorder={true} withShadow="sm">
                    <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-purple-100 p-1.5 rounded-full">
                            <Clock className="h-4 w-4 text-purple-600" aria-hidden="true" />
                        </div>
                        <span>When can I claim again?</span>
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed pl-9">
                        You can claim ComicCoins once every 24 hours. After claiming, you'll need to wait until tomorrow
                        to claim again.
                    </p>
                </Card>

                {/* Additional help information */}
                <Card className="p-5" withBorder={true} withShadow="sm">
                    <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-purple-100 p-1.5 rounded-full">
                            <Coins className="h-4 w-4 text-purple-600" aria-hidden="true" />
                        </div>
                        <span>What are ComicCoins?</span>
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed pl-9">
                        ComicCoins (CC) are our platform's digital currency. You can use them to unlock premium comics,
                        purchase special editions, or trade with other collectors. Check your total balance on the
                        dashboard.
                    </p>
                </Card>
            </div>
        </div>
    )
}

export default withAuth(withWallet(ClaimCoinsPage))
