import { AxiosInstance } from 'axios'
import getCustomAxios from '../helpers/customAxios'

// Define the response type for the connect wallet endpoint
interface ConnectWalletResponse {
    success: boolean
    wallet_address: string
}

/**
 * Service responsible for wallet-related operations
 * Uses the custom Axios instance with token refresh capability
 */
class WalletService {
    // Define private property with correct type
    private readonly api: AxiosInstance

    constructor() {
        // Get the custom axios instance with token refresh interceptors
        this.api = getCustomAxios(() => {
            // This callback will be executed if both access and refresh tokens expire
            // You could redirect to login or dispatch a logout action here
            console.log('🔒 WALLET SERVICE: Authentication expired, user needs to login again')
            // Example: Navigate to login page
            // window.location.href = '/login';
        })
    }

    /**
     * Connect a wallet address to the user's account
     * @param walletAddress - The wallet address to connect
     * @returns Promise resolving to a boolean indicating success
     */
    public async connectWallet(walletAddress: string): Promise<boolean> {
        try {
            // Log with privacy-preserving partial display of the address
            console.log('🔄 WALLET SERVICE: Starting wallet connection process', {
                walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            })

            // Make the API call with typed response
            const response = await this.api.post<ConnectWalletResponse>('/me/connect-wallet', {
                wallet_address: walletAddress,
            })

            // Verify the response contains the expected wallet address
            const lowercaseWalletAddress = walletAddress.toLowerCase()
            if (response.data.wallet_address === lowercaseWalletAddress) {
                console.log('✅ WALLET SERVICE: Wallet connection successful')
                return true
            } else {
                console.warn('⚠️ WALLET SERVICE: Unexpected response from server', response.data)
                return false
            }
        } catch (error: any) {
            // Enhanced error logging with more details
            console.error('❌ WALLET SERVICE: Failed to connect wallet', {
                error: error?.message || 'Unknown error',
                status: error?.status,
                details: error?.data,
            })

            // Re-throw the error so the caller can handle it
            throw error
        }
    }
}

// Export as singleton
export const walletService = new WalletService()
export default walletService
