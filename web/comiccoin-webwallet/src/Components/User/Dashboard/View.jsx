// src/Components/User/Dashboard/View.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '../../../Hooks/useWallet';
import { Navigate } from "react-router-dom";
import { AlertCircle, Copy, RefreshCw, Loader2 } from 'lucide-react';

function DashboardPage() {
  console.log('DashboardPage: Component rendering');

  const {
    currentWallet,
    wallets,
    loadWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  console.log('DashboardPage: Wallet hook state:', {
    hasCurrentWallet: !!currentWallet,
    walletsCount: wallets?.length,
    serviceLoading,
    serviceError
  });

  const [forceURL, setForceURL] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('DashboardPage: Initial useEffect running');
    let mounted = true;

    const checkWalletSession = async () => {
      console.log('DashboardPage: checkWalletSession starting');
      try {
        if (!mounted) return;
        setIsLoading(true);

        // Important: Wait for service loading to complete
        if (serviceLoading) {
          console.log('DashboardPage: Service still loading, waiting...');
          return;
        }

        console.log('DashboardPage: Current wallet state:', {
          currentWallet,
          walletAddress: currentWallet?.address
        });

        if (!currentWallet) {
          console.log('DashboardPage: No current wallet found, redirecting to login');
          if (mounted) {
            setForceURL("/login");
          }
          return;
        }

        // If we get here, we have a wallet, so clear any pending redirects
        if (mounted) {
          setForceURL("");
          setWalletAddress(currentWallet.address);
          setBalance("1000"); // Mock balance
        }

      } catch (error) {
        console.error('DashboardPage: Session check error:', error);
        if (error.message === "Session expired" && mounted) {
          handleSessionExpired();
        } else if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkWalletSession();

    // Set up periodic session checks
    const sessionCheckInterval = setInterval(checkWalletSession, 60000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [currentWallet, serviceLoading]); // Added serviceLoading to dependencies

  const handleSessionExpired = () => {
    setIsSessionExpired(true);
    logout();
    setError("Your session has expired. Please sign in again.");
    setTimeout(() => {
      setForceURL("/login");
    }, 3000);
  };

  const handleRefreshBalance = async () => {
    try {
      setBalance("1000"); // Mock balance
    } catch (error) {
      if (error.message === "Session expired") {
        handleSessionExpired();
      } else {
        setError(error.message);
      }
    }
  };

  const handleSignOut = () => {
    logout();
    setForceURL("/login");
  };

  // Only navigate if we're not loading and we have a URL to go to
  if (forceURL !== "" && !serviceLoading) {
    console.log('DashboardPage: Navigating to:', forceURL);
    return <Navigate to={forceURL} />;
  }

  // Show loading state while service is initializing
  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">DASHBOARD</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Session expired. Redirecting to login...</span>
          </div>
        )}

        {currentWallet && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-600">
                Wallet Address
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={walletAddress}
                  className="flex-1 p-2 bg-white border rounded"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Copy address"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-600">
                Balance
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold">{balance}</span>
                <span className="text-gray-500">COMIC</span>
                <button
                  onClick={handleRefreshBalance}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Refresh balance"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
