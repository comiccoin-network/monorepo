// hooks/usePublicWalletDirectory.ts
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import publicWalletDirectoryService, {
  PublicWallet,
  WALLET_STATUS,
  WALLET_TYPE,
} from "../services/iam/PublicWalletDirectoryService";

interface UsePublicWalletDirectoryReturn {
  fetchWalletByAddress: (address: string) => Promise<PublicWallet | null>;
  searchWallets: (
    searchTerm: string,
    limit?: number,
  ) => Promise<PublicWallet[]>;
  trackWalletView: (address: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
  success: boolean;
  reset: () => void;
  WALLET_STATUS: typeof WALLET_STATUS;
  WALLET_TYPE: typeof WALLET_TYPE;
}

interface UsePublicWalletDirectoryListReturn {
  wallets: PublicWallet[];
  pagination: {
    hasMore: boolean;
    lastId: string | null;
    lastCreatedAt: number | null;
    total: number;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseSinglePublicWalletReturn {
  wallet: PublicWallet | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for accessing public wallet directory data
 */
export function usePublicWalletDirectory(): UsePublicWalletDirectoryReturn {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setSuccess(false);
  }, []);

  /**
   * Fetch a public wallet from directory by Ethereum address
   */
  const fetchWalletByAddress = useCallback(
    async (address: string): Promise<PublicWallet | null> => {
      reset();
      setIsLoading(true);

      try {
        if (__DEV__) {
          console.log("🔄 Fetching public wallet from directory:", address);
        }

        const wallet =
          await publicWalletDirectoryService.getPublicWalletFromDirectoryByAddress(
            address,
          );
        setSuccess(true);
        return wallet;
      } catch (err) {
        if (__DEV__) {
          console.error("❌ Error fetching wallet from directory:", err);
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch wallet from directory";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Search for wallets in directory
   */
  const searchWallets = useCallback(
    async (searchTerm: string, limit: number = 20): Promise<PublicWallet[]> => {
      reset();
      setIsLoading(true);

      try {
        if (__DEV__) {
          console.log("🔄 Searching public wallets in directory:", searchTerm);
        }

        const wallets =
          await publicWalletDirectoryService.searchPublicWalletsFromDirectory(
            searchTerm,
            limit,
          );
        setSuccess(true);
        return wallets;
      } catch (err) {
        if (__DEV__) {
          console.error("❌ Error searching wallets in directory:", err);
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to search wallets in directory";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Track a wallet view in the directory
   */
  const trackWalletView = useCallback(
    async (address: string): Promise<boolean> => {
      try {
        return await publicWalletDirectoryService.trackWalletViewInDirectory(
          address,
        );
      } catch (err) {
        if (__DEV__) {
          console.error("❌ Error tracking wallet view:", err);
        }
        return false;
      }
    },
    [],
  );

  return {
    fetchWalletByAddress,
    searchWallets,
    trackWalletView,
    isLoading,
    error,
    success,
    reset,
    WALLET_STATUS,
    WALLET_TYPE,
  };
}

/**
 * Custom hook for listing public wallets from directory
 */
export function usePublicWalletDirectoryList(
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
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  } = {},
): UsePublicWalletDirectoryListReturn {
  const queryClient = useQueryClient();

  const [error, setError] = useState<Error | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["publicWalletsDirectory", filters],
    queryFn: async () => {
      try {
        return await publicWalletDirectoryService.listPublicWalletsFromDirectory(
          filters,
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to list wallets from directory";
        setError(new Error(errorMessage));
        throw err;
      }
    },
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes default
    cacheTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes default
  });

  // Extract wallets and pagination data
  const wallets = data?.public_wallets || [];

  const pagination = {
    hasMore: data?.has_more || false,
    lastId: data?.last_id || null,
    lastCreatedAt: data?.last_created_at || null,
    total: data?.total || 0,
  };

  const refetch = async () => {
    await queryClient.invalidateQueries(["publicWalletsDirectory", filters]);
  };

  return {
    wallets,
    pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Custom hook for fetching a single wallet from directory by address
 */
// hooks/usePublicWalletDirectory.ts
export function useSinglePublicWalletFromDirectory(
  address: string | undefined | null,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    retryLimit?: number;
  } = {},
): UseSinglePublicWalletReturn {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Add a state to force refetching
  const [forceRefetch, setForceRefetch] = useState(0);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["publicWalletDirectory", address, forceRefetch], // Add forceRefetch to key
    queryFn: async () => {
      if (!address) return null;

      try {
        // Add a cache-busting parameter
        return await publicWalletDirectoryService.getPublicWalletFromDirectoryByAddress(
          address,
          { bypassCache: true },
        );
      } catch (err) {
        console.log("Failed to fetch wallet directory data:", err);
        return null;
      }
    },
    enabled: !!address && options.enabled !== false,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache at all
    retry: options.retryLimit || 1,
  });

  const refetch = async () => {
    if (address) {
      // Force a refetch by incrementing state
      setForceRefetch((prev) => prev + 1);
      // Also invalidate any existing queries
      await queryClient.invalidateQueries(["publicWalletDirectory", address]);
    }
  };

  return {
    wallet,
    isLoading,
    error,
    refetch,
  };
}

// Export constants and hook defaults
export { WALLET_STATUS, WALLET_TYPE };

export default {
  usePublicWalletDirectory,
  usePublicWalletDirectoryList,
  useSinglePublicWalletFromDirectory,
  WALLET_STATUS,
  WALLET_TYPE,
};
