import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'
import { getAccessTokenFromLocalStorage } from '../helpers/jwtUtility'

// User model based on API response
export interface User {
    federatedidentity_id: string
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    lexical_name: string
    phone?: string
    country?: string
    timezone: string
    wallet_address: string | null
}

/**
 * Service for fetching the current user's profile data
 * Uses custom Axios with token refresh capabilities
 */
class GetMeService {
    private readonly api: AxiosInstance
    private readonly cacheKey = 'current_user_cache'
    private readonly cacheTTL = 300000 // 5 minutes cache TTL

    constructor() {
        // Use our custom Axios instance with token refresh capability
        this.api = getCustomAxios(() => {
            // This callback will be executed if both access and refresh tokens expire
            console.log('🔒 GET ME SERVICE: Authentication expired, user needs to login again')
            // Redirect to login page
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
     * Fetch the current user's profile from the API
     * @returns Promise resolving to User data
     */
    public async getMe(): Promise<User> {
        try {
            console.log('👤 GET ME SERVICE: Fetching user profile')

            // Check if we can use cached data
            const cachedUser = this.getCachedUser()
            if (cachedUser) {
                console.log('📋 GET ME SERVICE: Using cached user data')
                return cachedUser
            }

            // UPDATED: Use the correct API endpoint path
            const endpoint = '/me'
            console.log(`📡 GET ME SERVICE: Calling API endpoint: ${endpoint}`)

            // Make the API request using our custom Axios
            const response = await this.api.get<User>(endpoint)

            console.log('✅ GET ME SERVICE: Successfully fetched user profile', {
                email: response.data.email,
                hasWallet: !!response.data.wallet_address,
            })

            // Cache the user data
            this.cacheUserData(response.data)

            return response.data
        } catch (error: any) {
            // Enhanced error logging
            console.error('❌ GET ME SERVICE: Failed to fetch user profile', {
                error: error?.message || 'Unknown error',
                status: error?.status || error?.response?.status,
                details: error?.data || error?.response?.data,
                endpoint: '/me',
            })

            throw error instanceof Error ? error : new Error(error?.message || 'Failed to fetch user profile')
        }
    }

    /**
     * Save user data to local storage cache
     * @param userData - The user data to cache
     */
    private cacheUserData(userData: User): void {
        try {
            const cacheData = {
                data: userData,
                timestamp: Date.now(),
            }
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData))
            console.log('💾 GET ME SERVICE: Cached user data')
        } catch (err) {
            console.warn('⚠️ GET ME SERVICE: Error caching user data', err)
        }
    }

    /**
     * Get cached user data if available and not expired
     * @returns User data or null if cache is invalid/expired
     */
    private getCachedUser(): User | null {
        try {
            const cachedJson = localStorage.getItem(this.cacheKey)
            if (!cachedJson) {
                return null
            }

            const cached = JSON.parse(cachedJson)
            const cachedTime = cached.timestamp
            const now = Date.now()

            // Check if cache is expired
            if (now - cachedTime > this.cacheTTL) {
                console.log('⏰ GET ME SERVICE: Cached user data expired')
                return null
            }

            return cached.data
        } catch (err) {
            console.warn('⚠️ GET ME SERVICE: Error reading cached data', err)
            return null
        }
    }

    /**
     * Clear user cache
     */
    public clearCache(): void {
        localStorage.removeItem(this.cacheKey)
        console.log('🧹 GET ME SERVICE: Cleared user cache')
    }
}

// Export as singleton
export const getMeService = new GetMeService()
export default getMeService
