// src/services/dashboardService.ts
import authService from './authService';

// Type for big.Int values from backend
export type BigIntString = string;

// Type for transaction data
export interface TransactionDTO {
  id: string;
  // ... other transaction fields
}

// Updated to match the Go DashboardDTO structure
export interface DashboardDTO {
  chain_id: number;
  faucet_balance: BigIntString;
  user_balance: BigIntString;
  total_coins_claimed: BigIntString;
  transactions: TransactionDTO[];
  last_modified_at?: string;
  last_claim_time: string; // ISO timestamp
  next_claim_time: string; // ISO timestamp
  can_claim: boolean;
}

// Local storage key for caching dashboard data
const DASHBOARD_CACHE_KEY = 'dashboard_data_cache';

class DashboardService {
  private readonly api;

  constructor() {
    // Get the pre-configured axios instance with auth interceptors
    this.api = authService.getAuthenticatedApi();
  }

  /**
   * Fetch the dashboard data from the API
   * @returns Promise resolving to the dashboard data
   */
  public async getDashboard(): Promise<DashboardDTO> {
    try {
      console.log("📊 DASHBOARD SERVICE: Fetching dashboard data");

      // Make the API request
      const response = await this.api.get<DashboardDTO>('/publicfaucet/api/v1/dashboard');

      console.log("✅ DASHBOARD SERVICE: Dashboard fetch successful", {
        canClaim: response.data.can_claim,
        userBalance: response.data.user_balance,
      });

      // Cache the dashboard data
      this.cacheDashboardData(response.data);

      return response.data;
    } catch (error) {
      console.error("❌ DASHBOARD SERVICE: Failed to fetch dashboard", error);
      throw error;
    }
  }

  /**
   * Save dashboard data to local storage
   * @param data - The dashboard data to cache
   */
  private cacheDashboardData(data: DashboardDTO): void {
    try {
      const cacheData = {
        data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(cacheData));
      console.log("💾 DASHBOARD SERVICE: Cached dashboard data");
    } catch (err) {
      console.warn("⚠️ DASHBOARD SERVICE: Error caching data", err);
    }
  }

  /**
   * Get cached dashboard data if available and not expired
   * @param maxAgeMs - Maximum age of cached data in milliseconds (default: 1 minute)
   * @returns The cached dashboard data or null if not available/expired
   */
  public getCachedDashboard(maxAgeMs: number = 60000): DashboardDTO | null {
    try {
      const cachedJson = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!cachedJson) {
        return null;
      }

      const cached = JSON.parse(cachedJson);
      const cachedTime = new Date(cached.timestamp).getTime();
      const now = new Date().getTime();

      // Check if cache is expired
      if (now - cachedTime > maxAgeMs) {
        console.log("⏰ DASHBOARD SERVICE: Cached data expired");
        return null;
      }

      console.log("📋 DASHBOARD SERVICE: Using cached dashboard data");
      return cached.data;
    } catch (err) {
      console.warn("⚠️ DASHBOARD SERVICE: Error reading cached data", err);
      return null;
    }
  }

  /**
   * Clear dashboard cache
   */
  public clearCache(): void {
    localStorage.removeItem(DASHBOARD_CACHE_KEY);
    console.log("🧹 DASHBOARD SERVICE: Cleared dashboard cache");
  }
}

// Export as singleton
export const dashboardService = new DashboardService();
export default dashboardService;
