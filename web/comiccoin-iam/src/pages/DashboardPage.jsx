// monorepo/web/comiccoin-iam/src/pages/DashboardPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Wallet,
  Plus,
  Eye,
  ArrowRight,
  ChevronRight,
  Activity,
  Bookmark,
  Users,
  Loader,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import AppTopNavigation from "../components/AppTopNavigation";
import AppFooter from "../components/AppFooter";
import withProfileVerification from "../components/withProfileVerification";
import { useGetMe } from "../hooks/useGetMe";
import { useGetDashboard } from "../hooks/useGetDashboard";

function DashboardPage() {
  const { user } = useGetMe();
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error, refetch } = useGetDashboard();

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
  const handleViewWallet = (walletId) => {
    navigate(`/wallet/${walletId}`);
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
        <AppTopNavigation />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700">
              Loading dashboard data...
            </h2>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <AppTopNavigation />
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
        <AppFooter />
      </div>
    );
  }

  // Sort wallets by creation date (most recent first) and take top 5
  const recentWallets = dashboard?.publicWallets
    ? [...dashboard.publicWallets]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AppTopNavigation />

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

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Wallets Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Wallets</p>
                <p className="text-2xl font-bold text-gray-800">
                  {dashboard?.totalWalletsCount || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Active Wallets */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Wallets</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboard?.activeWalletsCount || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Total Profile Views
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboard?.totalWalletViewsCount || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Unique Views - New Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Unique Profile Views
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {dashboard?.totalUniqueWalletViewsCount || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboard?.uniqueViewsPercentage}% of total views
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Wallets Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Public Wallets
            </h2>
            <Link
              to="/public-wallets"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {recentWallets.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Wallet
                        className="h-5 w-5 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {formatAddress(
                          getAddressFromEthereumObject(wallet.address),
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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

                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{wallet.view_count}</span>
                    </div>

                    <button
                      onClick={() => handleViewWallet(wallet.id)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                      aria-label={`View details for ${wallet.name}`}
                    >
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No wallets found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't created any public wallets yet.
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

          {recentWallets.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <Link
                to="/public-wallets"
                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center justify-center sm:justify-start"
              >
                See all {dashboard?.totalWalletsCount || 0} wallets
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default withProfileVerification(DashboardPage);
