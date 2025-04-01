// monorepo/web/comiccoin-iam/src/components/withWallet.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

function withWallet(WrappedComponent) {
  function WalletWrapper(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    console.log("🧐 withWallet HOC received user:", user);

    // Define verification status constants
    const VERIFICATION_STATUS = {
      UNVERIFIED: 1,
      SUBMITTED_FOR_REVIEW: 2,
      APPROVED: 3,
      REJECTED: 4,
    };

    // Check if the user has a wallet address (using snake_case property)
    const hasWallet = React.useMemo(() => {
      const walletExists = !!user?.wallet_address;
      console.log("🔍 Wallet check:", {
        walletExists,
        address: user?.wallet_address,
        verificationStatus: user?.profile_verification_status,
      });
      return walletExists;
    }, [user?.wallet_address]);

    // Redirect if needed (only on initial mount and only if verification status is APPROVED)
    useEffect(() => {
      const isInitFlow = location.pathname.includes("/user-initialization");
      const isApproved =
        user?.profile_verification_status === VERIFICATION_STATUS.APPROVED;

      console.log("🔍 withWallet check:", {
        hasWallet,
        isInitFlow,
        walletAddress: user?.wallet_address,
        pathname: location.pathname,
        verificationStatus: user?.profile_verification_status,
        isApproved,
      });

      // Only redirect if user is verified (status: APPROVED), has no wallet, and not already in the init flow
      if (!isInitFlow && user && isApproved && !user.wallet_address) {
        console.log(
          "🔄 Verified user with no wallet found, redirecting to setup page",
        );
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
