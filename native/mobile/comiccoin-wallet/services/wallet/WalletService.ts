// monorepo/native/mobile/comiccoin-wallet/services/wallet/WalletService.ts
import { ethers } from "ethers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import CryptoJS from "crypto-js";

// Define our wallet data structure with TypeScript for better type safety
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
      // Load encrypted wallets from AsyncStorage
      const encryptedWallets = await AsyncStorage.getItem(
        this.WALLET_STORAGE_KEY,
      );
      if (encryptedWallets) {
        this.wallets = JSON.parse(encryptedWallets);
      }

      // Check for active session
      const activeWalletData = await AsyncStorage.getItem(
        this.ACTIVE_WALLET_KEY,
      );
      if (activeWalletData && this.checkSession()) {
        const { id, wallet } = JSON.parse(activeWalletData);
        // Create wallet from private key
        this.currentWallet = new ethers.Wallet(wallet.privateKey);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize wallet service:", error);
      throw new Error("Wallet initialization failed");
    }
  }

  async createWalletFromMnemonic(
    mnemonic: string,
    password: string,
  ): Promise<WalletData> {
    try {
      const normalizedMnemonic = mnemonic.trim().toLowerCase();
      // Create wallet from mnemonic
      const hdNode = ethers.HDNodeWallet.fromPhrase(normalizedMnemonic);

      // Generate a unique ID using expo-crypto
      const walletData: WalletData = {
        id: Crypto.randomUUID(),
        address: hdNode.address,
        encryptedPrivateKey: this.encryptData(hdNode.privateKey, password),
        createdAt: Date.now(),
        lastAccessed: Date.now(),
      };

      this.wallets.push(walletData);
      await this.saveWallets();

      return walletData;
    } catch (error) {
      console.error("Wallet creation error:", error);
      throw error;
    }
  }

  async loadWallet(id: string, password: string): Promise<ethers.Wallet> {
    try {
      const walletData = this.wallets.find((w) => w.id === id);
      if (!walletData) {
        throw new Error("Wallet not found");
      }

      // Decrypt private key
      const privateKey = this.decryptData(
        walletData.encryptedPrivateKey,
        password,
      );

      // Create wallet instance
      this.currentWallet = new ethers.Wallet(privateKey);

      // Verify address matches for security
      if (
        this.currentWallet.address.toLowerCase() !==
        walletData.address.toLowerCase()
      ) {
        throw new Error("Wallet address mismatch");
      }

      // Update last accessed timestamp
      walletData.lastAccessed = Date.now();
      this.lastActivity = Date.now();

      // Save active wallet session
      await AsyncStorage.setItem(
        this.ACTIVE_WALLET_KEY,
        JSON.stringify({
          id: walletData.id,
          wallet: {
            address: this.currentWallet.address,
            privateKey: privateKey,
          },
        }),
      );

      await this.saveWallets();

      return this.currentWallet;
    } catch (error) {
      console.error("Failed to load wallet:", error);
      throw new Error("Failed to load wallet");
    }
  }

  getCurrentWallet(): ethers.Wallet {
    if (!this.checkSession()) {
      throw new Error("Session expired");
    }
    if (!this.currentWallet) {
      throw new Error("No wallet loaded");
    }
    return this.currentWallet;
  }

  checkSession(): boolean {
    const now = Date.now();
    if (now - this.lastActivity > this.sessionTimeout) {
      this.logout();
      return false;
    }
    this.lastActivity = now;
    return true;
  }

  async logout(): Promise<void> {
    this.currentWallet = null;
    this.lastActivity = null;
    await AsyncStorage.removeItem(this.ACTIVE_WALLET_KEY);
  }

  private encryptData(data: string, password: string): string {
    try {
      return CryptoJS.AES.encrypt(data, password).toString();
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Encryption failed");
    }
  }

  private decryptData(encryptedData: string, password: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, password);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Decryption failed");
    }
  }

  private async saveWallets(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.WALLET_STORAGE_KEY,
        JSON.stringify(this.wallets),
      );
    } catch (error) {
      console.error("Failed to save wallets:", error);
      throw new Error("Failed to save wallets");
    }
  }

  getWallets(): Array<Omit<WalletData, "encryptedPrivateKey">> {
    return this.wallets.map(({ id, address, createdAt, lastAccessed }) => ({
      id,
      address,
      createdAt,
      lastAccessed,
    }));
  }
}

// Create a singleton instance
const walletService = new WalletService();
export default walletService;
