// src/pages/DashboardPage.jsx
import { usePrivateQuery } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

function DashboardPage() {
  const { user, logout } = useAuth();

  // Private API call example
  const {
    data: userStats,
    isLoading,
    error,
  } = usePrivateQuery(["user-stats"], "/api/user/stats");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome, {user?.name || "User"}!
        </h2>
        <p className="text-gray-600">
          You are logged in as {user?.email || "unknown"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>

        {isLoading && <p>Loading your stats...</p>}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            Error loading stats: {error.message}
          </div>
        )}

        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display user stats here */}
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-gray-600">Total Transactions</div>
              <div className="text-xl font-medium">
                {userStats.totalTransactions}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div className="text-gray-600">Wallet Balance</div>
              <div className="text-xl font-medium">
                {userStats.balance} COMIC
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
