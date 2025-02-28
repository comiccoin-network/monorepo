import { useState, useEffect, useCallback, useRef } from 'react'
import getMeService, { User } from '../services/getMeService'

//Improved Error Type
interface ApiError extends Error {
    status?: number
    data?: any
}

interface UseGetMeOptions {
    enabled?: boolean
    retryDelay?: number // Add retry delay option
}

interface UseGetMeReturn {
    user: User | null
    isLoading: boolean
    error: ApiError | null
    refetch: () => Promise<User>
}

export function useGetMe({ enabled = true, retryDelay = 3000 }: UseGetMeOptions = {}): UseGetMeReturn {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(enabled)
    const [error, setError] = useState<ApiError | null>(null)
    const isMountedRef = useRef(true)
    const retryRef = useRef(0)

    const fetchUserData = useCallback(async (): Promise<User> => {
        setIsLoading(true)
        setError(null)

        try {
            if (!enabled || !isMountedRef.current) {
                throw new Error('Fetch skipped - component disabled or unmounted')
            }

            return await getMeService.getMe()
        } catch (err: any) {
            const apiError: ApiError =
                err instanceof Error ? err : new ApiError(err.message || 'Failed to fetch user data')
            apiError.status = err.status
            apiError.data = err.data

            if (apiError.status === 401 && retryRef.current < 3) {
                //Example retry for authentication failures
                retryRef.current++
                setTimeout(fetchUserData, retryDelay)
                return null as any
            }

            setError(apiError)
            console.error('❌ PROFILE HOOK: Fetch failed', apiError)
            throw apiError
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
        }
    }, [enabled, retryDelay])

    useEffect(() => {
        isMountedRef.current = true
        if (enabled) {
            fetchUserData().catch((err) => {
                console.error('❌ PROFILE HOOK: Initial fetch failed', err)
            })
        }

        return () => {
            isMountedRef.current = false
        }
    }, [enabled, fetchUserData])

    return { user, isLoading, error, refetch: fetchUserData }
}

export default useGetMe
