// monorepo/native/mobile/comiccoin-wallet/services/wallet/WalletService.ts
import { ethers } from "ethers";
import * as SecureStore from 'expo-secure-store';
import * as Crypto from "expo-crypto";
import CryptoJS from "crypto-js";

interface WalletData {
  id: string;
  address: string;
  encryptedPrivateKey: string;
  createdAt: number;
  lastAccessed: number;
}

class WalletService {
  private currentWallet: ethers.Wallet | null = null;
  private wallets: WalletData[] = [];
  private isInitialized: boolean = false;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private lastActivity: number = Date.now();
  private readonly WALLET_STORAGE_KEY = "comicCoinWallets";
  private readonly ACTIVE_WALLET_KEY = "activeWallet";

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load encrypted wallets from SecureStore
      const encryptedWallets = await SecureStore.getItemAsync(
        this.WALLET_STORAGE_KEY
      );
      if (encryptedWallets) {
        this.wallets = JSON.parse(encryptedWallets);
      }

      // Check for active session
      const activeWalletData = await SecureStore.getItemAsync(
        this.ACTIVE_WALLET_KEY
      );
      if (activeWalletData && this.checkSession()) {
        const { id, wallet } = JSON.parse(activeWalletData);
        this.currentWallet = new ethers.Wallet(wallet.privateKey);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize wallet service:", error);
      throw new Error("Wallet initialization failed");
    }
  }

  // ... other methods remain the same until we reach storage operations ...

  async loadWallet(id: string, password: string): Promise<ethers.Wallet> {
    try {
      const walletData = this.wallets.find((w) => w.id === id);
      if (!walletData) {
        throw new Error("Wallet not found");
      }

      const privateKey = this.decryptData(
        walletData.encryptedPrivateKey,
        password
      );

      this.currentWallet = new ethers.Wallet(privateKey);

      if (
        this.currentWallet.address.toLowerCase() !==
        walletData.address.toLowerCase()
      ) {
        throw new Error("Wallet address mismatch");
      }

      walletData.lastAccessed = Date.now();
      this.lastActivity = Date.now();

      // Save active wallet session using SecureStore
      await SecureStore.setItemAsync(
        this.ACTIVE_WALLET_KEY,
        JSON.stringify({
          id: walletData.id,
          wallet: {
            address: this.currentWallet.address,
            privateKey: privateKey,
          },
        })
      );

      await this.saveWallets();

      return this.currentWallet;
    } catch (error) {
      console.error("Failed to load wallet:", error);
      throw new Error("Failed to load wallet");
    }
  }

  async logout(): Promise<void> {
    this.currentWallet = null;
    this.lastActivity = null;
    await SecureStore.deleteItemAsync(this.ACTIVE_WALLET_KEY);
  }

  private async saveWallets(): Promise<void> {
    try {
      // Since SecureStore has a 2048 byte limit, we should check the size
      const walletsJson = JSON.stringify(this.wallets);
      if (walletsJson.length > 2048) {
        throw new Error("Wallet data exceeds SecureStore size limit");
      }

      await SecureStore.setItemAsync(
        this.WALLET_STORAGE_KEY,
        walletsJson
      );
    } catch (error) {
      console.error("Failed to save wallets:", error);
      throw new Error("Failed to save wallets");
    }
  }

  // ... rest of the class remains the same ...
}

// Create a singleton instance
const walletService = new WalletService();
export default walletService;
