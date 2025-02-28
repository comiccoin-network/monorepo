// monorepo/web/comiccoin-publicfaucet/src/services/claimCoinsService.ts
import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'
import { getAccessTokenFromLocalStorage } from '../helpers/jwtUtility'
import { User } from '../types'

/**
 * Service for claiming coins through the API
 * Uses custom Axios instance with token refresh capabilities
 */
class ClaimCoinsService {
    private readonly api: AxiosInstance

    constructor() {
        // Use our custom Axios instance with token refresh capability
        this.api = getCustomAxios(() => {
            // This callback will be executed if both access and refresh tokens expire
            console.log('🔒 CLAIM COINS SERVICE: Authentication expired, user needs to login again')
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
     * Claims coins for the authenticated user
     * @returns The updated user data after claiming coins
     * @throws Error if the API request fails
     */
    public async claimCoins(): Promise<User> {
        try {
            console.log('🪙 CLAIMING COINS: Starting claim process')

            // Make the API request using our custom Axios instance
            // Token refresh will happen automatically if needed
            const response = await this.api.post<User>('/claim-coins')

            console.log('✅ CLAIMING COINS: Successfully claimed coins')
            return response.data
        } catch (error: any) {
            console.error('❌ CLAIMING COINS: Failed to claim coins', {
                error: error?.message || 'Unknown error',
                status: error?.status,
                details: error?.data,
            })

            // Create a more informative error object
            let errorMessage = 'Failed to claim coins'

            // Add more specific error messages based on status codes
            if (error?.status === 429) {
                errorMessage = 'Rate limit exceeded. Please try again later.'
            } else if (error?.status === 409) {
                errorMessage = "You've already claimed coins recently. Please wait for the cooldown period."
            } else if (error?.message) {
                errorMessage = error.message
            }

            throw new Error(errorMessage)
        }
    }
}

// Export as singleton
export const claimCoinsService = new ClaimCoinsService()
export default claimCoinsService
