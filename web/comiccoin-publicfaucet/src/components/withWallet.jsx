// src/components/withWallet.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

/**
 * Higher-Order Component that checks if a user has a wallet connected
 * If not, redirects them to the wallet setup page
 */
function withWallet(WrappedComponent) {
  function WalletWrapper(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // Reuse your existing auth hook

    // Check if the user has a wallet address
    const hasWallet = React.useMemo(
      () => !!user?.walletAddress,
      [user?.walletAddress],
    );

    // Redirect if needed (only on initial mount)
    useEffect(() => {
      console.log("🔍 Checking wallet status:", {
        hasWallet,
        walletAddress: user?.walletAddress,
      });

      const isInitFlow = location.pathname.includes("/user-initialization");
      if (!isInitFlow && user && !user.walletAddress) {
        console.log("🔄 No wallet found, redirecting to setup page");
        navigate("/user-initialization/add-my-wallet-address");
      }
    }, []);

    // Pass wallet information to the wrapped component
    return (
      <WrappedComponent
        {...props}
        hasWallet={hasWallet}
        walletAddress={user?.walletAddress || null}
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
