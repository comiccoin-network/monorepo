import { useState, useEffect, useCallback, useRef } from 'react'
import dashboardService, { DashboardDTO } from '../services/dashboardService'

interface ApiError extends Error {
    status?: number
    data?: any
}

interface UseDashboardOptions {
    enabled?: boolean
    refreshInterval?: number
    cacheMaxAge?: number // In milliseconds
}

interface UseDashboardReturn {
    dashboard: DashboardDTO | null
    isLoading: boolean
    error: ApiError | null
    refetch: () => Promise<DashboardDTO | null>
    clearCache: () => void
}

export function useDashboard({
    enabled = true,
    refreshInterval = 0,
    cacheMaxAge = 60000,
}: UseDashboardOptions = {}): UseDashboardReturn {
    const [dashboard, setDashboard] = useState<DashboardDTO | null>(null)
    const [isLoading, setIsLoading] = useState(enabled)
    const [error, setError] = useState<ApiError | null>(null)
    const isMountedRef = useRef(true)
    const lastFetchTimeRef = useRef(0)

    const fetchDashboardData = useCallback(async (): Promise<DashboardDTO | null> => {
        setIsLoading(true)
        setError(null)

        if (!enabled || !isMountedRef.current) {
            return dashboard
        }

        try {
            const cachedData = dashboardService.getCachedDashboard(cacheMaxAge)
            if (cachedData && Date.now() - lastFetchTimeRef.current < cacheMaxAge) {
                setDashboard(cachedData)
                setIsLoading(false)
                return cachedData
            }

            const data = await dashboardService.getDashboard()
            if (isMountedRef.current) {
                setDashboard(data)
                lastFetchTimeRef.current = Date.now()
            }
            return data
        } catch (err: any) {
            const apiError: ApiError =
                err instanceof Error ? err : new ApiError(err.message || 'Failed to fetch dashboard data')
            apiError.status = err.status
            apiError.data = err.data
            if (isMountedRef.current) {
                setError(apiError)
                console.error('❌ DASHBOARD: Fetch failed', apiError)
            }
            return null
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
        }
    }, [enabled, cacheMaxAge])

    const clearCache = useCallback(() => {
        dashboardService.clearCache()
        if (isMountedRef.current) {
            setDashboard(null)
            fetchDashboardData()
        }
    }, [fetchDashboardData])

    useEffect(() => {
        isMountedRef.current = true
        if (enabled) {
            fetchDashboardData()
        }
        return () => {
            isMountedRef.current = false
        }
    }, [enabled, fetchDashboardData])

    useEffect(() => {
        if (!enabled || refreshInterval <= 0) return

        const intervalId = setInterval(() => {
            if (enabled && isMountedRef.current) {
                fetchDashboardData()
            }
        }, refreshInterval)

        return () => clearInterval(intervalId)
    }, [enabled, refreshInterval, fetchDashboardData])

    return { dashboard, isLoading, error, refetch: fetchDashboardData, clearCache }
}

export default useDashboard
