// monorepo/native/mobile/comiccoin-wallet/src/hooks/useBlockTransaction.ts
import { useState, useEffect, useCallback } from "react";
import blockTransactionByNonceService from "../services/transaction/GetByNonceService";

// Return type matches exactly what component expects
interface UseBlockTransactionReturn {
  blockTxData: BlockTransactionByNonce | null;
  isBlockTxLoading: boolean;
  blockTxError: Error | null;
  blockTxRefetch: () => Promise<void>;
}

const debugLog = (emoji: string, message: string, data?: any) => {
  console.log(
    `${emoji} [useBlockTransaction] ${message}`,
    data ? { timestamp: new Date().toISOString(), ...data } : "",
  );
};

export const useBlockTransaction = (
  nonce: string | number | null,
): UseBlockTransactionReturn => {
  const [blockTxData, setBlockTxData] =
    useState<BlockTransactionByNonce | null>(null);
  const [isBlockTxLoading, setIsBlockTxLoading] = useState<boolean>(false);
  const [blockTxError, setBlockTxError] = useState<Error | null>(null);

  debugLog("🎣", "Hook called with nonce:", { nonce });

  const blockTxRefetch = useCallback(async () => {
    if (!nonce) {
      debugLog("⚠️", "No nonce provided", { nonce });
      setBlockTxData(null);
      setBlockTxError(null);
      return;
    }

    debugLog("🔄", "Starting fetch", { nonce });
    setIsBlockTxLoading(true);
    setBlockTxError(null);

    try {
      const transaction =
        await blockTransactionByNonceService.getBlockTransactionByNonce(nonce);
      debugLog("✅", "Fetch successful", {
        nonce,
        transactionType: transaction.type,
        from: transaction.from,
        to: transaction.to,
      });

      setBlockTxData(transaction);
    } catch (err) {
      debugLog("❌", "Fetch error", {
        nonce,
        error: err instanceof Error ? err.message : "Unknown error",
      });

      setBlockTxError(
        err instanceof Error ? err : new Error("Failed to fetch transaction"),
      );
      setBlockTxData(null);
    } finally {
      setIsBlockTxLoading(false);
      debugLog("🏁", "Fetch complete", {
        nonce,
        hasData: !!blockTxData,
        hasError: !!blockTxError,
      });
    }
  }, [nonce]);

  useEffect(() => {
    debugLog("👀", "Nonce changed, fetching data", { nonce });
    blockTxRefetch();
  }, [blockTxRefetch]);

  // Log current state before returning
  debugLog("📊", "Current hook state", {
    nonce,
    hasData: !!blockTxData,
    isLoading: isBlockTxLoading,
    hasError: !!blockTxError,
  });

  return {
    blockTxData,
    isBlockTxLoading,
    blockTxError,
    blockTxRefetch,
  };
};
