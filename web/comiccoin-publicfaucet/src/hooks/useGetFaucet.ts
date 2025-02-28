// monorepo/web/comiccoin-publicfaucet/src/hooks/useGetFaucet.ts
import { useState, useEffect, useCallback } from 'react'
import faucetService, { FaucetDTO } from '../services/faucetService'

interface UseFaucetOptions {
    chainId?: number
    refreshInterval?: number
    enabled?: boolean
}

interface UseFaucetReturn {
    faucet: FaucetDTO | null
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

/**
 * Custom hook to manage faucet data fetching and caching
 * @param options - Configuration options for fetching faucet data
 * @returns Faucet data management object
 */
export function useGetFaucet({
    chainId = 1,
    refreshInterval = 60000,
    enabled = true,
}: UseFaucetOptions = {}): UseFaucetReturn {
    const [faucet, setFaucet] = useState<FaucetDTO | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Memoized fetch function to prevent unnecessary recreations
    const fetchFaucetData = useCallback(async () => {
        if (!enabled) return

        try {
            setIsLoading(true)
            setError(null)

            // Pass the numeric chainId here, not a boolean
            const data = await faucetService.getFaucetData(chainId)
            setFaucet(data)
        } catch (err) {
            const processedError = err instanceof Error ? err : new Error('Failed to fetch faucet data')

            setError(processedError)
            setFaucet(null)
        } finally {
            setIsLoading(false)
        }
    }, [enabled, chainId]) // Add chainId to dependencies

    // Initial fetch effect
    useEffect(() => {
        fetchFaucetData()
    }, [fetchFaucetData]) // Include fetchFaucetData in dependency array

    // Periodic refresh effect
    useEffect(() => {
        if (!enabled || !refreshInterval) return

        const intervalId = setInterval(() => {
            fetchFaucetData()
        }, refreshInterval)

        // Cleanup interval on unmount
        return () => clearInterval(intervalId)
    }, [enabled, refreshInterval, fetchFaucetData]) // Include all dependencies

    // Refetch method for manual refresh
    const refetch = useCallback(() => fetchFaucetData(), [fetchFaucetData])

    return {
        faucet,
        isLoading,
        error,
        refetch,
    }
}

export default useGetFaucet
