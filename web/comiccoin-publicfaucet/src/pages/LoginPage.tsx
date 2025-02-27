import { FC, useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react'
import { Link, Navigate } from 'react-router'
import { Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react'

import { useLogin } from '../hooks/useLogin'
import Header from '../components/FaucetPage/Header'
import Footer from '../components/FaucetPage/Footer'

// Login form data interface
interface LoginFormData {
    email: string
    password: string
}

const LoginPage: FC = () => {
    // State for redirecting on success
    const [redirectTo, setRedirectTo] = useState<string>('')

    // Get login functionality from our custom hook
    const { login, isLoading, error: apiError, reset: resetLoginState } = useLogin()

    // Create a ref for the error summary div to scroll to
    const errorSummaryRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // State for form fields
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })

    // Field errors from API
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})

    // Error summary for display in the error box
    const [errorSummary, setErrorSummary] = useState<string[]>([])

    // State to track if form has been submitted to prevent duplicate submissions
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

    // Effect to handle API errors when they change
    useEffect(() => {
        if (apiError) {
            mapApiErrorsToFormFields()

            // Scroll to the top of the form when errors occur
            setTimeout(() => {
                if (errorSummaryRef.current) {
                    errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else if (formRef.current) {
                    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }, 100)

            // Reset submission flag when we get an error
            setIsSubmitted(false)
        }
    }, [apiError])

    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear the error for this field when user starts typing
        if (errors[name as keyof LoginFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Map API errors to form fields
    const mapApiErrorsToFormFields = () => {
        // Check for errors in API response
        if (!apiError) return

        const newErrors: Partial<Record<keyof LoginFormData, string>> = {}
        const summary: string[] = []

        // Handle standard API error structure from our hook
        if (typeof apiError === 'string') {
            summary.push(apiError)
        } else if (apiError instanceof Object) {
            // If error is an object with specific field errors
            Object.entries(apiError).forEach(([key, messages]) => {
                const formField = key as keyof LoginFormData
                if (Array.isArray(messages) && messages.length > 0) {
                    newErrors[formField] = messages[0]
                    summary.push(messages[0])
                } else if (typeof messages === 'string') {
                    newErrors[formField] = messages
                    summary.push(messages)
                }
            })
        }

        setErrors(newErrors)
        setErrorSummary(summary)
    }

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        // Prevent multiple submissions
        if (isLoading || isSubmitted) {
            return
        }

        // Reset previous submission states
        resetLoginState()
        setErrors({})
        setErrorSummary([])

        // Mark as submitted to prevent duplicate API calls
        setIsSubmitted(true)

        try {
            // Send login request to API using our hook
            await login({
                email: formData.email,
                password: formData.password,
            })

            // On successful login, redirect to dashboard
            setRedirectTo('/user/dashboard')
        } catch (error) {
            // mapApiErrorsToFormFields() will be called by the useEffect when apiError changes
            // This ensures errors are always displayed regardless of when they occur
        }
    }

    // If redirectTo is set, redirect to that URL
    if (redirectTo) {
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
                                    <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium">
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

export default LoginPage
