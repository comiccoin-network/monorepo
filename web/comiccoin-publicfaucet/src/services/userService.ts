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
    wallet_address: string | null // This is a string, not an object
}

// Interface for update user requests
export interface UpdateUserRequest {
    federatedidentity_id?: string
    id?: string
    email: string
    first_name: string
    last_name: string
    phone?: string | null
    country?: string | null
    timezone: string
    wallet_address?: string
    [key: string]: string | null | undefined // For flexible property access
}

class UserService {
    private readonly api: AxiosInstance

    constructor() {
        // Use our custom Axios instance with token refresh capability
        this.api = getCustomAxios(() => {
            // This callback will be executed if both access and refresh tokens expire
            console.log('🔒 USER SERVICE: Authentication expired, user needs to login again')
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
     * Fetch the current user's profile
     * @param shouldSyncNow - Whether to force a sync with the identity provider
     * @returns Promise resolving to the user data
     */
    public async getMe(shouldSyncNow: boolean = false): Promise<User> {
        try {
            console.log('👤 USER SERVICE: Fetching profile', {
                shouldSyncNow,
            })

            // Build query params for the request
            const params = new URLSearchParams()
            if (shouldSyncNow) {
                params.append('should_sync_now', 'true')
            }

            // Make the API request using our custom Axios instance
            const response = await this.api.get<User>(
                `/publicfaucet/api/v1/me${shouldSyncNow ? `?${params.toString()}` : ''}`
            )

            console.log('✅ USER SERVICE: Profile fetch successful', {
                email: response.data.email,
                hasWallet: !!response.data.wallet_address,
            })

            return response.data
        } catch (error: any) {
            console.error('❌ USER SERVICE: Failed to fetch profile', {
                error: error?.message || 'Unknown error',
                status: error?.status,
                details: error?.data,
            })
            throw error
        }
    }

    /**
     * Update user's profile information
     * @param userData - Object containing user data to update
     * @returns Promise resolving to the updated user data
     */
    public async updateUser(userData: UpdateUserRequest): Promise<User> {
        try {
            console.log('👤 USER SERVICE: Updating user profile')

            const response = await this.api.put<User>('/publicfaucet/api/v1/me', userData)

            console.log('✅ USER SERVICE: Profile updated successfully')
            return response.data
        } catch (error: any) {
            console.error('❌ USER SERVICE: Failed to update profile', {
                error: error?.message || 'Unknown error',
                status: error?.status,
                details: error?.data,
            })
            throw error
        }
    }

    /**
     * Update user's wallet address
     * @param walletAddress - The wallet address to set
     * @returns Promise resolving to the updated user data
     */
    public async updateWalletAddress(walletAddress: string): Promise<User> {
        try {
            console.log('💼 USER SERVICE: Updating wallet address')

            const response = await this.api.patch<User>('/publicfaucet/api/v1/me', {
                wallet_address: walletAddress,
            })

            console.log('✅ USER SERVICE: Wallet address updated successfully')
            return response.data
        } catch (error: any) {
            console.error('❌ USER SERVICE: Failed to update wallet address', {
                error: error?.message || 'Unknown error',
                status: error?.status,
                details: error?.data,
            })
            throw error
        }
    }
}

// Export as singleton
export const userService = new UserService()
export default userService
