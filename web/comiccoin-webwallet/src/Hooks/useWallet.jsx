// monorepo/web/comiccoin-webwallet/src/Hooks/useWallet.js
import { useState, useEffect } from 'react'
import walletService from '../Services/WalletService'

export const useWallet = () => {
    const [currentWallet, setCurrentWallet] = useState(null)
    const [wallets, setWallets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const initializeWalletService = async () => {
            try {
                await walletService.initialize()
                setWallets(walletService.getWallets())

                try {
                    const activeWallet = walletService.getCurrentWallet()
                    if (activeWallet) {
                        console.log('Active wallet found:', {
                            address: activeWallet.address,
                            hasAddress: !!activeWallet.address,
                        })
                        setCurrentWallet(activeWallet)
                    }
                } catch (sessionError) {
                    console.log('No active wallet session')
                }

                setIsInitialized(true)
            } catch (err) {
                console.error('Wallet initialization error:', err)
                setError('Failed to initialize wallet service')
            } finally {
                setLoading(false)
            }
        }

        initializeWalletService()
    }, [])

    const createWallet = async (mnemonic, password) => {
        try {
            setError(null)
            setLoading(true)

            const newWallet = await walletService.createWalletFromMnemonic(mnemonic, password)
            console.log('New wallet created:', {
                address: newWallet.address,
                hasAddress: !!newWallet.address,
            })

            setWallets(walletService.getWallets())

            const loadedWallet = await walletService.loadWallet(newWallet.id, password)
            console.log('Wallet loaded:', {
                address: loadedWallet.address,
                hasAddress: !!loadedWallet.address,
            })

            setCurrentWallet(loadedWallet)

            return newWallet
        } catch (err) {
            console.error('Wallet creation error:', err)
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const loadWallet = async (id, password) => {
        try {
            setError(null)
            setLoading(true)

            const wallet = await walletService.loadWallet(id, password)
            console.log('Wallet loaded:', {
                address: wallet.address,
                hasAddress: !!wallet.address,
            })

            setCurrentWallet(wallet)

            return wallet
        } catch (err) {
            console.error('Wallet loading error:', err)
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        currentWallet,
        wallets,
        loading,
        error,
        isInitialized,
        createWallet,
        loadWallet,
        logout: () => {
            walletService.logout()
            setCurrentWallet(null)
        },
        checkSession: walletService.checkSession.bind(walletService),
    }
}
