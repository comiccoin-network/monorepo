// monorepo/web/comiccoin-publicfaucet/src/hooks/useGetMe.ts
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import getMeService from '../services/getMeService'
import { ApiError, UseGetMeOptions, UseGetMeReturn } from '../types'

export function useGetMe({ enabled = true, retry = 3 }: UseGetMeOptions = {}): UseGetMeReturn {
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
                err instanceof Error ? err : new Error(err.message || 'Failed to fetch user data')
            apiError.status = err.response?.status
            apiError.data = err.response?.data
            setError(apiError)
        },
    })

    return {
        user: user || null,
        isLoading,
        error: error || (queryError as ApiError),
        refetch,
    }
}

export default useGetMe
