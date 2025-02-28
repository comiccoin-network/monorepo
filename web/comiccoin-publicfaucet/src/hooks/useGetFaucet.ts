// monorepo/web/comiccoin-publicfaucet/src/hooks/useGetFaucet.ts
import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import faucetService, { FaucetDTO } from '../services/faucetService'

interface ApiError extends Error {
    status?: number
    data?: any
}

interface UseGetFaucetOptions {
    chainId?: number
    refreshInterval?: number
    retry?: number // Add retry option
    enabled?: boolean
}

interface UseGetFaucetResult {
    faucet: FaucetDTO | null
    loading: boolean
    error: ApiError | null
    refetch: () => void
    setChainId: (chainId: number) => void
}

export function useGetFaucet({
    chainId = 1,
    refreshInterval = 60000,
    retry = 3,
    enabled = true,
}: UseGetFaucetOptions = {}): UseGetFaucetResult {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const {
        data: faucet,
        isLoading: loading,
        refetch,
        error: queryError,
    } = useQuery({
        queryKey: ['faucet', chainId],
        queryFn: async () => {
            try {
                return await faucetService.getFaucetData(chainId)
            } catch (err: any) {
                const apiError: ApiError =
                    err instanceof Error ? err : new ApiError(err.message || 'An unknown error occurred')
                apiError.status = err?.response?.status // Attempt to extract status code
                apiError.data = err?.response?.data // Attempt to extract data
                throw apiError // Re-throw to be caught by onError
            }
        },
        enabled: enabled,
        staleTime: refreshInterval,
        cacheTime: 5 * 60 * 1000, // 5 minutes cache
        refetchInterval: refreshInterval,
        retry: retry,
        onError: (err: ApiError) => {
            setError(err)
        },
    })

    const handleSetChainId = useCallback(
        (newChainId: number) => {
            queryClient.invalidateQueries(['faucet', newChainId]) //Invalidate queries on chainId change
        },
        [queryClient]
    )

    return {
        faucet,
        loading,
        error,
        refetch,
        setChainId: handleSetChainId,
    }
}

export default useGetFaucet
