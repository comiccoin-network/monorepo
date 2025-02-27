import { useState } from 'react'
import EmailVerificationService from '../services/emailVerificationService'

/**
 * Interface for the hook's return value
 */
interface UseEmailVerificationReturn {
    isLoading: boolean
    error: string | null
    verifyEmail: (code: string) => Promise<void>
    reset: () => void
}

/**
 * Custom hook for email verification
 * @returns An object with verification methods and state
 */
export const useEmailVerification = (
    onSuccess?: (data: any) => void,
    onError?: (error: string) => void,
    onDone?: () => void
): UseEmailVerificationReturn => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Verify email with the given code
     * @param code - Verification code to send
     */
    const verifyEmail = async (code: string): Promise<void> => {
        // Reset previous state
        setError(null)
        setIsLoading(true)

        try {
            // Call the verification service
            const result = await EmailVerificationService.verifyEmail(code)

            // Call success callback if provided
            onSuccess?.(result)
        } catch (err) {
            // Handle and set error
            const errorMessage = err instanceof Error ? err.message : String(err)
            setError(errorMessage)

            // Call error callback if provided
            onError?.(errorMessage)
        } finally {
            // Always set loading to false
            setIsLoading(false)

            // Call done callback if provided
            onDone?.()
        }
    }

    /**
     * Reset the hook's state
     */
    const reset = () => {
        setIsLoading(false)
        setError(null)
    }

    return {
        isLoading,
        error,
        verifyEmail,
        reset,
    }
}
