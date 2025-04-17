// services/iam/PublicWalletDirectoryService.ts
import config from "../../config";

// Define appropriate TypeScript interfaces
export interface PublicWallet {
  id: string;
  address: string;
  name: string;
  type: number;
  status: number;
  createdAt: number;
  isVerified: boolean;
  location?: string;
  description?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
  // Add other fields as needed
}

// Match the status constants from web
export const WALLET_STATUS = {
  ACTIVE: 1,
  ARCHIVED: 2,
  LOCKED: 3,
};

// Match the type constants from web
export const WALLET_TYPE = {
  INDIVIDUAL: 3,
  COMPANY: 2,
};

// Transform the API response to our PublicWallet interface
export const transformPublicWallet = (data: any): PublicWallet => {
  return {
    id: data.id || "",
    address: data.address || "",
    name: data.name || "",
    type: data.type || WALLET_TYPE.INDIVIDUAL,
    status: data.status || WALLET_STATUS.ACTIVE,
    createdAt: data.created_at || 0,
    isVerified: data.is_verified || false,
    location: data.location,
    description: data.description,
    avatarUrl: data.avatar_url,
    socialLinks: data.social_links || {},
  };
};

class PublicWalletDirectoryService {
  private readonly BASE_URL: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor() {
    this.BASE_URL = config.IAM_API_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    if (__DEV__) {
      console.log(
        "🚀 PublicWalletDirectoryService initialized with URL:",
        this.BASE_URL,
      );
    }
  }

  /**
   * Fetch a public wallet from directory by its Ethereum address
   */
  async getPublicWalletFromDirectoryByAddress(
    address: string,
    options: { bypassCache?: boolean } = {},
  ): Promise<PublicWallet | null> {
    try {
      if (__DEV__) {
        console.log(`📞 Fetching public wallet for address: ${address}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Add cache-busting parameter if bypassCache is true
      const cacheBuster = options.bypassCache ? `?cache=${Date.now()}` : "";

      const response = await fetch(
        `${this.BASE_URL}/iam/api/v1/public-wallets-directory/${address}${cacheBuster}`,
        {
          method: "GET",
          headers: this.defaultHeaders,
          signal: controller.signal,
          // Disable cache at the browser level too
          cache: options.bypassCache ? "no-cache" : "default",
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (__DEV__) {
          console.log(
            `❌ API error (${response.status}): ${response.statusText}`,
          );
        }
        return null;
      }

      const data = await response.json();

      if (!data.public_wallet) {
        return null;
      }

      // Make sure we correctly parse the is_verified field
      const walletData = data.public_wallet;

      // Log the exact value we receive to debug
      if (__DEV__) {
        console.log("🔍 Wallet verification status:", {
          raw: walletData.is_verified,
          typeOf: typeof walletData.is_verified,
          stringified: JSON.stringify(walletData.is_verified),
        });
      }

      // Explicitly transform the wallet, converting is_verified to boolean
      return {
        id: walletData.id || "",
        address: walletData.address || "",
        name: walletData.name || walletData.display_name || "",
        type: walletData.type || WALLET_TYPE.INDIVIDUAL,
        status: walletData.status || WALLET_STATUS.ACTIVE,
        createdAt: walletData.created_at || 0,
        isVerified:
          walletData.is_verified === true ||
          walletData.is_verified === "true" ||
          walletData.is_verified === 1,
        location: walletData.location,
        description: walletData.description,
        avatarUrl: walletData.avatar_url,
        socialLinks: walletData.social_links || {},
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Error fetching public wallet:", error);
      }
      return null;
    }
  }

  /**
   * List public wallets from directory
   */
  async listPublicWalletsFromDirectory(
    filters: {
      createdByUserId?: string;
      createdAtStart?: number;
      createdAtEnd?: number;
      value?: string;
      lastId?: string;
      lastCreatedAt?: number;
      limit?: number;
      type?: number;
      isVerified?: boolean;
      location?: string;
      status?: number;
      activeOnly?: boolean;
    } = {},
  ): Promise<{
    public_wallets: PublicWallet[];
    has_more: boolean;
    last_id: string | null;
    last_created_at: number | null;
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      if (filters.createdByUserId)
        queryParams.append("created_by_user_id", filters.createdByUserId);
      if (filters.createdAtStart)
        queryParams.append("created_at_start", String(filters.createdAtStart));
      if (filters.createdAtEnd)
        queryParams.append("created_at_end", String(filters.createdAtEnd));
      if (filters.value) queryParams.append("value", filters.value);
      if (filters.lastId) queryParams.append("last_id", filters.lastId);
      if (filters.lastCreatedAt)
        queryParams.append("last_created_at", String(filters.lastCreatedAt));
      if (filters.limit) queryParams.append("limit", String(filters.limit));

      // New filters
      if (filters.type !== undefined)
        queryParams.append("type", String(filters.type));
      if (filters.isVerified !== undefined)
        queryParams.append("is_verified", String(filters.isVerified));
      if (filters.location) queryParams.append("location", filters.location);

      // For public endpoints, we may want to filter out non-active wallets by default
      if (filters.activeOnly && !filters.status)
        queryParams.append("status", String(WALLET_STATUS.ACTIVE));
      else if (filters.status)
        queryParams.append("status", String(filters.status));

      const queryString = queryParams.toString();
      const url = `${this.BASE_URL}/iam/api/v1/public-wallets-directory${queryString ? `?${queryString}` : ""}`;

      if (__DEV__) {
        console.log(`📞 Listing public wallets with URL: ${url}`);
      }

      const response = await fetch(url, {
        method: "GET",
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Failed to list wallets (${response.status})`,
        );
      }

      const data = await response.json();

      // Transform the wallets
      return {
        public_wallets: (data.public_wallets || []).map(transformPublicWallet),
        has_more: data.has_more || false,
        last_id: data.last_id || null,
        last_created_at: data.last_created_at || null,
        total: data.total || 0,
      };
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Error listing public wallets:", error);
      }
      throw error;
    }
  }

  /**
   * Search public wallets in directory
   */
  async searchPublicWalletsFromDirectory(
    searchTerm: string,
    limit: number = 20,
  ): Promise<PublicWallet[]> {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("value", searchTerm);
      if (limit) params.append("limit", String(limit));
      params.append("status", String(WALLET_STATUS.ACTIVE));

      if (__DEV__) {
        console.log(`🔍 Searching public wallets with term: ${searchTerm}`);
      }

      const response = await fetch(
        `${this.BASE_URL}/iam/api/v1/public-wallets-directory?${params.toString()}`,
        {
          method: "GET",
          headers: this.defaultHeaders,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Failed to search wallets (${response.status})`,
        );
      }

      const data = await response.json();

      return (data.public_wallets || []).map(transformPublicWallet);
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Error searching public wallets:", error);
      }
      throw error;
    }
  }

  /**
   * Track a wallet view in the directory
   */
  async trackWalletViewInDirectory(address: string): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log(`👁️ Tracking view for wallet: ${address}`);
      }

      const response = await fetch(
        `${this.BASE_URL}/iam/api/v1/public-wallets-directory/${address}/view`,
        {
          method: "POST",
          headers: this.defaultHeaders,
        },
      );

      return response.ok;
    } catch (error) {
      if (__DEV__) {
        console.log("❌ Error tracking wallet view:", error);
      }
      return false;
    }
  }
}

// Create and export a singleton instance
const publicWalletDirectoryService = new PublicWalletDirectoryService();
export default publicWalletDirectoryService;
