// monorepo/native/mobile/comiccoin-wallet/hooks/useCoinTransactions.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import transactionListService, {
  Transaction,
} from "../services/transaction/ListService";

interface CoinStatistics {
  totalCoinValue: number;
  coinTransactionsCount: number;
}

interface UseCoinTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  statistics: CoinStatistics;
}

export const useCoinTransactions = (
  walletAddress: string | undefined,
): UseCoinTransactionsReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ["coinTransactions", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];

      try {
        const txList = await transactionListService.fetchWalletTransactions(
          walletAddress,
          "coin",
        );
        return txList.sort((a, b) => b.timestamp - a.timestamp);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "An unknown error occurred while fetching coin transactions",
          );
        }
        return [];
      }
    },
    enabled: !!walletAddress,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries(["coinTransactions", walletAddress]);
  };

  const statistics = useMemo((): CoinStatistics => {
    const totalCoinValue = transactions.reduce((sum, tx) => {
      const value = Number(tx.value) || 0;
      const fee = Number(tx.fee) || 0;
      const currentAddress = walletAddress?.toLowerCase();
      const fromAddress = tx.from.toLowerCase();
      const toAddress = tx.to.toLowerCase();

      if (fromAddress === currentAddress) {
        return sum - value - fee;
      } else if (toAddress === currentAddress) {
        return sum + value;
      }

      return sum;
    }, 0);

    return {
      totalCoinValue: Math.max(0, totalCoinValue),
      coinTransactionsCount: transactions.length,
    };
  }, [transactions, walletAddress]);

  return {
    transactions,
    loading,
    error,
    refresh,
    statistics,
  };
};
