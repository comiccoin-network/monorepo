// monorepo/native/mobile/comiccoin-wallet/src/hooks/useBlockDataViaHeaderNumber.ts
import { useState, useEffect, useCallback } from "react";
import blockDataViaHeaderNumberService from "../services/blockdata/BlockDataViaHeaderNumberService";

// Define the structure of our block data with TypeScript interfaces
interface BlockHeader {
  NumberString: string;
  // Add other header fields based on your API response
  TimeString: string;
  PreviousHeaderHashString: string;
  MerkleRootHashString: string;
}

interface BlockValidator {
  // Add validator fields based on your API response
  AddressString: string;
  PublicKeyString: string;
}

interface MerkleTree {
  // Add merkle tree fields based on your API response
  RootHash: string;
  Depth: number;
}

interface BlockData {
  Header: BlockHeader;
  HeaderSignatureBytes: Uint8Array;
  MerkleTree: MerkleTree;
  Validator: BlockValidator;
}

interface UseBlockDataResult {
  blockData: BlockData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setHeaderNumber: (headerNumber: string | number) => void;
}

/**
 * A custom hook for fetching and managing block data in the ComicCoin wallet.
 * This hook handles the complete lifecycle of fetching block data, including
 * loading states, error handling, and data management.
 *
 * @param initialHeaderNumber The initial block header number to fetch
 * @returns An object containing the block data, loading state, error state, and control functions
 *
 * @example
 * ```typescript
 * const {
 *   blockData,
 *   loading,
 *   error,
 *   refetch,
 *   setHeaderNumber
 * } = useBlockDataViaHeaderNumber("1");
 * ```
 */
export function useBlockDataViaHeaderNumber(
  initialHeaderNumber: string | number,
): UseBlockDataResult {
  // State management with proper typing
  const [headerNumber, setHeaderNumber] = useState<string | number>(
    initialHeaderNumber,
  );
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches block data from the service and updates the local state.
   * This function handles all aspects of the data fetching process:
   * - Sets loading states
   * - Handles errors
   * - Updates the block data
   */
  const fetchBlockData = useCallback(async (): Promise<void> => {
    // Reset states before fetching
    setError(null);
    setLoading(true);

    try {
      // Validate the header number before making the request
      if (!blockDataViaHeaderNumberService.validateHeaderNumber(headerNumber)) {
        throw new Error("Invalid header number format");
      }

      // Fetch the data from our service
      const data =
        await blockDataViaHeaderNumberService.getBlockDataByHeaderNumber(
          headerNumber,
        );

      // Update the state with the fetched data
      setBlockData(data as BlockData);
    } catch (err) {
      // Handle errors and provide meaningful error messages
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setBlockData(null);
    } finally {
      // Always ensure we turn off loading state
      setLoading(false);
    }
  }, [headerNumber]);

  // Fetch data whenever the header number changes
  useEffect(() => {
    fetchBlockData();
  }, [fetchBlockData]);

  return {
    blockData,
    loading,
    error,
    refetch: fetchBlockData,
    setHeaderNumber,
  };
}

/**
 * Example usage in a React Native component:
 *
 * ```typescript
 * import React from 'react';
 * import { View, Text, Button, ActivityIndicator } from 'react-native';
 * import { useBlockDataViaHeaderNumber } from '../hooks/useBlockDataViaHeaderNumber';
 *
 * const BlockDataViewer: React.FC = () => {
 *   const {
 *     blockData,
 *     loading,
 *     error,
 *     refetch,
 *     setHeaderNumber
 *   } = useBlockDataViaHeaderNumber(1);
 *
 *   if (loading) {
 *     return (
 *       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
 *         <ActivityIndicator size="large" />
 *       </View>
 *     );
 *   }
 *
 *   if (error) {
 *     return (
 *       <View style={{ padding: 20 }}>
 *         <Text style={{ color: 'red' }}>Error: {error}</Text>
 *         <Button title="Retry" onPress={refetch} />
 *       </View>
 *     );
 *   }
 *
 *   if (!blockData) {
 *     return (
 *       <View style={{ padding: 20 }}>
 *         <Text>No block data available</Text>
 *       </View>
 *     );
 *   }
 *
 *   return (
 *     <View style={{ padding: 20 }}>
 *       <Text>Block #{blockData.Header.NumberString}</Text>
 *       <Text>Time: {blockData.Header.TimeString}</Text>
 *       <Button
 *         title="Load Next Block"
 *         onPress={() => setHeaderNumber(Number(blockData.Header.NumberString) + 1)}
 *       />
 *       <Button title="Refresh" onPress={refetch} />
 *     </View>
 *   );
 * };
 * ```
 */
