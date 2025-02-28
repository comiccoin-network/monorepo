// monorepo/web/comiccoin-publicfaucet/src/pages/LoginPage.tsx
import { FC, useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react'
import { Link, Navigate } from 'react-router'
import { Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react'

import { setAccessTokenInLocalStorage, setRefreshTokenInLocalStorage } from '../helpers/jwtUtility'
import LoginService from '../services/loginService'
import { useLogin } from '../hooks/useLogin'
import { useMe } from '../hooks/useMe'
import Header from '../components/FaucetPage/Header'
import Footer from '../components/FaucetPage/Footer'

// Login form data interface
interface LoginFormData {
    email: string
    password: string
}

const LoginPage: FC = () => {
    console.log('🏁 LoginPage component mounted')

    // State for redirecting on success
    const [redirectTo, setRedirectTo] = useState<string>('')
    console.log(`🧭 Current redirect state: ${redirectTo || 'Not set'}`)

    // Get login functionality from our custom hook
    const { login, isLoading, error: apiError, reset: resetLoginState } = useLogin()
    console.log(
        `🔄 Login hook state - Loading: ${isLoading ? '⏳ Yes' : '✅ No'}, Error: ${apiError ? '❌ Present' : '✅ None'}`
    )

    // Get user profile management functionality
    const { updateUser } = useMe()
    console.log('👤 User profile management hook initialized')

    // Create a ref for the error summary div to scroll to
    const errorSummaryRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    console.log('🔖 Form and error summary refs created')

    // State for form fields
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })
    console.log('📝 Form data state initialized')

    // Field errors from API
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
    console.log(`🚨 Field errors state: ${Object.keys(errors).length > 0 ? '❌ Has errors' : '✅ No errors'}`)

    // Error summary for display in the error box
    const [errorSummary, setErrorSummary] = useState<string[]>([])
    console.log(`📋 Error summary state: ${errorSummary.length > 0 ? '❌ Has errors' : '✅ No errors'}`)

    // State to track if form has been submitted to prevent duplicate submissions
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    console.log(`📤 Form submission state: ${isSubmitted ? '🔒 Submitted' : '🔓 Not submitted'}`)

    // Effect to handle API errors when they change
    useEffect(() => {
        console.log('🔄 useEffect triggered for API error changes')

        if (apiError) {
            console.log('❌ API error detected:', apiError)
            console.log('🔄 Mapping API errors to form fields')
            mapApiErrorsToFormFields()

            console.log('📜 Scrolling to error summary')
            // Scroll to the top of the form when errors occur
            setTimeout(() => {
                if (errorSummaryRef.current) {
                    console.log('🔍 Error summary ref found, scrolling to it')
                    errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else if (formRef.current) {
                    console.log('🔍 Form ref found, scrolling to it')
                    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else {
                    console.log('🔍 No refs found, scrolling to top of window')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }, 100)

            // Reset submission flag when we get an error
            console.log('🔓 Resetting form submission state')
            setIsSubmitted(false)
        } else {
            console.log('✅ No API errors detected')
        }
    }, [apiError])

    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        console.log(`📝 Input change: ${name} = ${value.substring(0, 1)}${'*'.repeat(Math.max(0, value.length - 1))}`)

        setFormData((prev) => {
            const updated = { ...prev, [name]: value }
            console.log('📝 Form data updated')
            return updated
        })

        // Clear the error for this field when user starts typing
        if (errors[name as keyof LoginFormData]) {
            console.log(`🧹 Clearing error for field: ${name}`)
            setErrors((prev) => {
                const updated = { ...prev, [name]: undefined }
                console.log('🚨 Field errors updated')
                return updated
            })
        }
    }

    // Map API errors to form fields
    const mapApiErrorsToFormFields = () => {
        console.log('🗺️ Starting to map API errors to form fields')

        // Check for errors in API response
        if (!apiError) {
            console.log('✅ No API errors to map')
            return
        }

        const newErrors: Partial<Record<keyof LoginFormData, string>> = {}
        const summary: string[] = []

        // Handle standard API error structure from our hook
        if (typeof apiError === 'string') {
            console.log(`🚨 API error is a string: "${apiError}"`)
            summary.push(apiError)
        } else if (apiError instanceof Object) {
            console.log('🚨 API error is an object, processing fields')
            // If error is an object with specific field errors
            Object.entries(apiError).forEach(([key, messages]) => {
                const formField = key as keyof LoginFormData
                console.log(`🔍 Processing error for field: ${formField}`)

                if (Array.isArray(messages) && messages.length > 0) {
                    console.log(`📝 Field ${formField} has array of errors, using first: "${messages[0]}"`)
                    newErrors[formField] = messages[0]
                    summary.push(messages[0])
                } else if (typeof messages === 'string') {
                    console.log(`📝 Field ${formField} has string error: "${messages}"`)
                    newErrors[formField] = messages
                    summary.push(messages)
                }
            })
        }

        console.log('📊 Error mapping complete:', { fieldErrors: newErrors, summary })
        setErrors(newErrors)
        setErrorSummary(summary)
    }

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        console.log('🚀 Form submission initiated')
        e.preventDefault()

        // Prevent multiple submissions
        if (isLoading || isSubmitted) {
            console.log('⚠️ Submission blocked - already loading or submitted')
            return
        }

        // Reset previous submission states
        console.log('🧹 Resetting previous submission state')
        resetLoginState()
        setErrors({})
        setErrorSummary([])

        // Mark as submitted to prevent duplicate API calls
        console.log('🔒 Setting form as submitted')
        setIsSubmitted(true)

        try {
            console.log('🔑 Attempting login with credentials')
            console.log(`📧 Email: ${formData.email}`)
            console.log(`🔐 Password: ${'*'.repeat(formData.password.length)}`)

            // Send login request to API using our hook
            const response = await login({
                email: formData.email,
                password: formData.password,
            })

            console.log('✅ Login successful!', {
                responseReceived: !!response,
                accessTokenPresent: response && !!response.access_token,
                refreshTokenPresent: response && !!response.refresh_token,
                userDataPresent: response && !!response.user,
            })

            // Check if response exists (login succeeded)
            if (response) {
                console.log('💾 Saving tokens to local storage')
                // Save the access token / refresh token to local storage
                setAccessTokenInLocalStorage(response.access_token)
                setRefreshTokenInLocalStorage(response.refresh_token)

                // Use the service's storeTokens method to ensure consistency
                LoginService.storeTokens(response.access_token, response.refresh_token)

                console.log('👤 Saving user profile to local storage')
                // Save the user profile to local storage
                localStorage.setItem('userProfile', JSON.stringify(response.user))

                console.log('🔄 Updating user in global state')
                // Update the user profile in the useMe hook (which will save to cache)
                updateUser(response.user)

                console.log('🧭 Setting redirect to dashboard')
                // On successful login, redirect to dashboard
                setRedirectTo('/user/dashboard')
            } else {
                console.warn('⚠️ Login response was empty despite successful request')
            }
        } catch (error) {
            console.error('❌ Login failed with error:', error)
            // mapApiErrorsToFormFields() will be called by the useEffect when apiError changes
            // This ensures errors are always displayed regardless of when they occur
        }
    }

    // If redirectTo is set, redirect to that URL
    if (redirectTo) {
        console.log(`🧭 Redirecting to: ${redirectTo}`)
        return <Navigate to={redirectTo} />
    }

    console.log('🎨 Rendering LoginPage component')
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
            >
                Skip to main content
            </a>

            {/* Header component with back button */}
            <Header showBackButton={true} />

            <main id="main-content" className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-md px-4">
                    <div className="bg-white rounded-xl p-8 shadow-lg border border-purple-100">
                        <h2 className="text-3xl font-bold text-purple-800 text-center mb-6">Welcome Back</h2>

                        {/* Display Error Summary Box */}
                        {errorSummary.length > 0 && (
                            <div
                                ref={errorSummaryRef}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                            >
                                <div className="flex items-center gap-2 font-medium mb-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h3>Login Failed</h3>
                                </div>
                                <ul className="list-disc ml-5 space-y-1">
                                    {errorSummary.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                        placeholder="Enter your password"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || isSubmitted}
                                    className={`w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 ${
                                        isLoading || isSubmitted ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                    onClick={() => console.log('👆 Login button clicked')}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            Login
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Sign Up Link */}
                            <div className="text-center pt-2">
                                <p className="text-gray-600">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="text-purple-600 hover:text-purple-800 font-medium"
                                        onClick={() => console.log('👆 Sign Up link clicked')}
                                    >
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer component */}
            <Footer isLoading={false} error={null} faucet={null} />
        </div>
    )
}

// Add component lifecycle logging
const EnhancedLoginPage: FC = () => {
    useEffect(() => {
        console.log('🎬 LoginPage component mounted to DOM')
        return () => {
            console.log('🛑 LoginPage component unmounted from DOM')
        }
    }, [])

    return <LoginPage />
}

export default EnhancedLoginPage
