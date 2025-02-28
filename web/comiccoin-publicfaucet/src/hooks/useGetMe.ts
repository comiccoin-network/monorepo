// monorepo/web/comiccoin-publicfaucet/src/hooks/useGetMe.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import getMeService, { User } from '../services/getMeService'

interface UseGetMeOptions {
    enabled?: boolean
}

interface UseGetMeReturn {
    user: User | null
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<User>
}

/**
 * Hook to fetch and manage current user data
 * Uses getMeService with custom Axios for automatic token refresh
 *
 * @param options - Configuration options for the hook
 * @returns Object containing user data, loading state, error state, and refetch function
 */
export function useGetMe({ enabled = true }: UseGetMeOptions = {}): UseGetMeReturn {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(enabled)
    const [error, setError] = useState<Error | null>(null)

    // Use refs to prevent issues with stale values in callbacks
    const enabledRef = useRef(enabled)
    const isMountedRef = useRef(true)
    const isInitialFetchRef = useRef(true)
    const isFetchingRef = useRef(false)

    // Update refs when props change
    useEffect(() => {
        enabledRef.current = enabled
    }, [enabled])

    /**
     * Fetch user data from the API
     * Optimized to avoid race conditions and stale state updates
     */
    const fetchUserData = useCallback(async (): Promise<User> => {
        // Prevent multiple simultaneous fetches
        if (isFetchingRef.current) {
            console.log('🚫 PROFILE HOOK: Fetch already in progress, skipping')
            throw new Error('Fetch already in progress')
        }

        try {
            console.log('👤 PROFILE HOOK: Starting fetch')

            // Skip if not enabled or component unmounted
            if (!enabledRef.current || !isMountedRef.current) {
                console.log('🚫 PROFILE HOOK: Fetch skipped - disabled or unmounted')
                throw new Error('Fetch skipped - component disabled or unmounted')
            }

            isFetchingRef.current = true
            setIsLoading(true)
            setError(null)

            // Use the service to fetch user data with automatic token refresh
            const userData = await getMeService.getMe()

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setUser(userData)
                setError(null)
            }

            return userData
        } catch (err: any) {
            console.error('❌ PROFILE HOOK: Fetch failed', {
                error: err?.message || 'Unknown error',
                status: err?.status,
                details: err?.data,
            })

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                // Set error state with improved type handling
                const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch user data')

                setError(errorObj)

                // Don't clear user data on error if we already have it
                // This prevents flashing empty UI on refresh errors
                if (user === null) {
                    setUser(null)
                }
            }

            throw err instanceof Error ? err : new Error(err?.message || 'Failed to fetch user data')
        } finally {
            // Only update loading state if component is still mounted
            if (isMountedRef.current) {
                setIsLoading(false)
                isFetchingRef.current = false
            }
        }
    }, []) // Empty dependency array to prevent recreation on each render

    // Fetch user data when the hook is first used (if enabled)
    useEffect(() => {
        // Only run this effect once
        if (!isInitialFetchRef.current) return

        // Mark that we've run the initial fetch
        isInitialFetchRef.current = false

        // Set mounted flag
        isMountedRef.current = true

        if (enabled) {
            console.log('🔄 PROFILE HOOK: Auto-fetching on mount')
            fetchUserData().catch((error) => {
                if (error.message !== 'Fetch already in progress') {
                    console.log('❌ PROFILE HOOK: Auto-fetch failed', error)
                }
            })
        }

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMountedRef.current = false
        }
    }, [enabled]) // Remove fetchUserData from dependencies to prevent loop

    // Return the current state and refetch function
    return {
        user,
        isLoading,
        error,
        refetch: fetchUserData,
    }
}

export default useGetMe
