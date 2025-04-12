// monorepo/web/comiccoin-iam/src/pages/Individual/Dashboard/Page.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Wallet,
  Plus,
  Eye,
  ArrowRight,
  Share2,
  Activity,
  UserCheck,
  Loader,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit,
} from "lucide-react";
import UserTopNavigation from "../../../components/UserTopNavigation";
import UserFooter from "../../../components/UserFooter";
import withProfileVerification from "../../../components/withProfileVerification";
import { useGetMe } from "../../../hooks/useGetMe";
import { useGetDashboard } from "../../../hooks/useGetDashboard";
import { QRCodeSVG } from "qrcode.react";

function UserDashboardPage() {
  const { user } = useGetMe();
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error, refetch } = useGetDashboard();

  //  Simple notification function UI State
  const [notification, setNotification] = useState(null);

  // Simple notification function
  const showNotification = (message) => {
    setNotification(message);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    console.log("DASHBOARD MOUNTED", {
      user,
      verificationStatus: user?.profile_verification_status,
      pathname: window.location.pathname,
      time: new Date().toISOString(),
    });

    return () => {
      console.log("DASHBOARD UNMOUNTED", {
        time: new Date().toISOString(),
      });
    };
  }, [user]);

  // Navigate to add wallet page
  const handleAddWallet = () => {
    navigate("/public-wallets/add");
  };

  // Navigate to wallet detail page
  const handleViewWallet = (address) => {
    navigate(`/public-wallet/${address}`);
  };

  // Copy wallet address to clipboard with simple notification.
  const copyAddress = (address) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        showNotification("Address copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  // Share wallet functionality with simple notification.
  const handleShareWallet = (address) => {
    const publicUrl = `${window.location.origin}/public/${address}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        showNotification("Public wallet link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address || typeof address !== "string") return "Invalid Address";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Extract wallet address from common.Address object
  const getAddressFromEthereumObject = (addressObj) => {
    if (!addressObj) return null;
    // Extract the address string assuming it's in the Ethereum address object
    return addressObj.Hex
      ? addressObj.Hex
      : addressObj.hex
        ? addressObj.hex
        : addressObj.toString();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <UserTopNavigation />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700">
              Loading dashboard data...
            </h2>
          </div>
        </main>
        <UserFooter />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <UserTopNavigation />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-red-700 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-600 mb-4">
              {error.message ||
                "We couldn't load your dashboard data. Please try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </main>
        <UserFooter />
      </div>
    );
  }

  // Get all wallets
  const wallets = dashboard?.publicWallets || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <UserTopNavigation />

      {/* Simple Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {notification}
        </div>
      )}

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-purple-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.first_name || "Comic Collector"}!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleAddWallet}
              className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              aria-label="Add new public wallet"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              <span className="font-medium">Add New Wallet</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              <p className="text-gray-600 text-sm">Total Wallets</p>
            </div>
            <p className="text-2xl font-bold mt-2">
              {dashboard?.totalWalletsCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <p className="text-gray-600 text-sm">Active Wallets</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {dashboard?.activeWalletsCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <p className="text-gray-600 text-sm">Total Views</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-600">
              {dashboard?.totalWalletViewsCount || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              <p className="text-gray-600 text-sm">Unique Views</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-600">
              {dashboard?.totalUniqueWalletViewsCount || 0}
            </p>
          </div>
        </div>

        {/* Main Content Section - Wallet Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Your Public Wallets
            </h2>
          </div>

          {wallets.length > 0 ? (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {wallets.map((wallet) => {
                const walletAddress = getAddressFromEthereumObject(
                  wallet.address,
                );
                return (
                  <div
                    key={wallet.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
                  >
                    {/* Card Header with Status */}
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
                      <h3 className="font-bold truncate">{wallet.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          wallet.status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-1.5 ${
                            wallet.status === 1 ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                        {wallet.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Card Body with QR Code and Info */}
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* QR Code */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
                            <QRCodeSVG
                              value={walletAddress}
                              size={120}
                              level="H"
                              imageSettings={{
                                src: "/logo192.png",
                                height: 24,
                                width: 24,
                                excavate: true,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            Scan to view
                          </div>
                        </div>

                        {/* Wallet Details */}
                        <div className="flex-grow space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Address
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                {formatAddress(walletAddress)}
                              </code>
                              <button
                                onClick={() => copyAddress(walletAddress)}
                                className="p-1 text-gray-500 hover:text-purple-600"
                                aria-label="Copy address"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {wallet.description && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Description
                              </p>
                              <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                                {wallet.description}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-4 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">
                                Total Views
                              </p>
                              <div className="flex items-center gap-1 text-blue-600">
                                <Eye className="h-4 w-4" />
                                <span className="font-bold">
                                  {wallet.view_count}
                                </span>
                              </div>
                            </div>

                            {wallet.unique_view_count !== undefined && (
                              <div>
                                <p className="text-xs text-gray-500">
                                  Unique Views
                                </p>
                                <div className="flex items-center gap-1 text-amber-600">
                                  <UserCheck className="h-4 w-4" />
                                  <span className="font-bold">
                                    {wallet.unique_view_count}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex mt-5 pt-4 border-t border-gray-100 justify-between">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/public-wallet/${wallet.address}/edit`)
                            }
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            aria-label="Edit wallet"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleShareWallet(walletAddress)}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            aria-label="Share wallet"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleViewWallet(wallet.address)}
                          className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors font-medium text-sm"
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Wallet Card */}
              <div
                className="bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={handleAddWallet}
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Add New Wallet
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Connect a new wallet to your profile
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No wallets found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You haven't created any public wallets yet. Add your first
                wallet to start showcasing your digital assets.
              </p>
              <button
                onClick={handleAddWallet}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Wallet
              </button>
            </div>
          )}
        </div>
      </main>

      <UserFooter />
    </div>
  );
}

export default withProfileVerification(UserDashboardPage);
