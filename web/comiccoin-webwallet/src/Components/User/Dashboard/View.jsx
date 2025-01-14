// src/Components/User/Dashboard/View.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '../../../Hooks/useWallet';
import { Navigate } from "react-router-dom";
import {
    Globe,
 Monitor,
 Wallet,
 AlertCircle,
 Copy,
 Download,
 RefreshCw,
 Info,
 Loader2,
 LogOut,
 Coins,
 LineChart,
 ArrowUpRight,
 ArrowDownRight,
 Send,
 Image,
 MoreHorizontal
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Navigation Header */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Wallet aria-hidden="true" className="h-8 w-8" />
              <span className="text-2xl font-bold">ComicCoin Web Wallet</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</a>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your ComicCoin wallet</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
          </div>
        )}

        {currentWallet && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Info Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Wallet Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={walletAddress}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(walletAddress)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Coins className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Balance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{balance}</p>
                      <p className="text-sm text-gray-500">COMIC</p>
                    </div>
                    <button
                      onClick={handleRefreshBalance}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Refresh balance"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <LineChart className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Receive</span>
                  </div>
                </button>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Send</span>
                  </div>
                </button>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">Trade</span>
                  </div>
                </button>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Image className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">NFTs</span>
                  </div>
                </button>

                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">More</span>
                  </div>
                </button>
              </div>

            </div>
          </div>
        )}

        {(isLoading || serviceLoading) && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading wallet data...</span>
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 ComicCoin Web Wallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;
