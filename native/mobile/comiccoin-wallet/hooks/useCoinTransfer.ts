// monorepo/native/mobile/comiccoin-wallet/src/hooks/useCoinTransfer.ts
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import coinTransferService from "../services/coin/TransferService";

interface Wallet {
  address: string;
  privateKey: string;
}

interface TransactionTemplate {
  chain_id: number;
  from: string;
  to: string;
  value: number;
  nonce_bytes: number[];
}

// Updated to include nonce information
interface TransactionResult {
  success: boolean;
  transactionId: string;
  nonce: {
    bytes: number[];
    string?: string; // Optional string representation of the nonce
  };
}

interface UseCoinTransferResult {
  submitTransaction: (
    recipientAddress: string,
    amount: number | string,
    note: string,
    currentWallet: Wallet,
    password: string,
  ) => Promise<TransactionResult>;
  loading: boolean;
  error: string | null;
}

export function useCoinTransfer(chainId?: number): UseCoinTransferResult {
  const { error: walletError } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chainId) {
      coinTransferService.initialize(chainId);
    }
  }, [chainId]);

  const submitTransaction = useCallback(
    async (
      recipientAddress: string,
      amount: number | string,
      note: string,
      currentWallet: Wallet,
      password: string,
    ): Promise<TransactionResult> => {
      try {
        setError(null);
        setLoading(true);

        if (!currentWallet) {
          throw new Error("No wallet loaded");
        }

        if (!chainId) {
          throw new Error("Chain ID not provided");
        }

        console.log("Initiating transaction:", {
          from: currentWallet.address,
          to: recipientAddress,
          amount,
          hasNote: !!note,
        });

        const template = await coinTransferService.getTransactionTemplate(
          currentWallet.address,
          recipientAddress,
          amount,
          note,
        );

        console.log("Transaction template received:", {
          chainId: template.chain_id,
          from: template.from,
          to: template.to,
          value: template.value,
          nonceBytes: template.nonce_bytes,
        });

        const signedTransaction =
          await coinTransferService.signTransaction(template);
        console.log("Transaction signed successfully");

        const result =
          await coinTransferService.submitSignedTransaction(signedTransaction);
        console.log("Transaction submitted:", {
          success: result.success,
          transactionId: result.transactionId,
          nonce: result.nonce,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Transaction error:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [chainId],
  );

  return {
    submitTransaction,
    loading,
    error: error || walletError || null,
  };
}
