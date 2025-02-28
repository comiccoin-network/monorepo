import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { useMe } from '../hooks/useMe'

// Props that will be passed to the wrapped component
type WithWalletProps = {
    hasWallet: boolean
    walletAddress: string | null
}

/**
 * Higher-Order Component that checks if a user has a wallet connected
 * If not, redirects them to the wallet setup page
 *
 * @param WrappedComponent - The component to wrap with wallet verification
 * @returns A new component that includes wallet verification logic
 */
export const withWallet = <P extends object>(WrappedComponent: React.ComponentType<P & WithWalletProps>) => {
    const WalletWrapper: React.FC<P> = (props) => {
        const navigate = useNavigate()
        const location = useLocation()
        const { user } = useMe() // Simplified hook only returns user

        // Memoize wallet status to avoid unnecessary re-renders
        const hasWallet = React.useMemo(() => !!user?.wallet_address, [user?.wallet_address])

        // Only redirect once on mount if needed
        useEffect(() => {
            const isInitFlow = location.pathname.includes('/user-initialization')
            if (!isInitFlow && user && !user.wallet_address) {
                navigate('/user-initialization/add-my-wallet-address')
            }
        }, []) // Empty dependency array = run once on mount

        return <WrappedComponent {...props} hasWallet={hasWallet} walletAddress={user?.wallet_address || null} />
    }

    return React.memo(WalletWrapper)
}

export default withWallet
