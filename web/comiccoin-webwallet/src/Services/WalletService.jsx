// monorepo/native/mobile/comiccoin-wallet/services/wallet/WalletService.ts
import { HDNodeWallet, Wallet } from 'ethers/wallet'
import CryptoJS from 'crypto-js'

class WalletService {
    constructor() {
        this.currentWallet = null
        this.wallets = []
        this.isInitialized = false
        this.sessionTimeout = 30 * 60 * 1000 // 30 minutes
        this.lastActivity = Date.now()
    }

    async initialize() {
        if (this.isInitialized) return

        try {
            const encryptedWallets = localStorage.getItem('comicCoinWallets')
            if (encryptedWallets) {
                this.wallets = JSON.parse(encryptedWallets)
            }

            // Check for active session
            const activeWalletData = localStorage.getItem('activeWallet')
            if (activeWalletData) {
                const { id, wallet } = JSON.parse(activeWalletData)
                if (this.checkSession()) {
                    // Create wallet directly from private key
                    this.currentWallet = new Wallet(wallet.privateKey)
                } else {
                    // Clear expired session
                    localStorage.removeItem('activeWallet')
                }
            }

            this.isInitialized = true
        } catch (error) {
            console.error('Failed to initialize wallet service:', error)
            throw new Error('Wallet initialization failed')
        }
    }

    async createWalletFromMnemonic(mnemonic, password) {
        try {
            const normalizedMnemonic = mnemonic.trim().toLowerCase()
            const hdWallet = HDNodeWallet.fromPhrase(normalizedMnemonic)

            // Developers Note: Don't store the mnemonic phrase,
            // Most web3 wallets (like MetaMask) do NOT store the mnemonic
            // phrase but require users to write it down during wallet creation.

            const walletData = {
                id: this.generateUUID(),
                address: hdWallet.address,
                encryptedPrivateKey: this.encryptData(hdWallet.privateKey, password),
                createdAt: Date.now(),
                lastAccessed: Date.now(),
            }

            this.wallets.push(walletData)
            this.saveWallets()

            return walletData
        } catch (error) {
            console.error('Wallet creation error:', error)
            throw error
        }
    }

    async loadWallet(id, password) {
        try {
            const walletData = this.wallets.find((w) => w.id === id)
            if (!walletData) {
                throw new Error('Wallet not found')
            }

            // Decrypt private key
            const privateKey = this.decryptData(walletData.encryptedPrivateKey, password)

            // Create wallet instance directly from private key
            this.currentWallet = new Wallet(privateKey)

            // Verify address matches
            if (this.currentWallet.address.toLowerCase() !== walletData.address.toLowerCase()) {
                throw new Error('Wallet address mismatch')
            }

            // Update last accessed
            walletData.lastAccessed = Date.now()
            this.lastActivity = Date.now()

            // Save active wallet session
            localStorage.setItem(
                'activeWallet',
                JSON.stringify({
                    id: walletData.id,
                    wallet: {
                        address: this.currentWallet.address,
                        privateKey: privateKey,
                    },
                })
            )

            this.saveWallets()

            return this.currentWallet
        } catch (error) {
            console.error('Failed to load wallet:', error)
            throw new Error('Failed to load wallet')
        }
    }

    // Developers note:
    generateUUID() {
        // First try the standard crypto.randomUUID()
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID()
        }

        // Fallback implementation
        // The error 'crypto.randomUUID is not a function' occurs because
        // crypto.randomUUID() is not universally supported on all browsers,
        // particularly on older Android Chrome versions.
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    getCurrentWallet() {
        if (!this.checkSession()) {
            throw new Error('Session expired')
        }
        if (!this.currentWallet) {
            throw new Error('No wallet loaded')
        }
        return this.currentWallet
    }

    checkSession() {
        const now = Date.now()
        if (now - this.lastActivity > this.sessionTimeout) {
            this.logout()
            return false
        }
        this.lastActivity = now
        return true
    }

    logout() {
        this.currentWallet = null
        this.lastActivity = null
        localStorage.removeItem('activeWallet')
    }

    encryptData(data, password) {
        try {
            return CryptoJS.AES.encrypt(data, password).toString()
        } catch (error) {
            console.error('Encryption failed:', error)
            throw new Error('Encryption failed')
        }
    }

    decryptData(encryptedData, password) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, password)
            return bytes.toString(CryptoJS.enc.Utf8)
        } catch (error) {
            console.error('Decryption failed:', error)
            throw new Error('Decryption failed')
        }
    }

    saveWallets() {
        try {
            localStorage.setItem('comicCoinWallets', JSON.stringify(this.wallets))
        } catch (error) {
            console.error('Failed to save wallets:', error)
            throw new Error('Failed to save wallets')
        }
    }

    getWallets() {
        return this.wallets.map(({ id, address, createdAt, lastAccessed }) => ({
            id,
            address,
            createdAt,
            lastAccessed,
        }))
    }
}

const walletService = new WalletService()
export default walletService
