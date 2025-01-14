// src/Services/BlockchainService.js

const BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000';

class BlockchainService {
    constructor() {
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    setAuthToken(token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    async fetchWalletTransactions(address) {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/block-transactions?address=${address}`, {
                method: 'GET',
                headers: this.defaultHeaders,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch transactions');
            }

            const data = await response.json();

            // Transform the transaction data to standardize the format
            return data.map(tx => ({
                id: tx.nonce_string || tx.nonce_bytes,
                timestamp: tx.timestamp,
                fee: tx.fee,
                type: tx.type,
                value: tx.value,
                actualValue: tx.value - tx.fee,
                from: tx.from,
                to: tx.to,
                chainId: tx.chain_id,
                tokenId: tx.token_id_string || null,
                tokenMetadataURI: tx.token_metadata_uri || null,
                tokenNonce: tx.token_nonce_string || null,
                data: tx.data_string || tx.data || '',
                signature: {
                    v: tx.v_bytes,
                    r: tx.r_bytes,
                    s: tx.s_bytes
                },
                status: tx.timestamp ? 'confirmed' : 'pending'
            }));
        } catch (error) {
            console.error('Transaction fetch error:', error);
            throw error;
        }
    }

    handleError(error) {
        if (error.name === 'AbortError') {
            throw new Error('Request was cancelled');
        }

        if (error.message === 'Failed to fetch') {
            throw new Error('Network error - please check your connection');
        }

        throw error;
    }
}

const blockchainService = new BlockchainService();
export default blockchainService;
