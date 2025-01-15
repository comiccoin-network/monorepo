// src/Hooks/useTransaction.js
import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';
import transactionService from '../Services/TransactionService';

export const useTransaction = (chainId) => {
    const { error: walletError } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

            const template = await transactionService.getTransactionTemplate(
                currentWallet.address,
                recipientAddress,
                amount,
                note
            );
            console.log('Got transaction template:', template);

            const signedTransaction = await transactionService.signTransaction(template);
            console.log('Transaction signed:', signedTransaction);

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
