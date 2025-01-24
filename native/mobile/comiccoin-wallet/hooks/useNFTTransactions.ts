// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransactions.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import transactionListService, {
  Transaction,
} from "../services/transaction/ListService";

// Define the statistics interface for NFT-specific calculations
interface NFTStatistics {
  totalNftCount: number;
  nftTransactionsCount: number;
}

// Define the return type for our hook
interface UseNFTTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  statistics: NFTStatistics;
}

/**
 * A hook for managing NFT transactions for a specific wallet address.
 * This hook handles fetching, filtering, and analyzing NFT transactions.
 *
 * @param walletAddress - The Ethereum address of the wallet to track
 * @returns UseNFTTransactionsReturn - Object containing transactions, loading state, error state, and statistics
 */
export const useNFTTransactions = (
  walletAddress: string | undefined,
): UseNFTTransactionsReturn => {
  // Initialize state with proper typing
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches NFT transactions and processes them to show only currently owned NFTs.
   * This function tracks ownership changes and filters out NFTs that have been transferred away.
   */
  const fetchNFTTransactions = useCallback(async () => {
    // Early return if no wallet address is provided
    if (!walletAddress) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all token type transactions for the wallet
      const txList = await transactionListService.fetchWalletTransactions(
        walletAddress,
        "token",
      );

      // Create a map to track the latest owner of each NFT
      const nftOwnership = new Map<string, string>();

      // Process transactions chronologically to track ownership changes
      const sortedTransactions = [...txList].sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      // Track the current owner of each NFT
      sortedTransactions.forEach((tx) => {
        // Only process transactions with valid tokenId
        if (tx.tokenId) {
          const isBurned =
            tx.to.toLowerCase() ===
            "0x0000000000000000000000000000000000000000";

          // If the NFT is burned, remove it from ownership tracking
          if (isBurned) {
            nftOwnership.delete(tx.tokenId);
          } else {
            // Update the ownership to the new owner
            nftOwnership.set(tx.tokenId, tx.to.toLowerCase());
          }
        }
      });

      // Filter transactions to only include currently owned NFTs
      const filteredTransactions = txList
        .filter((tx) => {
          // Ensure we have a tokenId and it's currently owned by the wallet
          return (
            tx.tokenId &&
            nftOwnership.get(tx.tokenId) === walletAddress.toLowerCase()
          );
        })
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first for display

      setTransactions(filteredTransactions);
    } catch (err) {
      // Handle errors with proper type checking
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching NFT transactions");
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Fetch NFT transactions when the component mounts or wallet changes
  useEffect(() => {
    fetchNFTTransactions();
  }, [fetchNFTTransactions]);

  // Calculate NFT-specific statistics with proper type safety
  const statistics = useMemo((): NFTStatistics => {
    const ownedNfts = new Set<string>();

    // Process transactions chronologically to track current ownership
    const processedTransactions = [...transactions].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    processedTransactions.forEach((tx) => {
      if (
        tx.tokenId && // Ensure tokenId exists
        tx.to.toLowerCase() === walletAddress?.toLowerCase() &&
        tx.to.toLowerCase() !== "0x0000000000000000000000000000000000000000" // Exclude burned tokens
      ) {
        ownedNfts.add(tx.tokenId);
      }
    });

    return {
      totalNftCount: ownedNfts.size,
      nftTransactionsCount: transactions.length,
    };
  }, [transactions, walletAddress]);

  return {
    transactions,
    loading,
    error,
    refresh: fetchNFTTransactions,
    statistics,
  };
};
