import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dashboardService, { DashboardDTO } from '../services/dashboardService'

interface ApiError extends Error {
    status?: number
    data?: any
}

interface UseDashboardOptions {
    enabled?: boolean
    refreshInterval?: number
}

interface UseDashboardReturn {
    dashboard: DashboardDTO | null
    isLoading: boolean
    error: ApiError | null
    refetch: () => void
    clearCache: () => void
}

export function useDashboard({ enabled = true, refreshInterval = 0 }: UseDashboardOptions = {}): UseDashboardReturn {
    const queryClient = useQueryClient()
    const [error, setError] = useState<ApiError | null>(null)

    const {
        data: dashboard,
        isLoading,
        refetch,
        error: queryError,
    } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardService.getDashboard(),
        enabled: enabled,
        staleTime: refreshInterval, //Data is considered stale after this time (ms)
        cacheTime: 5 * 60 * 1000, //Keep data in cache for 5 minutes
        refetchInterval: refreshInterval > 0 ? refreshInterval : false, // Only refetch if refreshInterval is set
        onError: (err: any) => {
            const apiError: ApiError =
                err instanceof Error ? err : new ApiError(err.message || 'Failed to fetch dashboard data')
            apiError.status = err.response?.status
            apiError.data = err.response?.data
            setError(apiError)
        },
    })

    const clearCache = useCallback(() => {
        queryClient.invalidateQueries(['dashboard']) //Invalidate cache
    }, [queryClient])

    return { dashboard, isLoading, error: error || queryError, refetch, clearCache }
}

export default useDashboard
