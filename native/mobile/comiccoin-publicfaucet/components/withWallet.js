// components/withWallet.jsx
import React, { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../hooks/useAuth";

/**
 * Higher-Order Component that checks if a user has a wallet address configured.
 * If not, it redirects them to the wallet setup flow.
 *
 * @param {React.Component} WrappedComponent - The component to wrap with wallet checking
 * @returns {React.Component} - A new component with wallet checking functionality
 */
function withWallet(WrappedComponent) {
  function WalletWrapper(props) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    console.log("🧐 withWallet HOC received user:", user);

    // Check if the user has a wallet address (checking both camelCase and snake_case properties)
    const hasWallet = React.useMemo(() => {
      const walletExists = !!(user?.wallet_address || user?.walletAddress);
      const walletAddress = user?.wallet_address || user?.walletAddress;

      console.log("🔍 Wallet check:", {
        walletExists,
        address: walletAddress,
      });

      return walletExists;
    }, [user?.wallet_address, user?.walletAddress]);

    // Redirect if needed (only on initial mount)
    useEffect(() => {
      // Check if we're already in the user initialization flow
      const isInitFlow = pathname.includes("user-initialization");

      console.log("🔍 withWallet check:", {
        hasWallet,
        isInitFlow,
        walletAddress: user?.wallet_address || user?.walletAddress,
        pathname,
      });

      // If the user doesn't have a wallet and we're not already in the initialization flow,
      // redirect to the wallet setup screen
      if (!isInitFlow && user && !hasWallet) {
        console.log("🔄 No wallet found, redirecting to setup page");
        router.push("/(user-initialization)/add-wallet");
      }
    }, [user, hasWallet, pathname, router]);

    // Pass wallet information to the wrapped component
    return (
      <WrappedComponent
        {...props}
        hasWallet={hasWallet}
        walletAddress={user?.wallet_address || user?.walletAddress || null}
      />
    );
  }

  // Set display name for easier debugging
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  WalletWrapper.displayName = `withWallet(${displayName})`;

  return React.memo(WalletWrapper);
}

export default withWallet;
