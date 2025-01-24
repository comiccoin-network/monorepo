// monorepo/native/mobile/comiccoin-wallet/src/hooks/useBlockDataViaTransactionNonce.ts
import { useState, useEffect, useCallback } from "react";
import blockDataViaTransactionNonceService from "../services/blockdata/BlockDataViaTransactionNonceService";

// Define the structure of our block data with TypeScript interfaces
interface BlockHeader {
  NumberString: string;
  TimeString: string;
  PreviousHeaderHashString: string;
  MerkleRootHashString: string;
  // You can extend this interface with additional header fields as needed
}

interface BlockValidator {
  AddressString: string;
  PublicKeyString: string;
  // Add additional validator fields based on your API response
}

interface MerkleTree {
  RootHash: string;
  Depth: number;
  // Add additional merkle tree fields as needed
}

// Main block data interface that combines all components
interface BlockData {
  Header: BlockHeader;
  HeaderSignatureBytes: Uint8Array;
  MerkleTree: MerkleTree;
  Validator: BlockValidator;
}

// The shape of data returned by our hook
interface UseBlockDataResult {
  blockData: BlockData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setTransactionNonce: (nonce: string | number) => void;
}

/**
 * A custom hook for fetching block data using a transaction nonce in the ComicCoin wallet.
 * This hook manages the complete lifecycle of fetching block data, including loading states,
 * error handling, and data management.
 *
 * @param initialTransactionNonce The initial transaction nonce to fetch block data for
 * @returns An object containing block data, loading state, error state, and control functions
 *
 * @example
 * ```typescript
 * const {
 *   blockData,
 *   loading,
 *   error,
 *   refetch,
 *   setTransactionNonce
 * } = useBlockDataViaTransactionNonce("1234");
 * ```
 */
export function useBlockDataViaTransactionNonce(
  initialTransactionNonce: string | number,
): UseBlockDataResult {
  // Initialize state with proper TypeScript types
  const [transactionNonce, setTransactionNonce] = useState<string | number>(
    initialTransactionNonce,
  );
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches block data from the service and updates the local state.
   * This function handles the entire data fetching process including:
   * - Managing loading states
   * - Validating the transaction nonce
   * - Error handling and state updates
   */
  const fetchBlockData = useCallback(async (): Promise<void> => {
    // Reset states before starting a new fetch
    setError(null);
    setLoading(true);

    try {
      // Validate the transaction nonce before making the request
      if (
        !blockDataViaTransactionNonceService.validateTransactionNonce(
          transactionNonce,
        )
      ) {
        throw new Error("Invalid transaction nonce format");
      }

      // Fetch the data using our service
      const data =
        await blockDataViaTransactionNonceService.getBlockDataByTransactionNonce(
          transactionNonce,
        );

      // Update the state with the fetched data
      setBlockData(data as BlockData);
    } catch (err) {
      // Handle errors with proper type checking
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setBlockData(null);
    } finally {
      // Always ensure we turn off loading state
      setLoading(false);
    }
  }, [transactionNonce]);

  // Fetch data whenever the transaction nonce changes
  useEffect(() => {
    fetchBlockData();
  }, [fetchBlockData]);

  return {
    blockData,
    loading,
    error,
    refetch: fetchBlockData,
    setTransactionNonce,
  };
}

/**
 * Example usage in a React Native component:
 *
 * ```typescript
 * import React from 'react';
 * import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
 * import { useBlockDataViaTransactionNonce } from '../hooks/useBlockDataViaTransactionNonce';
 *
 * const BlockDataViewer: React.FC = () => {
 *   const {
 *     blockData,
 *     loading,
 *     error,
 *     refetch,
 *     setTransactionNonce
 *   } = useBlockDataViaTransactionNonce("1234");
 *
 *   if (loading) {
 *     return (
 *       <View style={styles.container}>
 *         <ActivityIndicator size="large" />
 *       </View>
 *     );
 *   }
 *
 *   if (error) {
 *     return (
 *       <View style={styles.container}>
 *         <Text style={styles.errorText}>Error: {error}</Text>
 *         <Button title="Retry" onPress={refetch} />
 *       </View>
 *     );
 *   }
 *
 *   if (!blockData) {
 *     return (
 *       <View style={styles.container}>
 *         <Text>No block data available</Text>
 *       </View>
 *     );
 *   }
 *
 *   return (
 *     <View style={styles.container}>
 *       <Text style={styles.headerText}>
 *         Block #{blockData.Header.NumberString}
 *       </Text>
 *       <Text>Time: {blockData.Header.TimeString}</Text>
 *       <Text>
 *         Previous Hash: {blockData.Header.PreviousHeaderHashString.substring(0, 10)}...
 *       </Text>
 *       <View style={styles.buttonContainer}>
 *         <Button
 *           title="Next Transaction"
 *           onPress={() => setTransactionNonce(Number(transactionNonce) + 1)}
 *         />
 *         <Button title="Refresh" onPress={refetch} />
 *       </View>
 *     </View>
 *   );
 * };
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     flex: 1,
 *     padding: 20,
 *     justifyContent: 'center',
 *   },
 *   headerText: {
 *     fontSize: 20,
 *     fontWeight: 'bold',
 *     marginBottom: 10,
 *   },
 *   errorText: {
 *     color: 'red',
 *     marginBottom: 10,
 *   },
 *   buttonContainer: {
 *     marginTop: 20,
 *     gap: 10,
 *   },
 * });
 * ```
 */
