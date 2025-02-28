// monorepo/web/comiccoin-publicfaucet/src/hooks/useTransactions.ts
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import transactionsService from '../services/transactionsService'
import { ApiError, UseTransactionsOptions, UseTransactionsReturn, Transaction } from '../types'

export function useTransactions({
    refreshInterval = 60000,
    enabled = true,
}: UseTransactionsOptions = {}): UseTransactionsReturn {
    const [error, setError] = useState<ApiError | null>(null)

    const {
        data: transactions,
        isLoading,
        refetch,
        error: queryError,
    } = useQuery<Transaction[], Error>({
        queryKey: ['transactions'],
        queryFn: () => transactionsService.getTransactions(),
        enabled: enabled,
        staleTime: refreshInterval, // Data is considered stale after this time (ms)
        gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes (renamed from cacheTime)
        refetchInterval: refreshInterval > 0 ? refreshInterval : false, // Only refetch if refreshInterval is set

        onError: (err: any) => {
            const apiError: ApiError =
                err instanceof Error ? err : new Error(err.message || 'Failed to fetch transactions')
            apiError.status = err.response?.status
            apiError.data = err.response?.data
            setError(apiError)
        },
    })

    const asyncRefetch = async (): Promise<void> => {
        await refetch()
    }

    return {
        transactions,
        isLoading,
        error: error || (queryError as ApiError),
        refetch: asyncRefetch,
    }
}

export default useTransactions
