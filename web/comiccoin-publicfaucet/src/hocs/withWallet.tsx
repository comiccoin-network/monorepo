import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useMe } from '../hooks/useMe';

// Props that will be passed to the wrapped component
type WithWalletProps = {
  hasWallet: boolean;
  walletAddress: string | null;
};

/**
 * Higher-Order Component that checks if a user has a wallet connected
 * If not, redirects them to the wallet setup page
 *
 * @param WrappedComponent - The component to wrap with wallet verification
 * @returns A new component that includes wallet verification logic
 */
export const withWallet = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithWalletProps>
) => {
  // Create the new component with wallet verification
  const WalletWrapper: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading } = useMe();

    // The wallet setup page path
    const WALLET_SETUP_PATH = "/user-initialization/add-my-wallet-address";

    // Check if current page is already in the initialization flow
    const isInitializationFlow = location.pathname.includes("/user-initialization");

    // Effect to check wallet status and redirect if needed
    useEffect(() => {
      // Skip if still loading user data or already in initialization flow
      if (isLoading || isInitializationFlow) return;

      console.log("👤 WALLET CHECK: User wallet status:", {
        email: user?.email,
        hasWallet: !!user?.wallet_address,
        currentPath: location.pathname,
      });

      // If user has no wallet and not in initialization flow, redirect
      if (user && !user?.wallet_address) {
        console.log("⚠️ WALLET CHECK: No wallet connected, redirecting to wallet setup...");
        navigate(WALLET_SETUP_PATH);
      }
    }, [user, isLoading, navigate, location.pathname, isInitializationFlow]);

    // Always render when in the initialization flow to prevent redirect loops
    if (isInitializationFlow) {
      return (
        <WrappedComponent
          {...props}
          hasWallet={!!(user?.wallet_address)}
          walletAddress={user?.wallet_address}
        />
      );
    }

    // If still loading user data, don't render anything yet
    if (isLoading) {
      return null;
    }

    // If user has no wallet (and not on setup page), don't render
    // as redirection will happen via the effect
    if (user && !user.wallet_address) {
      return null;
    }

    // All checks passed, render the component with wallet information
    return (
      <WrappedComponent
        {...props}
        hasWallet={true}
        walletAddress={user?.wallet_address}
      />
    );
  };

  // Add a proper display name for debugging
  const wrappedComponentName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';

  WalletWrapper.displayName = `withWallet(${wrappedComponentName})`;

  return WalletWrapper;
};

export default withWallet;
