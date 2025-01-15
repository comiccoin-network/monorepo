import { useState } from 'react';
import transactionService from '../Services/TransactionService';

export const useTransaction = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [txStatus, setTxStatus] = useState(null);

    const submitTransaction = async (recipientAddress, amount, message, wallet, password) => {
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Get transaction template from authority
            // Note: We now include the sender's address in the template request
            const transactionTemplate = await transactionService.getTransactionTemplate(
                wallet.address, // sender's address
                recipientAddress,
                amount,
                message
            );

            // 2. Sign the transaction locally
            const signedTransaction = await transactionService.signTransaction(
                transactionTemplate,
                wallet,
                password
            );

            // 3. Submit signed transaction to authority
            const response = await transactionService.submitSignedTransaction(signedTransaction);

            // Store the transaction hash (you'll need to map this from your response)
            setTxHash(response.nonce_string); // or whatever unique identifier your API returns
            setTxStatus('pending');

            return response;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    const checkTransactionStatus = async (hash) => {
        try {
            const status = await transactionService.getTransactionStatus(hash);
            setTxStatus(status);
            return status;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return {
        isProcessing,
        error,
        txHash,
        txStatus,
        submitTransaction,
        checkTransactionStatus
    };
};
