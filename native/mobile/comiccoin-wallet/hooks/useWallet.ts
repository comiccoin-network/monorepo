// monorepo/native/mobile/comiccoin-wallet/hooks/useWallet.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import walletService from "../services/wallet/WalletService";

interface WalletHookReturn {
  currentWallet: ethers.Wallet | null;
  wallets: Array<{
    id: string;
    address: string;
    createdAt: number;
    lastAccessed: number;
  }>;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  createWallet: (mnemonic: string, password: string) => Promise<any>;
  loadWallet: (id: string, password: string) => Promise<ethers.Wallet>;
  logout: () => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  checkSession: () => boolean;
}

export const useWallet = (): WalletHookReturn => {
  const [currentWallet, setCurrentWallet] = useState<ethers.Wallet | null>(
    null,
  );
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeWalletService = async () => {
      try {
        await walletService.initialize();

        if (!mounted) return;

        setWallets(walletService.getWallets());

        try {
          const activeWallet = walletService.getCurrentWallet();
          if (activeWallet) {
            console.log("Active wallet found:", {
              address: activeWallet.address,
              hasAddress: !!activeWallet.address,
            });
            setCurrentWallet(activeWallet);
          }
        } catch (sessionError) {
          console.log("No active wallet session");
        }

        setIsInitialized(true);
      } catch (err) {
        console.log("Wallet initialization error:", err);
        if (mounted) {
          setError("Failed to initialize wallet service");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeWalletService();

    return () => {
      mounted = false;
    };
  }, []);

  const createWallet = async (mnemonic: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const newWallet = await walletService.createWalletFromMnemonic(
        mnemonic,
        password,
      );
      console.log("New wallet created:", {
        address: newWallet.address,
        hasAddress: !!newWallet.address,
      });

      setWallets(walletService.getWallets());

      const loadedWallet = await walletService.loadWallet(
        newWallet.id,
        password,
      );
      console.log("Wallet loaded:", {
        address: loadedWallet.address,
        hasAddress: !!loadedWallet.address,
      });

      setCurrentWallet(loadedWallet);

      return newWallet;
    } catch (err: any) {
      console.log("Wallet creation error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async (id: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const wallet = await walletService.loadWallet(id, password);
      console.log("Wallet loaded:", {
        address: wallet.address,
        hasAddress: !!wallet.address,
      });

      setCurrentWallet(wallet);

      return wallet;
    } catch (err: any) {
      console.log("Wallet loading error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async (id: string) => {
    try {
      setError(null);
      setLoading(true);

      await walletService.deleteWallet(id);
      setWallets(walletService.getWallets());

      // If the deleted wallet was the current one, clear it
      if (
        currentWallet &&
        wallets.find((w) => w.id === id)?.address === currentWallet.address
      ) {
        setCurrentWallet(null);
      }
    } catch (err: any) {
      console.log("Wallet deletion error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentWallet,
    wallets,
    loading,
    error,
    isInitialized,
    createWallet,
    loadWallet,
    deleteWallet,
    logout: async () => {
      await walletService.logout();
      setCurrentWallet(null);
    },
    checkSession: walletService.checkSession.bind(walletService),
  };

  return {
    currentWallet,
    wallets,
    loading,
    error,
    isInitialized,
    createWallet,
    loadWallet,
    logout: async () => {
      await walletService.logout();
      setCurrentWallet(null);
    },
    checkSession: walletService.checkSession.bind(walletService),
  };
};
