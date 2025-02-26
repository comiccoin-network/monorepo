import authService from './authService';

// Define the response type for the connect wallet endpoint
interface ConnectWalletResponse {
  success: boolean;
  wallet_address: string;
}

class WalletService {
  private readonly api;

  constructor() {
    // Get the pre-configured axios instance with auth interceptors
    this.api = authService.getAuthenticatedApi();
  }

  /**
   * Connect a wallet address to the user's account
   * @param walletAddress - The wallet address to connect
   * @returns Promise resolving to a boolean indicating success
   */
  public async connectWallet(walletAddress: string): Promise<boolean> {
    try {
      console.log("🔄 WALLET SERVICE: Starting wallet connection process", {
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      const response = await this.api.post<ConnectWalletResponse>(
        '/publicfaucet/api/v1/me/connect-wallet',
        {
          wallet_address: walletAddress,
        }
      );

      console.log("✅ WALLET SERVICE: Wallet connection successful");
      return true;
    } catch (error) {
      console.error("❌ WALLET SERVICE: Failed to connect wallet", error);
      throw error;
    }
  }
}

// Export as singleton
export const walletService = new WalletService();
export default walletService;
