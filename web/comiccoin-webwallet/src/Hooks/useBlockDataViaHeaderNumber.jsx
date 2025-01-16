// src/Hooks/useBlockDataViaHeaderNumber.js
import { useState, useEffect } from 'react';
import blockDataViaHeaderNumberService from '../Services/BlockDataViaHeaderNumberService';

/**
 * @typedef {Object} BlockData
 * @property {Object} Header - Block header containing metadata
 * @property {Uint8Array} HeaderSignatureBytes - Block header signature
 * @property {Object} MerkleTree - Merkle tree of transactions
 * @property {Object} Validator - Block validator information
 */

/**
 * @typedef {Object} UseBlockDataResult
 * @property {BlockData|null} blockData - The fetched block data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Function} refetch - Function to manually refetch the data
 * @property {Function} setHeaderNumber - Function to update the header number
 */

/**
 * Hook for fetching and managing block data
 * @param {string|number} initialHeaderNumber - Initial block header number to fetch
 * @returns {UseBlockDataResult} Block data, loading state, error state, and control functions
 */
export function useBlockDataViaHeaderNumber(initialHeaderNumber) {
  const [headerNumber, setHeaderNumber] = useState(initialHeaderNumber);
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlockData = async () => {
    // Reset states
    setError(null);
    setLoading(true);

    try {
      // Validate header number
      if (!blockDataViaHeaderNumberService.validateHeaderNumber(headerNumber)) {
        throw new Error('Invalid header number');
      }

      const data = await blockDataViaHeaderNumberService.getBlockDataByHeaderNumber(headerNumber);
      setBlockData(data);
    } catch (err) {
      setError(err.message);
      setBlockData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when header number changes
  useEffect(() => {
    fetchBlockData();
  }, [headerNumber]);

  return {
    blockData,
    loading,
    error,
    refetch: fetchBlockData,
    setHeaderNumber
  };
}

// Example usage:
/*
const MyComponent = () => {
  const {
    blockData,
    loading,
    error,
    refetch,
    setHeaderNumber
  } = useBlockDataViaHeaderNumber(1);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blockData) return <div>No data</div>;

  return (
    <div>
      <h1>Block #{blockData.Header.NumberString}</h1>
      <button onClick={() => setHeaderNumber(2)}>Load Block 2</button>
      <button onClick={refetch}>Refresh</button>
      // Render other block data...
    </div>
  );
};
*/
