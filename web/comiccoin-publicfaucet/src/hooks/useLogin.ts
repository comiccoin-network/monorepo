import { useState, useCallback } from 'react'
import LoginService from '../services/loginService'

// Define the shape of the login credentials
interface LoginCredentials {
    email: string
    password: string
}

// Define the return type for the login hook
interface UseLoginReturn {
    isLoading: boolean
    error: string | null
    login: (credentials: LoginCredentials) => Promise<void>
    reset: () => void
}

/**
 * Custom hook for handling user login
 * @param onSuccess - Callback function when login is successful
 * @param onError - Callback function when login fails
 * @param onDone - Callback function when login process is complete
 * @returns Login hook methods and state
 */
export const useLogin = (
    onSuccess?: (response: any) => void,
    onError?: (error: string) => void,
    onDone?: () => void
): UseLoginReturn => {
    // State to track loading, error, and login process
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Perform login with provided credentials
     * @param credentials - User login credentials
     */
    const login = useCallback(
        async (credentials: LoginCredentials): Promise<void> => {
            // Reset previous state
            setError(null)
            setIsLoading(true)

            try {
                // Call login service
                const response = await LoginService.login(credentials.email, credentials.password)

                // Store authentication tokens
                LoginService.storeTokens(response.accessToken, response.refreshToken)

                // Call success callback if provided
                onSuccess?.(response)
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
        },
        [onSuccess, onError, onDone]
    )

    /**
     * Reset the hook's state
     */
    const reset = useCallback(() => {
        setIsLoading(false)
        setError(null)
    }, [])

    return {
        isLoading,
        error,
        login,
        reset,
    }
}
