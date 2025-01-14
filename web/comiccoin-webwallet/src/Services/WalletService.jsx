// src/Services/WalletService.js
import { Wallet, Mnemonic } from 'ethers';
import CryptoJS from 'crypto-js';

class WalletService {
    constructor() {
        this.currentWallet = null;
        this.wallets = [];
        this.isInitialized = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            const encryptedWallets = localStorage.getItem('comicCoinWallets');
            if (encryptedWallets) {
                this.wallets = JSON.parse(encryptedWallets);
            }

            // Check for active session
            const activeWalletData = localStorage.getItem('activeWallet');
            if (activeWalletData) {
                const { id, wallet } = JSON.parse(activeWalletData);
                if (this.checkSession()) {
                    this.currentWallet = new Wallet(wallet.privateKey);
                } else {
                    // Clear expired session
                    localStorage.removeItem('activeWallet');
                }
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize wallet service:', error);
            throw new Error('Wallet initialization failed');
        }
    }

    async createWalletFromMnemonic(mnemonic, password) {
        try {
            const normalizedMnemonic = mnemonic.trim().toLowerCase();

            const mnemonicObj = Mnemonic.fromPhrase(normalizedMnemonic);
            const hdNode = Wallet.fromPhrase(normalizedMnemonic);

            const walletData = {
                id: crypto.randomUUID(),
                address: hdNode.address,
                encryptedPrivateKey: this.encryptData(hdNode.privateKey, password),
                createdAt: Date.now(),
                lastAccessed: Date.now()
            };

            this.wallets.push(walletData);
            this.saveWallets();

            return walletData;
        } catch (error) {
            console.error('Wallet creation error:', error);
            throw error;
        }
    }

    async loadWallet(id, password) {
        try {
            const walletData = this.wallets.find(w => w.id === id);
            if (!walletData) {
                throw new Error('Wallet not found');
            }

            // Decrypt private key
            const privateKey = this.decryptData(walletData.encryptedPrivateKey, password);

            // Create wallet instance
            this.currentWallet = new Wallet(privateKey);

            // Update last accessed
            walletData.lastAccessed = Date.now();
            this.lastActivity = Date.now();

            // Save active wallet session
            localStorage.setItem('activeWallet', JSON.stringify({
                id: walletData.id,
                wallet: {
                    address: this.currentWallet.address,
                    privateKey: privateKey
                }
            }));

            this.saveWallets();

            return this.currentWallet;
        } catch (error) {
            console.error('Failed to load wallet:', error);
            throw new Error('Failed to load wallet');
        }
    }

    getCurrentWallet() {
        if (!this.checkSession()) {
            throw new Error('Session expired');
        }
        if (!this.currentWallet) {
            throw new Error('No wallet loaded');
        }
        return this.currentWallet;
    }

    checkSession() {
        const now = Date.now();
        if (now - this.lastActivity > this.sessionTimeout) {
            this.logout();
            return false;
        }
        this.lastActivity = now;
        return true;
    }

    logout() {
        this.currentWallet = null;
        this.lastActivity = null;
        localStorage.removeItem('activeWallet');
    }

    encryptData(data, password) {
        try {
            return CryptoJS.AES.encrypt(data, password).toString();
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    decryptData(encryptedData, password) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, password);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Decryption failed');
        }
    }

    saveWallets() {
        try {
            localStorage.setItem('comicCoinWallets', JSON.stringify(this.wallets));
        } catch (error) {
            console.error('Failed to save wallets:', error);
            throw new Error('Failed to save wallets');
        }
    }

    checkSession() {
        const now = Date.now();
        if (now - this.lastActivity > this.sessionTimeout) {
            this.logout();
            return false;
        }
        this.lastActivity = now;
        return true;
    }

    logout() {
        this.currentWallet = null;
        this.lastActivity = null;
        // Clear sensitive data from memory
        // Note: This is a basic implementation. In production, you might want to use
        // more secure memory handling techniques
    }

    getCurrentWallet() {
        if (!this.checkSession()) {
            throw new Error('Session expired');
        }
        return this.currentWallet;
    }

    getWallets() {
        return this.wallets.map(({ id, address, createdAt, lastAccessed }) => ({
            id,
            address,
            createdAt,
            lastAccessed
        }));
    }
}

const walletService = new WalletService();
export default walletService;
