// src/Services/TransactionService.js
import { ethers } from 'ethers';
import walletService from './WalletService';

class TransactionService {
    constructor() {
        this.BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
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

    async createMessage(transaction) {
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

        // Convert to compact JSON
        const message = JSON.stringify(orderedObj);
        console.log('Transaction JSON for signing:', message);
        return message;
    }

    async signTransaction(template) {
        try {
            const currentWallet = walletService.getCurrentWallet();
            if (!currentWallet) {
                throw new Error('No wallet is currently loaded');
            }

            console.log('Starting signing process with wallet address:', currentWallet.address);

            // Create the message
            const message = await this.createMessage(template);

            // Sign the message using ethers v2
            const signature = await currentWallet.signMessage(message);

            // Split signature into v, r, s components
            const sig = ethers.Signature.from(signature);

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
                v_bytes: [sig.v + 27], // Add 27 to match Ethereum's v value
                r_bytes: Array.from(ethers.getBytes(sig.r)),
                s_bytes: Array.from(ethers.getBytes(sig.s))
            };

            // Verify signature
            const verificationResult = await this.verifySignature(signedTx, message);
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

    async verifySignature(signedTransaction, originalMessage) {
        try {
            // Reconstruct the signature
            const r = ethers.hexlify(new Uint8Array(signedTransaction.r_bytes));
            const s = ethers.hexlify(new Uint8Array(signedTransaction.s_bytes));
            const v = signedTransaction.v_bytes[0] - 27; // Subtract 27 to get standard v value

            const signature = ethers.Signature.from({
                r,
                s,
                v: Number(v)
            });

            // Recover the address using ethers.verifyMessage
            const recoveredAddress = ethers.verifyMessage(originalMessage, signature);

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
