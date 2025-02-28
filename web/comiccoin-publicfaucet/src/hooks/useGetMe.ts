// monorepo/web/comiccoin-publicfaucet/src/hooks/useGetMe.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import getMeService, { User } from '../services/getMeService'

interface ApiError extends Error {
    status?: number
    data?: any
}

interface UseGetMeOptions {
    enabled?: boolean
    retry?: number // Add retry option
}

interface UseGetMeReturn {
    user: User | null
    isLoading: boolean
    error: ApiError | null
    refetch: () => void
}

export function useGetMe({ enabled = true, retry = 3 }: UseGetMeOptions = {}): UseGetMeReturn {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const {
        data: user,
        isLoading,
        refetch,
        error: queryError,
    } = useQuery({
        queryKey: ['user'],
        queryFn: () => getMeService.getMe(),
        enabled: enabled,
        retry: retry, // Number of retries before giving up.
        onError: (err: any) => {
            const apiError: ApiError =
                err instanceof Error ? err : new ApiError(err.message || 'Failed to fetch user data')
            apiError.status = err.response?.status
            apiError.data = err.response?.data
            setError(apiError)
        },
    })

    return { user, isLoading, error: error || queryError, refetch }
}

export default useGetMe
