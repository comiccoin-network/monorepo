// monorepo/web/comiccoin-publicfaucet/src/hooks/useTransactions.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import transactionsService, { Transaction } from '../services/transactionsService'

interface ApiError extends Error {
    status?: number
    data?: any
}

interface UseTransactionsOptions {
    refreshInterval?: number
    enabled?: boolean
}

interface UseTransactionsReturn {
    transactions: Transaction[] | undefined
    isLoading: boolean
    error: ApiError | null
    refetch: () => void
}

export function useTransactions({
    refreshInterval = 60000,
    enabled = true,
}: UseTransactionsOptions = {}): UseTransactionsReturn {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const {
        data: transactions,
        isLoading,
        refetch,
        error: queryError,
    } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionsService.getTransactions(),
        enabled: enabled,
        staleTime: refreshInterval, //Data is considered stale after this time (ms)
        cacheTime: 5 * 60 * 1000, //Keep data in cache for 5 minutes
        refetchInterval: refreshInterval > 0 ? refreshInterval : false, // Only refetch if refreshInterval is set

        onError: (err: any) => {
            const apiError: ApiError =
                err instanceof Error ? err : new ApiError(err.message || 'Failed to fetch transactions')
            apiError.status = err.response?.status
            apiError.data = err.response?.data
            setError(apiError)
        },
    })

    return { transactions, isLoading, error: error || queryError, refetch }
}

export default useTransactions
export type { Transaction }
