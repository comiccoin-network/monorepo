// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/claim-coins/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import useClaimCoins from "@/hooks/useClaimCoins";
import { useGetFaucet } from "@/hooks/useGetFaucet";
import { Coins, Gift, Clock } from "lucide-react";
import { API_CONFIG } from "@/config/env";

const ClaimCoinsPage = () => {
  const router = useRouter();
  const { updateUser } = useMe();
  const { claimCoins, isLoading: isClaimingCoins } = useClaimCoins();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Use the faucet hook to get daily_coins_reward
  // Assuming chainId is 1, update with the correct chainId from your config
  const chainId = API_CONFIG.chainId || 1;
  const {
    faucet,
    isLoading: isFaucetLoading,
    error: faucetError,
  } = useGetFaucet(chainId, {
    refreshInterval: 60000, // Refresh every minute
  });

  // Get the daily reward amount from faucet data
  const dailyReward = faucet?.daily_coins_reward || 2; // Fallback to 2 if not available yet

  const handleClaimCoins = async () => {
    try {
      // Step 1: Claim coins and get updated user data
      const updatedUserData = await claimCoins();

      // Step 2: Save updated user profile
      updateUser(updatedUserData);

      // Step 3: Show success animation and redirect
      setShowSuccessAnimation(true);
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error during claim process:", err);
      // Handle error appropriately
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto">
        {/* Comic-style Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold text-purple-800 mb-4"
            style={{ fontFamily: "Comic Sans MS, cursive" }}
          >
            Time to Claim Your ComicCoins!
          </h1>
          <p className="text-lg text-purple-600">
            Your daily ComicCoins are ready to be claimed
          </p>
        </div>

        {/* Claim Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-3 rounded-full">
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-purple-800">
                Daily Reward Ready!
              </h2>
              <p className="text-gray-600">
                Claim your {dailyReward} ComicCoins today
              </p>
            </div>
          </div>

          {/* Reward Display */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-purple-600 mb-2">Today's Reward</p>
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-700">
                  {isFaucetLoading ? (
                    <span className="text-sm opacity-70">Loading...</span>
                  ) : (
                    `${dailyReward} CC`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaimCoins}
            disabled={isClaimingCoins || isFaucetLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isClaimingCoins ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                Claiming your coins...
              </>
            ) : (
              <>
                <Coins className="h-6 w-6" />
                Claim Your ComicCoins
              </>
            )}
          </button>
        </div>

        {/* Next Claim Time Information */}
        <div className="bg-white rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            When can I claim again?
          </h3>
          <p className="text-gray-600">
            You can claim ComicCoins once every 24 hours. After claiming, you'll
            need to wait until tomorrow to claim again.
          </p>
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600">You've claimed {dailyReward} CC!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimCoinsPage;
