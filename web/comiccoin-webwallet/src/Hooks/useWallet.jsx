// src/Hooks/useWallet.js
import { useState, useEffect } from 'react';
import walletService from '../Services/WalletService';

export const useWallet = () => {
    const [currentWallet, setCurrentWallet] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize wallet service and set up state
    useEffect(() => {
        const initializeWalletService = async () => {
            try {
                await walletService.initialize();
                setWallets(walletService.getWallets());

                // Check if there's an active wallet session
                try {
                    const activeWallet = walletService.getCurrentWallet();
                    if (activeWallet) {
                        setCurrentWallet(activeWallet);
                    }
                } catch (sessionError) {
                    // Handle session expired or no active wallet
                    console.log('No active wallet session');
                }

                setIsInitialized(true);
            } catch (err) {
                setError('Failed to initialize wallet service');
            } finally {
                setLoading(false);
            }
        };

        initializeWalletService();
    }, []);

    const createWallet = async (mnemonic, password) => {
        try {
            setError(null);
            setLoading(true);

            // Create the wallet
            const newWallet = await walletService.createWalletFromMnemonic(mnemonic, password);

            // Update wallets list
            setWallets(walletService.getWallets());

            // Load the wallet immediately after creation
            const loadedWallet = await walletService.loadWallet(newWallet.id, password);
            setCurrentWallet(loadedWallet);

            return newWallet;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loadWallet = async (id, password) => {
        try {
            setError(null);
            setLoading(true);

            const wallet = await walletService.loadWallet(id, password);
            setCurrentWallet(wallet);

            return wallet;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        walletService.logout();
        setCurrentWallet(null);
    };

    const checkSession = () => {
        return walletService.checkSession();
    };

    return {
        currentWallet,
        wallets,
        loading,
        error,
        isInitialized,
        createWallet,
        loadWallet,
        logout,
        checkSession
    };
};
