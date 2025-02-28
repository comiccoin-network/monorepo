import { useState, useCallback } from 'react'
import userService, { User, UpdateUserRequest } from '../services/userService'

/**
 * Return type for the usePutUpdateMe hook
 * Provides methods and states for managing profile updates
 */
export interface UsePutUpdateMeReturn {
    updateMe: (data: UpdateUserRequest) => Promise<User>
    isLoading: boolean
    error: Error | null
    isSuccess: boolean
    reset: () => void
}

/**
 * Custom hook for updating user profile information
 * Uses the userService with customAxios for automatic token refresh
 *
 * @returns An object containing update function, loading state,
 * error state, success state, and reset function
 */
export function usePutUpdateMe(): UsePutUpdateMeReturn {
    // State management for the update process
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    // Reset the hook's state to initial values
    const reset = useCallback(() => {
        setIsLoading(false)
        setError(null)
        setIsSuccess(false)
    }, [])

    // Main function to update user profile
    const updateMe = useCallback(
        async (data: UpdateUserRequest): Promise<User> => {
            try {
                console.log('🔄 UPDATE PROFILE: Starting update process', {
                    email: data.email,
                })

                // Reset states before starting the update
                setIsLoading(true)
                setError(null)
                setIsSuccess(false)

                // Remove any null or undefined values to avoid sending them to the API
                const cleanData = Object.entries(data).reduce<UpdateUserRequest>((acc, [key, value]) => {
                    if (value !== null && value !== undefined) {
                        // With the index signature added to UpdateUserRequest, this is now type-safe
                        acc[key] = value
                    }
                    return acc
                }, {} as UpdateUserRequest)

                console.log('📡 UPDATE PROFILE: Calling API')

                // Use userService to handle the update with our custom Axios implementation
                // This ensures automatic token refresh if needed
                const updatedUser = await userService.updateUser(cleanData)

                console.log('✅ UPDATE PROFILE: Success', {
                    email: updatedUser.email,
                })

                // Update states to reflect successful update
                setIsSuccess(true)
                setError(null)

                return updatedUser
            } catch (err: any) {
                console.error('❌ UPDATE PROFILE: Error occurred', {
                    error: err?.message || 'Unknown error',
                    status: err?.status,
                    details: err?.data,
                })

                // Standardize error handling
                const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to update profile')

                setError(errorObj)
                setIsSuccess(false)

                throw errorObj
            } finally {
                // Ensure loading state is reset
                setIsLoading(false)
            }
        },
        [] // No dependencies needed as userService is a singleton
    )

    // Return hook interface
    return {
        updateMe,
        isLoading,
        error,
        isSuccess,
        reset,
    }
}

export default usePutUpdateMe
export type { User, UpdateUserRequest }
