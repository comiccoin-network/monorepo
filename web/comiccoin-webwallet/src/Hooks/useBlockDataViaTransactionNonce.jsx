// monorepo/web/comiccoin-webwallet/src/Hooks/useBlockDataViaTransactionNonce.js
import { useState, useEffect } from 'react'
import blockDataViaTransactionNonceService from '../Services/BlockDataViaTransactionNonceService'

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
 * @property {Function} setTransactionNonce - Function to update the header number
 */

/**
 * Hook for fetching and managing block data
 * @param {string|number} initialTransactionNonce - Initial block header number to fetch
 * @returns {UseBlockDataResult} Block data, loading state, error state, and control functions
 */
export function useBlockDataViaTransactionNonce(initialTransactionNonce) {
    const [transactionNonce, setTransactionNonce] = useState(initialTransactionNonce)
    const [blockData, setBlockData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchBlockData = async () => {
        // Reset states
        setError(null)
        setLoading(true)

        try {
            // Validate header number
            if (!blockDataViaTransactionNonceService.validateTransactionNonce(transactionNonce)) {
                throw new Error('Invalid header number')
            }

            const data = await blockDataViaTransactionNonceService.getBlockDataByTransactionNonce(transactionNonce)
            setBlockData(data)
        } catch (err) {
            setError(err.message)
            setBlockData(null)
        } finally {
            setLoading(false)
        }
    }

    // Fetch data when header number changes
    useEffect(() => {
        fetchBlockData()
    }, [transactionNonce])

    return {
        blockData,
        loading,
        error,
        refetch: fetchBlockData,
        setTransactionNonce,
    }
}

// Example usage:
/*
const MyComponent = () => {
  const {
    blockData,
    loading,
    error,
    refetch,
    setTransactionNonce
  } = useBlockDataViaTransactionNonce(1);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blockData) return <div>No data</div>;

  return (
    <div>
      <h1>Block #{blockData.Header.NumberString}</h1>
      <button onClick={() => setTransactionNonce(2)}>Load Block 2</button>
      <button onClick={refetch}>Refresh</button>
      // Render other block data...
    </div>
  );
};
*/
