// src/Services/BlockDataViaTransactionNonceService.js
import axios from 'axios';

class BlockDataViaTransactionNonceService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Fetches block data for a specific block header number
   * @param {string|number} transactionNonce - The block header number to fetch
   * @returns {Promise<Object>} - Promise resolving to block data
   * @throws {Error} - If the request fails
   */
  async getBlockDataByTransactionNonce(transactionNonce) {
    try {
      const response = await this.client.get(`/api/v1/blockdata-via-tx-nonce/${transactionNonce}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Failed to fetch block data: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
  }

  /**
   * Validates the block header number format
   * @param {string|number} transactionNonce - The block header number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  validateTransactionNonce(transactionNonce) {
    // Check if it's a non-negative number
    const num = Number(transactionNonce);
    return !isNaN(num) && num >= 0;
  }
}

// Create a singleton instance
const blockDataViaTransactionNonceService = new BlockDataViaTransactionNonceService();
export default blockDataViaTransactionNonceService;
