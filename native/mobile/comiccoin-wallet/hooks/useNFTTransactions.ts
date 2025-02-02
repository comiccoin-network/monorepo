// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransactions.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import transactionListService, {
  OwnedTokenTransaction as Transaction,
} from "../services/transaction/OwnedTokenListService";

const NFT_TRANSACTIONS_QUERY_KEY = "nft-transactions";

interface UseNFTTransactionsOptions {
  enabled?: boolean;
}

interface UseNFTTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  hardRefresh: () => Promise<void>;
}

export const useNFTTransactions = (
  walletAddress: string | undefined,
  options: UseNFTTransactionsOptions = {},
): UseNFTTransactionsReturn => {
  const queryClient = useQueryClient();
  const { enabled = true } = options;

  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!walletAddress) {
      if (__DEV__) {
        console.log("🚫 No wallet address provided, skipping fetch");
        console.log(
          "💡 Hint: Make sure wallet address is defined before fetching",
        );
      }
      return [];
    }

    if (__DEV__) {
      console.log("🎯 Initializing NFT transaction fetch");
      console.log("👛 Target Wallet:", walletAddress);
      console.log("⚙️  Query Status: Active");
    }

    const txList = await transactionListService.fetchWalletTransactions(
      walletAddress,
      "token",
    );

    const sortedTransactions = [...txList].sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    if (__DEV__) {
      console.log("\n📊 Transaction Summary:");
      console.log(`📦 Total Transactions: ${sortedTransactions.length}`);
      console.log(
        `🕒 Latest Transaction: ${new Date(sortedTransactions[0]?.timestamp || 0).toLocaleString()}`,
      );

      console.log("\n🔍 Detailed Transaction Log:");
      sortedTransactions.forEach((tx, index) => {
        console.log(`\n📜 Transaction #${index + 1}:`);
        console.log(`  🔑 ID: ${tx.id}`);
        console.log(
          `  ⏰ Timestamp: ${new Date(tx.timestamp).toLocaleString()}`,
        );
        console.log(`  📝 Type: ${tx.type}`);
        console.log(`  💫 From: ${tx.from}`);
        console.log(`  🎯 To: ${tx.to}`);
        console.log(`  🎨 Token ID: ${tx.tokenId || "N/A"}`);
        console.log(`  📌 Status: ${tx.status}`);

        if (tx.tokenMetadata) {
          console.log("  🎭 Token Metadata:");
          console.log(`    📛 Name: ${tx.tokenMetadata.name}`);
          console.log(
            `    📝 Description: ${tx.tokenMetadata.description?.slice(0, 50)}...`,
          );
          console.log(`    🖼️  Image: ${tx.tokenMetadata.image}`);
          if (tx.tokenMetadata.attributes?.length) {
            console.log("    ✨ Attributes:");
            tx.tokenMetadata.attributes.forEach((attr) => {
              console.log(`      🏷️  ${attr.trait_type}: ${attr.value}`);
            });
          }
        }
      });

      console.log("\n✅ Transaction fetch completed successfully");
    }

    return sortedTransactions;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [NFT_TRANSACTIONS_QUERY_KEY, walletAddress],
    queryFn: fetchTransactions,
    enabled: enabled && Boolean(walletAddress),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });

  const refresh = async (): Promise<void> => {
    if (__DEV__) {
      console.log("🔄 Initiating soft refresh");
      console.log("📡 Using cached data if available");
    }

    await refetch();

    if (__DEV__) {
      console.log("✨ Soft refresh completed");
      console.log("📊 Cache status: Updated");
    }
  };

  const hardRefresh = async (): Promise<void> => {
    if (__DEV__) {
      console.log("🔄 Initiating hard refresh");
      console.log("🧹 Clearing cached data");
      console.log("📡 Fetching fresh data from API");
    }

    await queryClient.invalidateQueries({
      queryKey: [NFT_TRANSACTIONS_QUERY_KEY, walletAddress],
    });

    if (__DEV__) {
      console.log("✨ Hard refresh completed");
      console.log("🆕 All data freshly fetched");
      console.log("📊 Cache status: Reset and updated");
    }
  };

  return {
    transactions: data || [],
    isLoading,
    error: error as Error | null,
    refresh,
    hardRefresh,
  };
};
