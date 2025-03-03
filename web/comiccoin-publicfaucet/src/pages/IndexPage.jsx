// src/pages/IndexPage.jsx
import { useFaucet } from "../api/endpoints/faucetApi";

function IndexPage() {
  // Fetch faucet data (public endpoint, GET only)
  const { data: faucet, isLoading, error } = useFaucet();

  if (isLoading)
    return <div className="text-center py-10">Loading faucet data...</div>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        Error loading faucet: {error.message}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ComicCoin Faucet</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Faucet Status</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-gray-600">Balance</div>
            <div className="text-xl font-medium">
              {parseInt(faucet.balance).toLocaleString()} COMIC
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="text-gray-600">Users Helped</div>
            <div className="text-xl font-medium">
              {faucet.users_count.toLocaleString()}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="text-gray-600">Daily Reward</div>
            <div className="text-xl font-medium">
              {faucet.daily_coins_reward.toLocaleString()} COMIC
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <div className="text-gray-600">Transactions Today</div>
            <div className="text-xl font-medium">
              {faucet.total_transactions_today.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">About ComicCoin Faucet</h2>
        <p className="text-gray-700 mb-4">
          The ComicCoin faucet helps developers get started with testing by
          providing a small amount of test coins.
        </p>
        <p className="text-gray-700">
          Current distribution rate:{" "}
          <span className="font-medium">
            {faucet.distribution_rate_per_day}
          </span>{" "}
          coins per day
        </p>
      </div>
    </div>
  );
}

export default IndexPage;
