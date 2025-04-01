// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Wallet,
  Plus,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  BarChart,
  Activity,
  Users,
  Bookmark,
} from "lucide-react";
import AppTopNavigation from "../components/AppTopNavigation";
import AppFooter from "../components/AppFooter";
import withProfileVerification from "../components/withProfileVerification";
import { useGetMe } from "../hooks/useGetMe";

function DashboardPage({ error, dashboardData, refetch }) {
  const { user } = useGetMe();
  const navigate = useNavigate();

  // Sample wallet data - In a real application, this would come from an API
  const [wallets, setWallets] = useState([
    {
      id: "1",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      name: "Primary Collectibles Wallet",
      description:
        "My main wallet for comic book collectibles and special editions",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 432,
      createdAt: "2025-03-15",
      status: "active",
    },
    {
      id: "2",
      address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      name: "Comic-Con Exclusive Drops",
      description:
        "Special wallet for limited edition Comic-Con exclusive items and partnerships",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 278,
      createdAt: "2025-03-10",
      status: "active",
    },
    {
      id: "3",
      address: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
      name: "Vintage Collection",
      description:
        "Dedicated wallet for pre-1990s comic NFTs and digital memorabilia",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 189,
      createdAt: "2025-02-22",
      status: "inactive",
    },
    {
      id: "4",
      address: "0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C",
      name: "Trading Portfolio",
      description:
        "Active wallet for trading and short-term holdings in the ComicCoin ecosystem",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 321,
      createdAt: "2025-03-05",
      status: "active",
    },
    {
      id: "5",
      address: "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47",
      name: "Artist Collaborations",
      description:
        "Wallet for artist collaborations and supporting indie comic creators",
      thumbnail: "/api/placeholder/80/80",
      viewCount: 157,
      createdAt: "2025-03-12",
      status: "inactive",
    },
  ]);

  // Sort wallets by creation date (most recent first) and take top 5
  const recentWallets = [...wallets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Analytics data (sample data - would come from API in real app)
  const analyticsData = {
    totalWallets: wallets.length,
    totalViews: wallets.reduce((sum, wallet) => sum + wallet.viewCount, 0),
    activeWallets: wallets.filter((wallet) => wallet.status === "active")
      .length,
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
    navigate("/add-wallet");
  };

  // Navigate to wallet detail page
  const handleViewWallet = (walletId) => {
    navigate(`/wallet/${walletId}`);
  };

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
                  {analyticsData.totalWallets}
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
                  {analyticsData.activeWallets}
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
                  {analyticsData.totalViews}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Featured Collections */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Featured Collections
                </p>
                <p className="text-2xl font-bold text-amber-600">2</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-amber-600" />
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
                        {wallet.address.slice(0, 6)}...
                        {wallet.address.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${wallet.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full mr-1.5 ${wallet.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                      ></span>
                      {wallet.status === "active" ? "Active" : "Inactive"}
                    </span>

                    <div className="flex items-center text-gray-500 text-sm">
                      <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>{wallet.viewCount}</span>
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
                See all {wallets.length} wallets
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed - Just a placeholder for now */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6 text-center text-gray-500">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Your recent activity will appear here.</p>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default withProfileVerification(DashboardPage);
