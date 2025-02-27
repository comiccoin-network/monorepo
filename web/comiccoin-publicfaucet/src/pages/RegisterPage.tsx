import { FC, useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react'
import { Link, Navigate } from 'react-router' // Updated to include Navigate
import {
    ArrowLeft,
    CheckCircle2,
    Globe,
    Lock,
    Mail,
    Phone,
    Shield,
    User,
    Clock,
    ArrowRight,
    AlertTriangle,
} from 'lucide-react'
import Header from '../components/FaucetPage/Header'
import Footer from '../components/FaucetPage/Footer'
import { useRegistration } from '../hooks/useRegistration'
import type { RegisterCustomerRequest } from '../services/registrationService'

// Registration form data interface matching the Go struct
interface RegisterFormData extends RegisterCustomerRequest {
    // The interface inherits all fields from RegisterCustomerRequest
}

const RegisterPage: FC = () => {
    // State for redirecting on success
    const [redirectTo, setRedirectTo] = useState<string>('')

    // Get registration functionality from our custom hook
    const { register, isLoading, error: apiError, success: apiSuccess, resetState } = useRegistration()

    // Create a ref for the error summary div to scroll to
    const errorSummaryRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // State for form fields
    const [formData, setFormData] = useState<RegisterFormData>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
        phone: '',
        country: '',
        country_other: '',
        timezone: '',
        agree_terms_of_service: false,
        agree_promotions: false,
    })

    // Field errors from API
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})

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

    // Effect to handle successful registration
    useEffect(() => {
        if (apiSuccess) {
            // Redirect to success page
            setRedirectTo('/register-success')
        }
    }, [apiSuccess])

    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear the error for this field when user starts typing
        if (errors[name as keyof RegisterFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Handle checkbox changes
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData((prev) => ({ ...prev, [name]: checked }))
        // Clear the error for this field when user checks it
        if (errors[name as keyof RegisterFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // Map API errors to form fields
    const mapApiErrorsToFormFields = () => {
        // Check for errors in API response
        if (!apiError) return

        const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}
        const summary: string[] = []

        // Handle standard API error structure from our hook
        if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([key, messages]) => {
                const formField = key as keyof RegisterFormData
                if (messages.length > 0) {
                    newErrors[formField] = messages[0]
                    summary.push(messages[0])
                }
            })
        }
        // Handle the 400 error format returned directly from the backend
        else if (apiError.message && typeof apiError.message === 'object') {
            // This handles the case where the error is in the format { field: "error message" }
            Object.entries(apiError.message).forEach(([key, message]) => {
                const formField = key as keyof RegisterFormData
                if (message && typeof message === 'string') {
                    newErrors[formField] = message
                    summary.push(message)
                }
            })
        }
        // Handle generic error messages
        else if (apiError.message && typeof apiError.message === 'string') {
            summary.push(apiError.message)
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

        // Reset submission states
        resetState()
        setErrors({})
        setErrorSummary([])

        // Mark as submitted to prevent duplicate API calls
        setIsSubmitted(true)

        try {
            // Send registration request to API using our hook - just once
            await register(formData)

            // No need to set a separate success state here
            // We'll rely solely on apiSuccess from the hook

            // Form reset will happen after redirect
        } catch (error) {
            // mapApiErrorsToFormFields() will be called by the useEffect when apiError changes
            // This ensures errors are always displayed regardless of when they occur
        }
    }

    // List of countries for the dropdown
    const countries = [
        { value: '', label: 'Select Country...' },
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'au', label: 'Australia' },
        { value: 'fr', label: 'France' },
        { value: 'de', label: 'Germany' },
        { value: 'jp', label: 'Japan' },
        { value: 'other', label: 'Other (please specify)' },
    ]

    // List of timezones for the dropdown (abbreviated for brevity)
    const timezones = [
        { value: '', label: 'Select Timezone...' },
        { value: 'UTC-12:00', label: '(UTC-12:00) International Date Line West' },
        { value: 'UTC-11:00', label: '(UTC-11:00) Samoa' },
        { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii' },
        { value: 'UTC-09:00', label: '(UTC-09:00) Alaska' },
        { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
        { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (US & Canada)' },
        { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (US & Canada)' },
        { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (US & Canada)' },
        { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time (Canada)' },
        { value: 'UTC-03:00', label: '(UTC-03:00) Brasilia' },
        { value: 'UTC-02:00', label: '(UTC-02:00) Mid-Atlantic' },
        { value: 'UTC-01:00', label: '(UTC-01:00) Azores' },
        { value: 'UTC+00:00', label: '(UTC+00:00) London, Dublin, Lisbon' },
        { value: 'UTC+01:00', label: '(UTC+01:00) Berlin, Paris, Rome, Madrid' },
        { value: 'UTC+02:00', label: '(UTC+02:00) Athens, Istanbul, Cairo' },
        { value: 'UTC+03:00', label: '(UTC+03:00) Moscow, Baghdad' },
        { value: 'UTC+04:00', label: '(UTC+04:00) Dubai, Baku' },
        { value: 'UTC+05:00', label: '(UTC+05:00) Karachi, Islamabad' },
        { value: 'UTC+05:30', label: '(UTC+05:30) New Delhi, Mumbai' },
        { value: 'UTC+06:00', label: '(UTC+06:00) Dhaka' },
        { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Jakarta' },
        { value: 'UTC+08:00', label: '(UTC+08:00) Beijing, Singapore, Hong Kong' },
        { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul' },
        { value: 'UTC+10:00', label: '(UTC+10:00) Sydney, Melbourne' },
        { value: 'UTC+11:00', label: '(UTC+11:00) Solomon Islands' },
        { value: 'UTC+12:00', label: '(UTC+12:00) Auckland, Fiji' },
    ]

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

            <main id="main-content" className="flex-grow">
                {/* Registration Hero Section */}
                <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 mb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                                Join the ComicCoin Network
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto mt-6 mb-4">
                                Create your account to start collecting ComicCoins and join our growing community.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Registration Form Section */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg">
                        <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-6">Create Your Account</h2>

                        {/* Display Error Summary Box */}
                        {errorSummary.length > 0 && (
                            <div
                                ref={errorSummaryRef}
                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                            >
                                <div className="flex items-center gap-2 font-medium mb-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h3>Please correct the following errors:</h3>
                                </div>
                                <ul className="list-disc ml-5 space-y-1">
                                    {errorSummary.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Display API general error message if not already showing summary */}
                        {apiError &&
                            !apiError.errors &&
                            typeof apiError.message === 'string' &&
                            errorSummary.length === 0 && (
                                <div
                                    ref={errorSummaryRef}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                                >
                                    <p className="font-medium">{apiError.message}</p>
                                </div>
                            )}

                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-purple-500" />
                                    Personal Information
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label
                                            htmlFor="first_name"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label
                                            htmlFor="last_name"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
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
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Phone (Optional) */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="pt-4 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-purple-500" />
                                    Location Information
                                </h3>

                                {/* Country */}
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country *
                                    </label>
                                    <select
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white`}
                                    >
                                        {countries.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                                </div>

                                {/* Other Country */}
                                {formData.country === 'other' && (
                                    <div>
                                        <label
                                            htmlFor="country_other"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Specify Country *
                                        </label>
                                        <input
                                            type="text"
                                            id="country_other"
                                            name="country_other"
                                            value={formData.country_other}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border ${
                                                errors.country_other ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                        />
                                        {errors.country_other && (
                                            <p className="mt-1 text-sm text-red-600">{errors.country_other}</p>
                                        )}
                                    </div>
                                )}

                                {/* Timezone */}
                                <div>
                                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Timezone *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="timezone"
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                                                errors.timezone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white`}
                                        >
                                            {timezones.map((timezone) => (
                                                <option key={timezone.value} value={timezone.value}>
                                                    {timezone.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>}
                                </div>
                            </div>

                            {/* Account Security */}
                            <div className="pt-4 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-purple-500" />
                                    Account Security
                                </h3>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                        placeholder="At least 8 characters"
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="password_confirm"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Confirm Password *
                                    </label>
                                    <input
                                        type="password"
                                        id="password_confirm"
                                        name="password_confirm"
                                        value={formData.password_confirm}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-lg border ${
                                            errors.password_confirm ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                    />
                                    {errors.password_confirm && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirm}</p>
                                    )}
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="pt-4 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    Terms & Privacy
                                </h3>

                                {/* Terms of Service */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="agree_terms_of_service"
                                            name="agree_terms_of_service"
                                            type="checkbox"
                                            checked={formData.agree_terms_of_service}
                                            onChange={handleCheckboxChange}
                                            className={`h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 ${
                                                errors.agree_terms_of_service ? 'border-red-300' : ''
                                            }`}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="agree_terms_of_service" className="font-medium text-gray-700">
                                            I agree to the{' '}
                                            <Link
                                                to="/terms"
                                                className="text-purple-600 hover:text-purple-800 underline"
                                            >
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                to="/privacy"
                                                className="text-purple-600 hover:text-purple-800 underline"
                                            >
                                                Privacy Policy
                                            </Link>{' '}
                                            *
                                        </label>
                                        {errors.agree_terms_of_service && (
                                            <p className="mt-1 text-sm text-red-600">{errors.agree_terms_of_service}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Promotional emails */}
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="agree_promotions"
                                            name="agree_promotions"
                                            type="checkbox"
                                            checked={formData.agree_promotions}
                                            onChange={handleCheckboxChange}
                                            className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="agree_promotions" className="font-medium text-gray-700">
                                            I'd like to receive updates about new features, events, and other
                                            comic-related content
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
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
                                            Creating your account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Sign In Link */}
                            <div className="text-center pt-2">
                                <p className="text-gray-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                                        Sign In
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

export default RegisterPage
