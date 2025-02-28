// monorepo/web/comiccoin-publicfaucet/src/hooks/useAuthorizationUrl.ts
import { useState, useEffect, useCallback } from 'react'
import authorizationService from '../services/authorizationService'

// Parameters for the hook
export interface UseAuthorizationUrlParams {
    redirectUri?: string
    scope?: string
}

// What the hook returns to components
export interface UseAuthorizationUrlReturn {
    authUrl: string | null
    state: string | null
    expiresAt: number | null
    isLoading: boolean
    error: Error | null
    refetch: (redirectUri?: string, scope?: string) => Promise<void>
}

/**
 * Hook to fetch and manage the OAuth authorization URL
 * @param params - The parameters for the authorization request
 * @returns Object containing authorization data, loading state, error state, and refetch function
 */
export function useAuthorizationUrl(params?: UseAuthorizationUrlParams): UseAuthorizationUrlReturn {
    console.log('🎯 Hook Initialization', {
        params,
    })

    // State for storing the auth data and handling loading/error states
    const [authUrl, setAuthUrl] = useState<string | null>(null)
    const [state, setState] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<Error | null>(null)

    // Define the fetch function that will get the authorization URL
    const fetchAuthUrl = useCallback(
        async (redirectUri: string = params?.redirectUri || '', scope: string = params?.scope || '') => {
            console.log('🔄 Effect Triggered:', {
                redirectUri,
                scope,
            })

            setIsLoading(true)
            setError(null)

            try {
                const data = await authorizationService.getAuthorizationUrl(redirectUri, scope)

                setAuthUrl(data.auth_url)
                setState(data.state)
                setExpiresAt(data.expires_at)
            } catch (err) {
                const newError = err instanceof Error ? err : new Error('An unknown error occurred')

                setError(newError)
                setAuthUrl(null)
                setState(null)
                setExpiresAt(null)
            } finally {
                setIsLoading(false)
                console.log('🏁 Request Cycle Completed', {
                    success: error === null,
                    hasAuthUrl: authUrl !== null,
                })
            }
        },
        // Include all state variables used in the callback
        [params?.redirectUri, params?.scope, authUrl, error]
    )

    // Fetch the authorization URL when the hook is first used and when deps change
    useEffect(() => {
        if (typeof window !== 'undefined' && params?.redirectUri) {
            fetchAuthUrl(params.redirectUri, params.scope)
        } else {
            console.log('⏳ Waiting for client-side and redirectUri')
        }
    }, [fetchAuthUrl, params?.redirectUri, params?.scope])

    // Return the current state and refetch function
    return {
        authUrl,
        state,
        expiresAt,
        isLoading,
        error,
        refetch: fetchAuthUrl,
    }
}

export default useAuthorizationUrl
