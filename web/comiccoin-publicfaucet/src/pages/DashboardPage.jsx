// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../api/endpoints/dashboardApi";

function DashboardPage() {
  const { user, logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState("");

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();

  // Create a stable formatted time function using useCallback
  const getFormattedTimeUntilNextClaim = useCallback(() => {
    if (!dashboardData) return "";

    const nextClaimTime = new Date(dashboardData.next_claim_time).getTime();
    const now = Date.now();
    const milliseconds = Math.max(0, nextClaimTime - now);

    if (milliseconds === 0) {
      return "Ready to claim";
    }

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, [dashboardData]);

  // Check if refetch is needed
  const shouldRefetch = useCallback(() => {
    if (!dashboardData) return false;

    const nextClaimTime = new Date(dashboardData.next_claim_time).getTime();
    const now = Date.now();
    return now >= nextClaimTime;
  }, [dashboardData]);

  // Update time remaining every second with stable dependencies
  useEffect(() => {
    if (!dashboardData) return;

    // Update immediately
    setTimeRemaining(getFormattedTimeUntilNextClaim());

    // Then update every second
    const interval = setInterval(() => {
      setTimeRemaining(getFormattedTimeUntilNextClaim());

      // If time has reached zero, refresh the data
      if (shouldRefetch()) {
        refetch();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dashboardData, getFormattedTimeUntilNextClaim, shouldRefetch, refetch]);

  // Format a timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading)
    return <div className="text-center py-10">Loading dashboard...</div>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        Error loading dashboard: {error.message}
      </div>
    );

  // If dashboardData is undefined even after loading is complete, show an error
  if (!dashboardData) {
    return (
      <div className="text-center py-10 text-yellow-600">
        No dashboard data available. Please try again later.
      </div>
    );
  }

  // Now we know dashboardData exists, so we can safely access its properties
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with logout button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* User info card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome, {user?.name || "User"}!
        </h2>
        <p className="text-gray-600">
          You are logged in as {user?.email || "unknown"}
        </p>
        {user?.role && (
          <p className="text-gray-600 mt-2">Role: {getRoleName(user.role)}</p>
        )}
      </div>

      {/* Wallet and balance information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Wallet</h2>
          {dashboardData.wallet_address ? (
            <>
              <p className="text-gray-600 mb-2">Address:</p>
              <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
                {dashboardData.wallet_address}
              </p>
              <p className="mt-4 text-gray-600">
                Balance:{" "}
                <span className="font-semibold">
                  {dashboardData.user_balance.toLocaleString()} COMIC
                </span>
              </p>
            </>
          ) : (
            <p className="text-yellow-600">No wallet connected yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Faucet Status</h2>
          <p className="text-gray-600 mb-2">
            Faucet Balance:{" "}
            <span className="font-semibold">
              {dashboardData.faucet_balance.toLocaleString()} COMIC
            </span>
          </p>
          <p className="text-gray-600 mb-2">
            You've Claimed:{" "}
            <span className="font-semibold">
              {dashboardData.total_coins_claimed.toLocaleString()} COMIC
            </span>
          </p>
          <p className="text-gray-600 mb-2">
            Last Claim:{" "}
            <span className="font-semibold">
              {formatDate(dashboardData.last_claim_time)}
            </span>
          </p>
          <div className="mt-4">
            {dashboardData.can_claim ? (
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Claim Tokens Now
              </button>
            ) : (
              <div>
                <p className="text-gray-600">Next claim available in:</p>
                <p className="text-lg font-semibold">{timeRemaining}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

        {!dashboardData.transactions ||
        dashboardData.transactions.length === 0 ? (
          <p className="text-gray-600">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left text-gray-500">Time</th>
                  <th className="px-4 py-2 text-right text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.transactions.map((tx) => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-sm">
                      {tx.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-2">{formatDate(tx.timestamp)}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {tx.amount.toLocaleString()} COMIC
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to convert role number to a readable name
function getRoleName(roleNumber) {
  const roles = {
    1: "Basic User",
    2: "Premium User",
    3: "Admin",
    4: "Super Admin",
  };

  return roles[roleNumber] || `Role ${roleNumber}`;
}

export default DashboardPage;
