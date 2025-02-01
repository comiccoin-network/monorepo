// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransactions.ts
// hooks/useNFTTransactions.ts
import { useState, useMemo, useEffect } from "react";
import transactionListService, {
  OwnedTokenTransaction as Transaction,
} from "../services/transaction/OwnedTokenListService";

interface UseNFTTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useNFTTransactions = (
  walletAddress: string | undefined,
): UseNFTTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!walletAddress) {
      console.log("🛑 No wallet address provided, skipping fetch.");
      return [];
    }

    console.log("🔄 Starting NFT transactions fetch...");
    setLoading(true);

    try {
      console.log("🌐 Fetching transactions for wallet:", walletAddress);
      const txList = await transactionListService.fetchWalletTransactions(
        walletAddress,
        "token",
      );

      console.log("✅ Successfully fetched transactions:", txList.length);

      // Sort transactions by timestamp in descending order
      const sortedTransactions = [...txList].sort(
        (a, b) => b.timestamp - a.timestamp,
      );

      // Log transaction details
      if (__DEV__) {
        console.log("\n📋 Transaction Details:");
        sortedTransactions.forEach((tx, index) => {
          console.log(`\n📄 Transaction #${index + 1}:`);
          console.log(`  ID: ${tx.id}`);
          console.log(
            `  Timestamp: ${new Date(tx.timestamp).toLocaleString()}`,
          );
          console.log(`  Type: ${tx.type}`);
          console.log(`  From: ${tx.from}`);
          console.log(`  To: ${tx.to}`);
          console.log(`  Token ID: ${tx.tokenId}`);
          console.log(`  Status: ${tx.status}`);
        });
      }

      setTransactions(sortedTransactions);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching NFT transactions:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      console.log("👛 Wallet address changed, fetching transactions...");
      fetchTransactions();
    }
  }, [walletAddress]);

  // Refresh function
  const refresh = async () => {
    console.log("🔄 Starting manual refresh...");
    try {
      await fetchTransactions();
      console.log("✅ Manual refresh completed successfully");
    } catch (err) {
      console.error("❌ Manual refresh failed:", err);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    refresh,
  };
};
