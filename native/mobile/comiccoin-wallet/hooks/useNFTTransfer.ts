// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransfer.ts
import { useState, useEffect } from "react";
import { useWallet } from "./useWallet";
import nftTransferService from "../services/nft/TransferService";

interface Wallet {
  address: string;
  privateKey: string;
}

interface TransactionResult {
  success: boolean;
  transactionId: string;
}

const extractNumericTokenId = (tokenId: string): string => {
  if (/^\d+$/.test(tokenId)) {
    return tokenId;
  }
  const matches = tokenId.match(/(\d+)$/);
  if (matches && matches[1]) {
    return matches[1];
  }
  return "1";
};

export const useNFTTransfer = (chainId: number = 1) => {
  const { error: walletError } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chainId) {
      nftTransferService.initialize(chainId);
    }
  }, [chainId]);

  const submitTransaction = async (
    recipientAddress: string,
    amount: number,
    note: string,
    currentWallet: Wallet,
    password: string,
    tokenID: string,
    tokenMetadataURI: string,
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

      // Convert tokenID to a numeric string
      const numericTokenId = extractNumericTokenId(tokenID);

      console.log("Preparing NFT transfer:", {
        from: currentWallet.address,
        to: recipientAddress,
        tokenId: numericTokenId,
        metadataURI: tokenMetadataURI,
      });

      const template = await nftTransferService.getTransactionTemplate(
        currentWallet.address,
        recipientAddress,
        amount,
        note,
        numericTokenId,
        tokenMetadataURI,
      );

      console.log("Transaction template received:", template);

      const signedTransaction =
        await nftTransferService.signTransaction(template);
      console.log("Transaction signed successfully");

      const result =
        await nftTransferService.submitSignedTransaction(signedTransaction);
      console.log("Transaction submission result:", result);

      return result;
    } catch (err) {
      console.log("NFT transfer error:", err);

      // Handle specific permission error
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      if (
        errorMessage.toLowerCase().includes("permission denied") &&
        errorMessage.includes("token address")
      ) {
        throw new Error(
          "You are not the current owner of this NFT and cannot transfer it",
        );
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitTransaction,
    loading,
    error: error || walletError,
  };
};
