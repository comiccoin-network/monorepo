// src/Hooks/useTransaction.js
import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import transactionService from '../Services/TransactionService';

export const useTransaction = (chainId) => {
    const { currentWallet, error: walletError } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize transaction service with chainId
    useEffect(() => {
        if (chainId) {
            transactionService.initialize(chainId);
        }
    }, [chainId]);

    const submitTransaction = async (recipientAddress, amount, note, currentWallet, password) => {
        try {
            setError(null);
            setLoading(true);

            if (!currentWallet) {
                throw new Error('No wallet loaded');
            }

            if (!chainId) {
                throw new Error('Chain ID not provided');
            }

            console.log('Submitting transaction:', {
                from: currentWallet.address,
                to: recipientAddress,
                amount,
                note
            });

            // Step 1: Get transaction template
            const template = await transactionService.getTransactionTemplate(
                currentWallet.address,
                recipientAddress,
                amount,
                note
            );

            console.log('Got transaction template:', template);

            // Step 2: Sign the transaction
            const signedTransaction = await transactionService.signTransaction(template);
            console.log('Transaction signed:', signedTransaction);

            // Step 3: Submit the signed transaction
            const result = await transactionService.submitSignedTransaction(signedTransaction);
            console.log('Transaction submitted:', result);

            return result;
        } catch (err) {
            console.error('Transaction error:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        submitTransaction,
        loading,
        error: error || walletError
    };
};
