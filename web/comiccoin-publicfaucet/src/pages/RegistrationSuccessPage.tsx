// monorepo/web/comiccoin-publicfaucet/src/pages/RegistrationSuccessPage.tsx
import { FC, useState } from 'react'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { Navigate } from 'react-router'
import Header from '../components/FaucetPage/Header'
import Footer from '../components/FaucetPage/Footer'

const RegistrationSuccessPage: FC = () => {
    // State for redirecting
    const [redirectTo, setRedirectTo] = useState<string>('')

    // Handle redirect
    if (redirectTo !== '') {
        return <Navigate to={redirectTo} />
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            {/* Header component */}
            <Header showBackButton={true} />

            {/* Main Content - Centered both vertically and horizontally */}
            <main id="main-content" className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
                        <div className="flex flex-col items-center space-y-8">
                            {/* Success Icon */}
                            <div className="bg-green-100 rounded-full p-6 h-24 w-24 flex items-center justify-center">
                                <Mail className="h-12 w-12 text-green-600" />
                            </div>

                            {/* Header */}
                            <h1 className="text-3xl font-bold text-purple-800 text-center">Registration Successful!</h1>

                            {/* Message */}
                            <div className="text-center text-gray-700 space-y-6 max-w-lg">
                                <p className="text-lg">
                                    Thank you for registering - an <span className="font-bold">activation email</span>{' '}
                                    has been sent to you. Please be sure to check your social, promotions and spam
                                    folders if it does not arrive within 5 minutes.
                                </p>

                                <p className="text-gray-600">
                                    Your account has been created, but you'll need to confirm your email before you can
                                    start collecting your ComicCoins.
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <button
                                        onClick={() => setRedirectTo('/login')}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Go to Login
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setRedirectTo('/')}
                                        className="bg-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                        Back to Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer component */}
            <Footer isLoading={false} error={null} faucet={null} />
        </div>
    )
}

export default RegistrationSuccessPage
