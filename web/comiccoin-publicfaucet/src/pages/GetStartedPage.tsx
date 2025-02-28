// monorepo/web/comiccoin-publicfaucet/src/pages/GetStartedPage.tsx
import { FC } from 'react'
import { Link } from 'react-router'
import { UserPlus, LogIn, Globe, Shield, KeyRound, ArrowRight } from 'lucide-react'
import { useGetFaucet } from '../hooks/useGetFaucet'
import CustomHeader from '../components/FaucetPage/CustomHeader'
import Footer from '../components/FaucetPage/Footer'

// Using similar structure and consistent styling with FaucetPage
const GetStartedPage: FC = () => {
    // Use the same hook as in FaucetPage to get real data
    const { faucet, isLoading, error } = useGetFaucet({
        chainId: 1,
        enabled: true,
        refreshInterval: 60000,
    })

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            {/* Skip to main content link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            {/* Use the CustomHeader component with showBackButton=true */}
            <CustomHeader showBackButton={true} />

            <main id="main-content" className="flex-grow">
                {/* Hero Section - Styled consistently with FaucetPage */}
                <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                                Welcome to ComicCoin Faucet
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                                Join our community of comic collectors and creators today and get free ComicCoins!
                            </p>
                            <Link
                                to="/"
                                className="mt-8 inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-base sm:text-lg shadow-lg hover:shadow-xl active:bg-indigo-100 active:shadow-md"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Authentication Options - Improved for all device sizes */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-800 text-center mb-12">
                        Choose Your Path
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-12 mb-12">
                        {/* Register Option */}
                        <Link to="/register" className="group">
                            <div className="bg-white h-full p-6 sm:p-8 rounded-xl border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center text-center">
                                <div className="p-4 bg-purple-50 rounded-full mb-6 group-hover:scale-110 transition-transform">
                                    <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4">
                                    New to ComicCoin?
                                </h3>
                                <p className="text-gray-600 mb-6 text-base sm:text-lg flex-grow">
                                    Create your ComicCoin Network account to join our community of comic enthusiasts.
                                    Get access to exclusive features and claim your daily ComicCoins.
                                </p>
                                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg">
                                    Register Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>

                        {/* Login Option */}
                        <Link to="/login" className="group">
                            <div className="bg-white h-full p-6 sm:p-8 rounded-xl border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center text-center">
                                <div className="p-4 bg-purple-50 rounded-full mb-6 group-hover:scale-110 transition-transform">
                                    <LogIn className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-4">
                                    Already Have an Account?
                                </h3>
                                <p className="text-gray-600 mb-6 text-base sm:text-lg flex-grow">
                                    Sign in with your existing credentials to continue your journey. Access your
                                    collections and claim your daily rewards.
                                </p>
                                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-lg">
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Use the Footer component with data from useGetFaucet hook */}
            <Footer isLoading={isLoading} error={error} faucet={faucet} />
        </div>
    )
}

export default GetStartedPage
