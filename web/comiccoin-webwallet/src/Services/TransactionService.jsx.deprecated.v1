import { ethers } from 'ethers';

function cleanMap(obj) {
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                delete obj[key];
            } else {
                value.forEach(item => {
                    if (typeof item === 'object' && item !== null) cleanMap(item);
                });
            }
        } else if (typeof value === 'object' && value !== null) {
            cleanMap(value);
            if (Object.keys(value).length === 0) {
                delete obj[key];
            }
        }
    }
    return obj;
}


class TransactionService {
    constructor() {
        this.BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    async getTransactionTemplate(senderAddress, recipientAddress, amount, message = "") {
        try {
            const requestPayload = {
                sender_account_address: senderAddress.toLowerCase(),
                recipient_address: recipientAddress.toLowerCase(),
                value: parseInt(amount),
                data: "",  // Always send empty string to match backend
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

    generateObjectId() {
        const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
        const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
        const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        return timestamp + machineId + processId + counter;
    }

    async signTransaction(template, wallet, password) {
    try {
        console.log('Starting signing process with wallet address:', wallet.address);

        // Create transaction object with EXACT field order
        const transaction = {
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
            token_nonce_string: ""
        };

        // Marshal and clean
        const initialJson = JSON.stringify(transaction);
        console.log('Initial JSON marshal:', initialJson);

        // Clean the object but keep empty strings and nulls
        const normalized = cleanMap(JSON.parse(initialJson));

        // Final marshal with NO extra spaces or formatting
        const message = JSON.stringify(normalized, null, 0);
        console.log('After cleaning:', message);

        // IMPORTANT: Calculate length from UTF-8 bytes of compact JSON
        const messageBytes = ethers.toUtf8Bytes(message);
        console.log('Message byte length:', messageBytes.length); // Should be 167

        // Create stamp with exact prefix
        const stampPrefix = "\x19ComicCoin Signed Message:\n" + messageBytes.length;
        const stampBytes = ethers.toUtf8Bytes(stampPrefix);

        // Hash exactly as backend
        const fullMessage = ethers.concat([stampBytes, messageBytes]);
        const hash = ethers.keccak256(fullMessage);
        console.log('Hash to sign:', hash);

        // Sign the hash
        const messageHashBytes = ethers.getBytes(hash);
        const signature = await wallet.signMessage(messageHashBytes);
        const sig = ethers.Signature.from(signature);

        console.log("v_bytes:", ethers.toBeHex(30, 1));  // Should be 0x1e
        console.log("r_bytes:", sig.r);
        console.log("s_bytes:", sig.s);

        return {
            ...transaction,
            v_bytes: Array.from(ethers.getBytes(ethers.toBeHex(30, 1))), // 0x1e
            r_bytes: Array.from(ethers.getBytes(sig.r)),
            s_bytes: Array.from(ethers.getBytes(sig.s))
        };

    } catch (error) {
        console.error('signTransaction error:', error);
        throw error;
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

    async getTransactionStatus(txHash) {
        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/transactions/${txHash}/status`, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get transaction status');
            }

            const data = await response.json();
            return data.status;
        } catch (error) {
            console.error('getTransactionStatus error:', error);
            throw error;
        }
    }
}

const transactionService = new TransactionService();
export default transactionService;
