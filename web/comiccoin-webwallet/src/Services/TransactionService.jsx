// src/Services/TransactionService.js
import { ethers } from 'ethers';
import walletService from './WalletService';

class TransactionService {
    constructor() {
        this.BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        this.comicCoinId = 29;
        this.chainId = null;
    }

    initialize(chainId) {
        this.chainId = chainId;
    }

    generateObjectId() {
        const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
        const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
        const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        return timestamp + machineId + processId + counter;
    }

    // Matches backend's cleanMap function exactly
    cleanMap(obj) {
        const result = { ...obj }; // Work on a copy to avoid mutating the input

        for (const [key, value] of Object.entries(result)) {
            if (value === null) {
                delete result[key];
                continue;
            }

            if (typeof value === 'string' && value === '') {
                delete result[key];
                continue;
            }

            if (Array.isArray(value)) {
                if (value.length === 0) {
                    delete result[key];
                } else {
                    for (let i = 0; i < value.length; i++) {
                        if (typeof value[i] === 'object' && value[i] !== null) {
                            value[i] = this.cleanMap(value[i]);
                        }
                    }
                }
                continue;
            }

            if (typeof value === 'object') {
                const cleaned = this.cleanMap(value);
                if (Object.keys(cleaned).length === 0) {
                    delete result[key];
                } else {
                    result[key] = cleaned;
                }
            }
        }

        return result;
    }

    async createStamp(transaction) {
        // Create exact JSON structure that matches backend
        const orderedObj = {
            chain_id: transaction.chain_id,
            nonce_bytes: transaction.nonce_bytes,
            nonce_string: "",
            from: transaction.from.toLowerCase(),
            to: transaction.to.toLowerCase(),
            value: transaction.value,
            data: "",
            data_string: "",
            type: "coin",
            token_id_bytes: null,
            token_id_string: "",
            token_metadata_uri: "",
            token_nonce_bytes: null,
            token_nonce_string: ""
        };

        // First convert to JSON
        const initialJson = JSON.stringify(orderedObj);
        console.log('Initial JSON:', initialJson);

        // Parse back to object and clean it
        const normalizedObj = this.cleanMap(JSON.parse(initialJson));
        console.log('After cleaning:', normalizedObj);

        // Convert back to JSON
        const message = JSON.stringify(normalizedObj);
        console.log('Final JSON for stamping:', message);

        // Convert to UTF-8 bytes
        const messageBytes = ethers.toUtf8Bytes(message);
        console.log('Message byte length:', messageBytes.length);

        // Create stamp with exact prefix
        const prefix = `\x19ComicCoin Signed Message:\n${messageBytes.length}`;
        const stampBytes = ethers.toUtf8Bytes(prefix);
        console.log('Stamp prefix:', prefix);

        // Concatenate and hash
        const fullMessage = ethers.concat([stampBytes, messageBytes]);
        const hash = ethers.keccak256(fullMessage);
        console.log('Final hash:', hash);

        return ethers.getBytes(hash);
    }

    async getTransactionTemplate(senderAddress, recipientAddress, amount, message = "") {
        try {
            const currentWallet = walletService.getCurrentWallet();
            if (!currentWallet) {
                throw new Error('No wallet is currently loaded');
            }

            if (currentWallet.address.toLowerCase() !== senderAddress.toLowerCase()) {
                throw new Error('Sender address does not match current wallet');
            }

            const requestPayload = {
                sender_account_address: senderAddress.toLowerCase(),
                recipient_address: recipientAddress.toLowerCase(),
                value: parseInt(amount),
                data: "",
                type: "coin"
            };

            console.log('Requesting template with payload:', requestPayload);

            const response = await fetch(`${this.BASE_URL}/api/v1/transaction/prepare`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get transaction template');
            }

            const template = await response.json();
            console.log('Received template:', template);
            return template;
        } catch (error) {
            console.error('getTransactionTemplate error:', error);
            throw error;
        }
    }

    async signTransaction(template) {
        try {
            const currentWallet = walletService.getCurrentWallet();
            if (!currentWallet) {
                throw new Error('No wallet is currently loaded');
            }

            console.log('Starting signing process with wallet address:', currentWallet.address);

            // Create the hash
            const messageHash = await this.createStamp(template);

            // Sign the hash using the private key directly
            const signingKey = new ethers.SigningKey(currentWallet.privateKey);
            const signature = signingKey.sign(messageHash);

            // ComicCoin expects v to be 0 or 1 plus comicCoinID (29)
            const recoveryParam = signature.yParity === 1 ? 1 : 0;
            const v = recoveryParam + this.comicCoinId;

            // Create signed transaction with EXACT field order
            const signedTx = {
                chain_id: template.chain_id,
                nonce_bytes: template.nonce_bytes,
                nonce_string: "",
                from: template.from.toLowerCase(),
                to: template.to.toLowerCase(),
                value: template.value,
                data: "",
                data_string: "",
                type: "coin",
                token_id_bytes: null,
                token_id_string: "",
                token_metadata_uri: "",
                token_nonce_bytes: null,
                token_nonce_string: "",
                v_bytes: [v],
                r_bytes: Array.from(ethers.getBytes(signature.r)),
                s_bytes: Array.from(ethers.getBytes(signature.s))
            };

            // Self-verify before returning
            const verificationResult = await this.verifySignature(signedTx);
            console.log('Signature verification result:', verificationResult);

            if (!verificationResult.isValid) {
                throw new Error('Signature verification failed: ' + verificationResult.error);
            }

            return signedTx;
        } catch (error) {
            console.error('signTransaction error:', error);
            throw error;
        }
    }

    async verifySignature(signedTransaction) {
        try {
            // Create the hash of the transaction
            const messageHash = await this.createStamp(signedTransaction);

            // Reconstruct the signature
            const r = ethers.hexlify(new Uint8Array(signedTransaction.r_bytes));
            const s = ethers.hexlify(new Uint8Array(signedTransaction.s_bytes));
            const v = signedTransaction.v_bytes[0] - this.comicCoinId;

            // Create the Signature object
            const signature = ethers.Signature.from({
                r,
                s,
                v: Number(v)
            });

            // Recover the address using built-in ethers function
            const recoveredAddress = ethers.recoverAddress(messageHash, signature);

            console.log('Recovered address:', recoveredAddress);
            console.log('Expected address:', signedTransaction.from);

            const isValid = recoveredAddress.toLowerCase() === signedTransaction.from.toLowerCase();

            return {
                isValid,
                recoveredAddress,
                error: isValid ? null : 'Recovered address does not match transaction sender'
            };
        } catch (error) {
            console.error('Verification error:', error);
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    async submitSignedTransaction(signedTransaction) {
        try {
            const mempoolTransaction = {
                id: this.generateObjectId(),
                ...signedTransaction
            };

            console.log('Submitting mempool transaction:', mempoolTransaction);

            const response = await fetch(`${this.BASE_URL}/api/v1/mempool-transactions`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(mempoolTransaction)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit transaction');
            }

            return await response.json();
        } catch (error) {
            console.error('submitSignedTransaction error:', error);
            throw error;
        }
    }
}

const transactionService = new TransactionService();
export default transactionService;
