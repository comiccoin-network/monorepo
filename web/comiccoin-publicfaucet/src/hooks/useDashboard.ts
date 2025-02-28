import { useState, useEffect, useCallback, useRef } from 'react'
import dashboardService, { DashboardDTO } from '../services/dashboardService'

interface UseDashboardOptions {
    enabled?: boolean
    refreshInterval?: number
    cacheMaxAge?: number // In milliseconds
}

interface UseDashboardReturn {
    dashboard: DashboardDTO | null
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<DashboardDTO | null>
    clearCache: () => void
}

/**
 * Custom hook for fetching and managing dashboard data with caching and auto-refresh
 * @param options - Configuration options
 * @returns Object containing dashboard data, loading/error states, and utility functions
 */
export function useDashboard({
    enabled = true,
    refreshInterval = 0, // No refresh by default
    cacheMaxAge = 60000, // Default: 1 minute cache
}: UseDashboardOptions = {}): UseDashboardReturn {
    const [dashboard, setDashboard] = useState<DashboardDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Use refs to track component mount state and prevent race conditions
    const isMountedRef = useRef(true)
    const isFetchingRef = useRef(false)
    const initialFetchDoneRef = useRef(false)

    // Store current dashboard in ref to access in callback without dependency
    const dashboardRef = useRef<DashboardDTO | null>(null)

    // Store options in refs to access latest values in callbacks
    const enabledRef = useRef(enabled)
    const refreshIntervalRef = useRef(refreshInterval)
    const cacheMaxAgeRef = useRef(cacheMaxAge)

    // Update refs when options change
    useEffect(() => {
        enabledRef.current = enabled
        refreshIntervalRef.current = refreshInterval
        cacheMaxAgeRef.current = cacheMaxAge
    }, [enabled, refreshInterval, cacheMaxAge])

    // Update dashboard ref when dashboard state changes
    useEffect(() => {
        dashboardRef.current = dashboard
    }, [dashboard])

    /**
     * Fetch dashboard data from API with error handling
     * IMPORTANT: This doesn't depend on dashboard state to avoid infinite loops
     */
    const fetchDashboardData = useCallback(async (): Promise<DashboardDTO | null> => {
        // Skip if already fetching or component unmounted
        if (isFetchingRef.current || !isMountedRef.current || !enabledRef.current) {
            console.log('🚫 DASHBOARD: Fetch skipped - already in progress, disabled, or component unmounted')
            return dashboardRef.current // Use ref instead of state
        }

        // Check if authenticated
        if (!dashboardService.isAuthenticated()) {
            console.log('🔒 DASHBOARD: Not authenticated, skipping fetch')
            if (isMountedRef.current) {
                setIsLoading(false)
                setError(new Error('Not authenticated'))
            }
            return null
        }

        try {
            console.log('🔄 DASHBOARD: Fetching data')
            isFetchingRef.current = true

            // Only set loading if we don't already have data (to prevent flicker)
            if (!dashboardRef.current && !initialFetchDoneRef.current && isMountedRef.current) {
                setIsLoading(true)
            }

            // Get fresh data from API using our service with custom Axios
            // This will handle token refresh automatically if needed
            const data = await dashboardService.getDashboard()

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setDashboard(data)
                setError(null)
                setIsLoading(false)
                initialFetchDoneRef.current = true
            }

            return data
        } catch (err: any) {
            console.error('❌ DASHBOARD: Fetch failed', err)

            // Improved error handling with more type safety
            const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch dashboard data')

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setError(errorObj)
                setIsLoading(false)
                initialFetchDoneRef.current = true
            }

            return null
        } finally {
            isFetchingRef.current = false
        }
    }, []) // Empty dependency array to prevent recreation

    /**
     * Clear the dashboard cache and fetch fresh data
     */
    const clearCache = useCallback(() => {
        dashboardService.clearCache()
        if (isMountedRef.current) {
            setDashboard(null)
            // Trigger a refetch after clearing cache
            fetchDashboardData()
        }
    }, [fetchDashboardData])

    // Initial load effect - load from cache first, then fetch fresh data
    useEffect(() => {
        // Reset mounted ref
        isMountedRef.current = true
        initialFetchDoneRef.current = false

        if (!enabled) {
            setIsLoading(false)
            return
        }

        // Try to load from cache first for quick initial render
        const cachedData = dashboardService.getCachedDashboard(cacheMaxAge)
        if (cachedData) {
            setDashboard(cachedData)
            setIsLoading(false)
            initialFetchDoneRef.current = true
        }

        // Then fetch fresh data (regardless of cache)
        fetchDashboardData()

        // Cleanup function
        return () => {
            isMountedRef.current = false
        }
    }, [enabled, cacheMaxAge, fetchDashboardData]) // Only run on mount/unmount and option changes

    // Set up refresh interval
    useEffect(() => {
        if (!enabled || refreshInterval <= 0) {
            return
        }

        console.log(`⏱️ DASHBOARD: Setting up refresh interval (${refreshInterval}ms)`)

        const intervalId = setInterval(() => {
            if (enabledRef.current && isMountedRef.current && !isFetchingRef.current) {
                console.log('🔄 DASHBOARD: Auto-refreshing data')
                fetchDashboardData()
            }
        }, refreshInterval)

        return () => {
            clearInterval(intervalId)
        }
    }, [enabled, refreshInterval, fetchDashboardData]) // Only recreate interval when these change

    return {
        dashboard,
        isLoading,
        error,
        refetch: fetchDashboardData,
        clearCache,
    }
}

export default useDashboard
