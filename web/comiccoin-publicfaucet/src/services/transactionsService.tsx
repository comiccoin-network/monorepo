// src/services/transactionsService.ts
import authService from './authService';

// Define Transaction interface based on actual data structure
export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
}

class TransactionsService {
  private cacheTTL = 60000; // 1 minute cache validity
  private cacheKey = 'transactions_cache';
  private lastFetchTime = 0;
  private api;

  constructor() {
    // Get the pre-configured axios instance with auth interceptors
    this.api = authService.getAuthenticatedApi();
  }

  /**
   * Fetches transactions from the API
   * @param force - Whether to force a fresh fetch bypassing throttling and cache
   * @returns Promise resolving to array of transactions
   */
  public async getTransactions(force = false): Promise<Transaction[]> {
    // Throttle fetches to prevent too many in short succession
    const now = Date.now();
    const timeSinceLastFetch = now - this.lastFetchTime;

    if (!force && timeSinceLastFetch < 2000 && this.lastFetchTime !== 0) {
      console.log("🚫 TRANSACTIONS SERVICE: Throttled (too frequent)");

      // Return cached data if available
      const cachedData = this.getCachedTransactions();
      if (cachedData) {
        return cachedData;
      }
    }

    // Update last fetch time
    this.lastFetchTime = now;

    try {
      console.log("📡 TRANSACTIONS SERVICE: Calling API");

      // Make the API request using the authenticated axios instance
      const response = await this.api.get('/publicfaucet/api/v1/transactions');

      // Ensure response data is an array
      const validTransactions: Transaction[] = Array.isArray(response.data)
        ? response.data
        : [];

      console.log("✅ TRANSACTIONS SERVICE: Success", {
        count: validTransactions.length,
      });

      // Cache the transactions
      this.cacheTransactions(validTransactions);

      return validTransactions;
    } catch (err) {
      console.log("❌ TRANSACTIONS SERVICE: Failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      throw err instanceof Error
        ? err
        : new Error("Failed to fetch transactions");
    }
  }

  /**
   * Saves transactions to local cache
   * @param transactions - Array of transactions to cache
   */
  private cacheTransactions(transactions: Transaction[]): void {
    try {
      const cacheData = {
        data: transactions,
        timestamp: Date.now()
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log("💾 TRANSACTIONS SERVICE: Cached transactions");
    } catch (err) {
      console.warn("⚠️ TRANSACTIONS SERVICE: Error caching data", err);
    }
  }

  /**
   * Retrieves cached transactions if available and not expired
   * @returns Array of transactions or null if cache is invalid/expired
   */
  public getCachedTransactions(): Transaction[] | null {
    try {
      const cachedJson = localStorage.getItem(this.cacheKey);
      if (!cachedJson) {
        return null;
      }

      const cached = JSON.parse(cachedJson);
      const cachedTime = cached.timestamp;
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedTime > this.cacheTTL) {
        console.log("⏰ TRANSACTIONS SERVICE: Cached data expired");
        return null;
      }

      console.log("📋 TRANSACTIONS SERVICE: Using cached transactions data");
      return cached.data;
    } catch (err) {
      console.warn("⚠️ TRANSACTIONS SERVICE: Error reading cached data", err);
      return null;
    }
  }

  /**
   * Clear transactions cache
   */
  public clearCache(): void {
    localStorage.removeItem(this.cacheKey);
    console.log("🧹 TRANSACTIONS SERVICE: Cleared transactions cache");
  }
}

// Export as singleton
export const transactionsService = new TransactionsService();
export default transactionsService;
