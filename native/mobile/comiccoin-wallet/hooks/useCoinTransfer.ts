// monorepo/native/mobile/comiccoin-wallet/src/hooks/useCoinTransfer.ts
import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import coinTransferService from "../services/coin/TransferService";

// Define the wallet interface based on your implementation
interface Wallet {
  address: string;
  privateKey: string;
  // Add other wallet properties as needed
}

// Define the transaction template interface
interface TransactionTemplate {
  chain_id: number;
  from: string;
  to: string;
  value: number;
  nonce_bytes: number[];
  // Add other template properties as needed
}

// Define the transaction result interface
interface TransactionResult {
  success: boolean;
  transactionId: string;
}

// Define the hook's return type for better type safety
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

/**
 * A custom hook for managing coin transfers in the ComicCoin wallet.
 * This hook provides functionality for submitting transactions, handling the signing process,
 * and managing the transfer lifecycle.
 *
 * @param chainId - The blockchain network identifier
 * @returns An object containing the submission function, loading state, and any errors
 */
export function useCoinTransfer(chainId?: number): UseCoinTransferResult {
  // Get wallet state from the wallet hook
  const { error: walletError } = useWallet();

  // Local state management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the coin transfer service with the chain ID
  useEffect(() => {
    if (chainId) {
      coinTransferService.initialize(chainId);
    }
  }, [chainId]);

  /**
   * Submits a transaction to transfer coins.
   * This function handles the complete transaction lifecycle:
   * 1. Gets a transaction template
   * 2. Signs the transaction
   * 3. Submits the signed transaction
   *
   * @param recipientAddress - The recipient's wallet address
   * @param amount - The amount of coins to transfer
   * @param note - Optional transaction note
   * @param currentWallet - The sender's wallet information
   * @param password - The wallet password for signing
   * @returns A promise resolving to the transaction result
   */
  const submitTransaction = useCallback(
    async (
      recipientAddress: string,
      amount: number | string,
      note: string,
      currentWallet: Wallet,
      password: string,
    ): Promise<TransactionResult> => {
      try {
        // Reset error state and set loading
        setError(null);
        setLoading(true);

        // Validate required parameters
        if (!currentWallet) {
          throw new Error("No wallet loaded");
        }

        if (!chainId) {
          throw new Error("Chain ID not provided");
        }

        // Log transaction details (excluding sensitive data)
        console.log("Initiating transaction:", {
          from: currentWallet.address,
          to: recipientAddress,
          amount,
          hasNote: !!note,
        });

        // Step 1: Get transaction template
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
        });

        // Step 2: Sign the transaction
        const signedTransaction =
          await coinTransferService.signTransaction(template);
        console.log("Transaction signed successfully");

        // Step 3: Submit the signed transaction
        const result =
          await coinTransferService.submitSignedTransaction(signedTransaction);
        console.log("Transaction submitted:", {
          success: result.success,
          transactionId: result.transactionId,
        });

        return result;
      } catch (err) {
        // Handle errors with proper type checking
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

/**
 * Example usage in a React Native component:
 *
 * ```typescript
 * import React, { useState } from 'react';
 * import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
 * import { useCoinTransfer } from '../hooks/useCoinTransfer';
 * import { useWallet } from '../hooks/useWallet';
 *
 * const TransferScreen: React.FC = () => {
 *   const { currentWallet } = useWallet();
 *   const { submitTransaction, loading, error } = useCoinTransfer(1); // chainId = 1
 *
 *   const [recipient, setRecipient] = useState('');
 *   const [amount, setAmount] = useState('');
 *   const [note, setNote] = useState('');
 *
 *   const handleTransfer = async () => {
 *     try {
 *       const result = await submitTransaction(
 *         recipient,
 *         amount,
 *         note,
 *         currentWallet,
 *         'password' // In practice, get this securely from the user
 *       );
 *
 *       Alert.alert(
 *         'Success',
 *         `Transaction submitted: ${result.transactionId}`
 *       );
 *     } catch (err) {
 *       Alert.alert(
 *         'Error',
 *         err instanceof Error ? err.message : 'Failed to submit transaction'
 *       );
 *     }
 *   };
 *
 *   return (
 *     <View style={styles.container}>
 *       {error && (
 *         <Text style={styles.errorText}>{error}</Text>
 *       )}
 *
 *       <TextInput
 *         style={styles.input}
 *         placeholder="Recipient Address"
 *         value={recipient}
 *         onChangeText={setRecipient}
 *       />
 *
 *       <TextInput
 *         style={styles.input}
 *         placeholder="Amount"
 *         keyboardType="decimal-pad"
 *         value={amount}
 *         onChangeText={setAmount}
 *       />
 *
 *       <TextInput
 *         style={styles.input}
 *         placeholder="Note (optional)"
 *         value={note}
 *         onChangeText={setNote}
 *       />
 *
 *       <Button
 *         title={loading ? "Processing..." : "Send Coins"}
 *         onPress={handleTransfer}
 *         disabled={loading}
 *       />
 *     </View>
 *   );
 * };
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     padding: 20,
 *   },
 *   input: {
 *     borderWidth: 1,
 *     borderColor: '#ccc',
 *     borderRadius: 5,
 *     padding: 10,
 *     marginBottom: 15,
 *   },
 *   errorText: {
 *     color: 'red',
 *     marginBottom: 15,
 *   },
 * });
 * ```
 */
