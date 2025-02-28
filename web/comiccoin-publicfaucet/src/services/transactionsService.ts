// monorepo/web/comiccoin-publicfaucet/src/services/transactionsService.ts
import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'
import { getAccessTokenFromLocalStorage } from '../helpers/jwtUtility'

// Define Transaction interface based on actual data structure
export interface Transaction {
    id: string
    timestamp: string
    amount: number
    // Add any other fields your transactions have
}

interface CachedTransactions {
    data: Transaction[]
    timestamp: number
}

class TransactionsService {
    private cacheTTL = 60000 // 1 minute cache validity
    private cacheKey = 'transactions_cache'
    private lastFetchTime = 0
    private readonly api: AxiosInstance

    constructor() {
        // Get the custom axios instance with token refresh capability
        this.api = getCustomAxios(() => {
            // This callback will be executed if both access and refresh tokens expire
            console.log('🔒 TRANSACTIONS SERVICE: Authentication expired, user needs to login again')
            // You could redirect to login page or dispatch a logout action here
            window.location.href = '/login'
        })
    }

    /**
     * Check if the user is currently authenticated
     * @returns Boolean indicating authentication status
     */
    public isAuthenticated(): boolean {
        const token = getAccessTokenFromLocalStorage()
        return !!token
    }

    /**
     * Fetches transactions from the API
     * @param force - Whether to force a fresh fetch bypassing throttling and cache
     * @returns Promise resolving to array of transactions
     */
    public async getTransactions(force = false): Promise<Transaction[]> {
        // Throttle fetches to prevent too many in short succession
        const now = Date.now()
        const timeSinceLastFetch = now - this.lastFetchTime

        if (!force && timeSinceLastFetch < 2000 && this.lastFetchTime !== 0) {
            console.log('🚫 TRANSACTIONS SERVICE: Throttled (too frequent)')

            // Return cached data if available
            const cachedData = this.getCachedTransactions()
            if (cachedData) {
                return cachedData
            }
        }

        // Update last fetch time
        this.lastFetchTime = now

        try {
            console.log('📡 TRANSACTIONS SERVICE: Calling API')

            // Make the API request using our custom axios instance
            // Token refresh will happen automatically if needed
            const response = await this.api.get<Transaction[]>('/transactions')

            // Ensure response data is an array
            const validTransactions: Transaction[] = Array.isArray(response.data) ? response.data : []

            console.log('✅ TRANSACTIONS SERVICE: Success', {
                count: validTransactions.length,
            })

            // Cache the transactions
            this.cacheTransactions(validTransactions)

            return validTransactions
        } catch (error: any) {
            console.error('❌ TRANSACTIONS SERVICE: Failed', {
                error: error?.message || 'Unknown error',
                status: error?.status,
                details: error?.data,
            })

            throw error instanceof Error ? error : new Error(error?.message || 'Failed to fetch transactions')
        }
    }

    /**
     * Saves transactions to local cache
     * @param transactions - Array of transactions to cache
     */
    private cacheTransactions(transactions: Transaction[]): void {
        try {
            const cacheData: CachedTransactions = {
                data: transactions,
                timestamp: Date.now(),
            }

            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
            console.log('💾 TRANSACTIONS SERVICE: Cached transactions')
        } catch (err) {
            console.warn('⚠️ TRANSACTIONS SERVICE: Error caching data', err)
        }
    }

    /**
     * Retrieves cached transactions if available and not expired
     * @returns Array of transactions or null if cache is invalid/expired
     */
    public getCachedTransactions(): Transaction[] | null {
        try {
            const cachedJson = localStorage.getItem(this.cacheKey)
            if (!cachedJson) {
                return null
            }

            const cached = JSON.parse(cachedJson) as CachedTransactions
            const cachedTime = cached.timestamp
            const now = Date.now()

            // Check if cache is expired
            if (now - cachedTime > this.cacheTTL) {
                console.log('⏰ TRANSACTIONS SERVICE: Cached data expired')
                return null
            }

            console.log('📋 TRANSACTIONS SERVICE: Using cached transactions data')
            return cached.data
        } catch (err) {
            console.warn('⚠️ TRANSACTIONS SERVICE: Error reading cached data', err)
            return null
        }
    }

    /**
     * Clear transactions cache
     */
    public clearCache(): void {
        localStorage.removeItem(this.cacheKey)
        console.log('🧹 TRANSACTIONS SERVICE: Cleared transactions cache')
    }

    /**
     * Set the cache time-to-live in milliseconds
     * @param milliseconds - New TTL in milliseconds
     */
    public setCacheTTL(milliseconds: number): void {
        if (milliseconds >= 0) {
            this.cacheTTL = milliseconds
            console.log(`🔄 TRANSACTIONS SERVICE: Cache TTL set to ${milliseconds}ms`)
        }
    }
}

// Export as singleton
export const transactionsService = new TransactionsService()
export default transactionsService
