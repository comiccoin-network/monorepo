// src/Services/TransactionService.jsx
import { ethers } from 'ethers';
import walletService from './WalletService';

class TransactionService {
    constructor() {
        this.BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        this.comicCoinId = 29;
        this.chainId = 1;
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

    /**
    * Matches backend's cleanMap function exactly
    * @param {Object} obj - Object to clean
    * @returns {Object} Cleaned object with empty/null values removed
    */
   cleanMap = (obj) => {
        const result = { ...obj }; // Work on a copy to avoid mutating the input

        for (const [key, value] of Object.entries(result)) {
            // Handle null values
            if (value === null) {
                delete result[key];
                continue;
            }

            // Handle empty strings
            if (typeof value === 'string' && value === '') {
                delete result[key];
                continue;
            }

            // Handle empty arrays
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    delete result[key];
                    continue;
                }
                // Clean array elements if they are objects
                for (let i = 0; i < value.length; i++) {
                    if (typeof value[i] === 'object' && value[i] !== null) {
                        value[i] = this.cleanMap(value[i]);
                    }
                }
                continue;
            }

            // Handle nested objects
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

    async createStamp(transaction) {
        console.log('Creating stamp from:', transaction);

        // Create exact JSON structure that matches backend's alphabetical order
        const orderedObj = {
            chain_id: transaction.chain_id,
            from: transaction.from.toLowerCase(),
            nonce_bytes: transaction.nonce_bytes,
            to: transaction.to.toLowerCase(),
            type: "coin",
            value: transaction.value
        };

        // First convert to JSON
        const initialJson = JSON.stringify(orderedObj);
        console.log('Initial JSON (raw):', initialJson);
        console.log('Initial JSON bytes:', Array.from(ethers.toUtf8Bytes(initialJson)).map(b => b.toString(16).padStart(2, '0')));

        // Keep exact fields to match backend
        const message = initialJson;
        console.log('Final JSON:', message);

        // Convert to UTF-8 bytes with detailed logging
        const messageBytes = ethers.toUtf8Bytes(message);
        console.log('Message bytes:', {
            decimal: Array.from(messageBytes),
            hex: Array.from(messageBytes).map(b => b.toString(16).padStart(2, '0')),
            length: messageBytes.length,
            utf8: new TextDecoder().decode(messageBytes)
        });

        // Create stamp prefix - exactly match backend format
        const prefix = `\x19ComicCoin Signed Message:\n${messageBytes.length}`;
        const stampBytes = ethers.toUtf8Bytes(prefix);
        console.log('Prefix details:', {
            text: prefix,
            bytes: Array.from(stampBytes),
            hex: ethers.hexlify(stampBytes)
        });

        // Log components for debugging
        console.log('Hash components:', {
            prefix_bytes: Array.from(stampBytes).map(b => b.toString(16).padStart(2, '0')),
            message_bytes: Array.from(messageBytes).map(b => b.toString(16).padStart(2, '0'))
        });

        // Concatenate and hash
        const fullMessage = ethers.concat([stampBytes, messageBytes]);
        console.log('Full message:', {
            hex: ethers.hexlify(fullMessage),
            bytes: Array.from(fullMessage).map(b => b.toString(16).padStart(2, '0'))
        });

        const hash = ethers.keccak256(fullMessage);
        console.log('Final hash:', {
            hex: hash,
            bytes: Array.from(ethers.getBytes(hash)).map(b => b.toString(16).padStart(2, '0'))
        });

        return ethers.getBytes(hash);
    }

    async signTransaction(template) {
        try {
            const currentWallet = walletService.getCurrentWallet();
            if (!currentWallet) {
                throw new Error('No wallet is currently loaded');
            }

            console.log('Starting signing process:', {
                wallet_address: currentWallet.address,
                template: template
            });

            // Create the hash
            const messageHash = await this.createStamp(template);
            console.log('Message hash:', ethers.hexlify(messageHash));

            // Create wallet and log details
            const wallet = new ethers.Wallet(currentWallet.privateKey);

            // Sign the hash bytes directly
            const signature = await wallet.signingKey.sign(messageHash);
            console.log('Raw signature:', signature);

            // Get parity and set v value
            const recoveryBit = signature.yParity;  // This will be 0 or 1
            const v = this.comicCoinId + recoveryBit; // 29 or 30

            // Create verification signature first to ensure it's valid
            const verifySignature = ethers.Signature.from({
                r: signature.r,
                s: signature.s,
                v: signature.v === 28 ? 28 : 27 // Convert to ethers format for verification
            });

            const recoveredAddr = ethers.recoverAddress(messageHash, verifySignature);
            console.log('Pre-verify recovered:', recoveredAddr);

            if (recoveredAddr.toLowerCase() !== currentWallet.address.toLowerCase()) {
                throw new Error('Pre-verification failed - signature would be invalid');
            }

            // Create signed transaction
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

            // Log final values for debugging
            console.log('Final signature values:', {
                messageHash: ethers.hexlify(messageHash),
                r: signature.r,
                s: signature.s,
                v_original: signature.v,
                v_final: v,
                recoveryBit,
                address: currentWallet.address
            });

            // Final verification
            const verificationResult = await this.verifySignature(signedTx);
            console.log('Final verification result:', verificationResult);

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
            console.log('Starting verification with:', {
                from: signedTransaction.from,
                v_bytes: signedTransaction.v_bytes,
                r_bytes: signedTransaction.r_bytes.slice(0, 5), // Just show first 5 bytes
                s_bytes: signedTransaction.s_bytes.slice(0, 5)  // Just show first 5 bytes
            });

            // Create the hash
            const messageHash = await this.createStamp(signedTransaction);

            // Convert bytes to hex strings
            const r = ethers.hexlify(new Uint8Array(signedTransaction.r_bytes));
            const s = ethers.hexlify(new Uint8Array(signedTransaction.s_bytes));

            // Get v value and convert to ethers format (27/28)
            const comicCoinV = signedTransaction.v_bytes[0];
            const recoveryBit = comicCoinV - this.comicCoinId; // Should be 0 or 1
            const ethersV = 27 + recoveryBit; // Will be 27 or 28

            console.log('Verification values:', {
                comicCoinV,
                recoveryBit,
                ethersV,
                r: r,
                s: s
            });

            // Create ethers signature
            const signature = ethers.Signature.from({
                r: r,
                s: s,
                v: ethersV
            });

            console.log('Verification components:', {
                messageHash: ethers.hexlify(messageHash),
                signature_v: signature.v,
                signature_r: signature.r,
                signature_s: signature.s
            });

            // Recover the address
            const recoveredAddress = ethers.recoverAddress(messageHash, signature);

            const isValid = recoveredAddress.toLowerCase() === signedTransaction.from.toLowerCase();

            console.log('Recovery result:', {
                recovered: recoveredAddress,
                expected: signedTransaction.from,
                isValid: isValid
            });

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

            // Log transaction details before submission
            console.log('Submitting transaction:', {
                id: mempoolTransaction.id,
                chain_id: mempoolTransaction.chain_id,
                from: mempoolTransaction.from,
                to: mempoolTransaction.to,
                value: mempoolTransaction.value,
                v_bytes: mempoolTransaction.v_bytes.map(b => b.toString(16).padStart(2, '0')),
                r_bytes: mempoolTransaction.r_bytes.slice(0, 4).map(b => b.toString(16).padStart(2, '0')) + '...',
                s_bytes: mempoolTransaction.s_bytes.slice(0, 4).map(b => b.toString(16).padStart(2, '0')) + '...'
            });

            // Log full request details
            const requestBody = JSON.stringify(mempoolTransaction);
            console.log('Request body:', requestBody);

            const response = await fetch(`${this.BASE_URL}/api/v1/mempool-transactions`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: requestBody
            });

            // Log response details
            const responseData = await response.json();
            console.log('Server response:', {
                status: response.status,
                ok: response.ok,
                data: responseData
            });

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to submit transaction');
            }

            return responseData;
        } catch (error) {
            console.error('submitSignedTransaction error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

const transactionService = new TransactionService();
export default transactionService;
