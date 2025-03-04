// src/components/withWallet.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

function withWallet(WrappedComponent) {
  function WalletWrapper(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    console.log("🧐 withWallet HOC received user:", user);

    // Check if the user has a wallet address (using snake_case property)
    const hasWallet = React.useMemo(() => {
      const walletExists = !!user?.wallet_address;
      console.log("🔍 Wallet check:", {
        walletExists,
        address: user?.wallet_address,
      });
      return walletExists;
    }, [user?.wallet_address]);

    // Redirect if needed (only on initial mount)
    useEffect(() => {
      const isInitFlow = location.pathname.includes("/user-initialization");

      console.log("🔍 withWallet check:", {
        hasWallet,
        isInitFlow,
        walletAddress: user?.wallet_address,
        pathname: location.pathname,
      });

      if (!isInitFlow && user && !user.wallet_address) {
        console.log("🔄 No wallet found, redirecting to setup page");
        navigate("/user-initialization/add-my-wallet-address");
      }
    }, [user, hasWallet, location.pathname, navigate]);

    // Pass wallet information to the wrapped component
    return (
      <WrappedComponent
        {...props}
        hasWallet={hasWallet}
        walletAddress={user?.wallet_address || null}
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
