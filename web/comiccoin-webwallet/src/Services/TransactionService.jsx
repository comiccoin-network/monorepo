class TransactionService {
    constructor() {
        this.BASE_URL = process.env.REACT_APP_AUTHORITY_API_URL || 'http://localhost:8000';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        console.log('TransactionService initialized with BASE_URL:', this.BASE_URL);
    }

    async getTransactionTemplate(senderAddress, recipientAddress, amount, message) {
        console.log('getTransactionTemplate: Starting with params:', {
            senderAddress,
            recipientAddress,
            amount,
            message
        });

        try {
            const requestPayload = {
                sender_account_address: senderAddress,
                recipient_address: recipientAddress,
                value: parseInt(amount), // Convert to uint64
                data: message || "",
                type: "coin"
            };
            console.log('getTransactionTemplate: Request payload:', requestPayload);

            const response = await fetch(`${this.BASE_URL}/api/v1/transaction/prepare`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(requestPayload)
            });

            console.log('getTransactionTemplate: Raw response status:', response.status);
            console.log('getTransactionTemplate: Raw response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const error = await response.json();
                console.error('getTransactionTemplate: Response not OK:', {
                    status: response.status,
                    statusText: response.statusText,
                    error
                });
                throw new Error(error.message || 'Failed to get transaction template');
            }

            const responseData = await response.json();
            console.log('getTransactionTemplate: Successful response:', responseData);
            return responseData;
        } catch (error) {
            console.error('getTransactionTemplate: Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause
            });
            throw error;
        }
    }

    async signTransaction(transactionTemplate, wallet, password) {
        console.log('signTransaction: Starting with template:', {
            ...transactionTemplate,
            // Only log non-sensitive data
            chain_id: transactionTemplate.chain_id,
            value: transactionTemplate.value,
            type: transactionTemplate.type
        });

        try {
            const transactionData = {
                chainId: transactionTemplate.chain_id,
                nonce: transactionTemplate.nonce_string,
                to: transactionTemplate.to,
                value: transactionTemplate.value,
                data: transactionTemplate.data_string || '0x',
            };
            console.log('signTransaction: Prepared transaction data:', {
                ...transactionData,
                // Exclude sensitive data from logs
                password: '[REDACTED]'
            });

            if (!wallet || typeof wallet.signTransaction !== 'function') {
                console.error('signTransaction: Invalid wallet object:', {
                    hasWallet: !!wallet,
                    hasSignFunction: wallet && typeof wallet.signTransaction === 'function'
                });
                throw new Error('Invalid wallet configuration');
            }

            const signedTransaction = await wallet.signTransaction(transactionData, password);
            console.log('signTransaction: Transaction signed successfully:', {
                // Log only the type of data returned, not the actual signature
                hasSignature: !!signedTransaction,
                type: typeof signedTransaction
            });

            return signedTransaction;
        } catch (error) {
            console.error('signTransaction: Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause
            });
            throw new Error('Failed to sign transaction: ' + error.message);
        }
    }

    async submitSignedTransaction(signedTransaction) {
        console.log('submitSignedTransaction: Starting with transaction:', {
            // Log only non-sensitive parts of the signed transaction
            hasSignature: !!signedTransaction,
            type: typeof signedTransaction
        });

        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/transactions`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(signedTransaction)
            });

            console.log('submitSignedTransaction: Raw response status:', response.status);
            console.log('submitSignedTransaction: Raw response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const error = await response.json();
                console.error('submitSignedTransaction: Response not OK:', {
                    status: response.status,
                    statusText: response.statusText,
                    error
                });
                throw new Error(error.message || 'Failed to submit transaction');
            }

            const responseData = await response.json();
            console.log('submitSignedTransaction: Successful response:', responseData);
            return responseData;
        } catch (error) {
            console.error('submitSignedTransaction: Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause
            });
            throw error;
        }
    }

    async getTransactionStatus(txHash) {
        console.log('getTransactionStatus: Checking status for hash:', txHash);

        try {
            const response = await fetch(`${this.BASE_URL}/api/v1/transactions/${txHash}/status`, {
                method: 'GET',
                headers: this.defaultHeaders
            });

            console.log('getTransactionStatus: Raw response status:', response.status);
            console.log('getTransactionStatus: Raw response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const error = await response.json();
                console.error('getTransactionStatus: Response not OK:', {
                    status: response.status,
                    statusText: response.statusText,
                    error
                });
                throw new Error(error.message || 'Failed to get transaction status');
            }

            const data = await response.json();
            console.log('getTransactionStatus: Successful response:', data);
            return data.status;
        } catch (error) {
            console.error('getTransactionStatus: Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause
            });
            throw error;
        }
    }
}

const transactionService = new TransactionService();
export default transactionService;
