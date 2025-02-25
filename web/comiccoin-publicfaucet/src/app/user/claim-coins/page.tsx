// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/claim-coins/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import useClaimCoins from "@/hooks/useClaimCoins";
import { useGetFaucet } from "@/hooks/useGetFaucet";
import { Coins, Gift, Clock } from "lucide-react";
import { toast } from "sonner";

const ClaimCoinsPage = () => {
  const router = useRouter();
  const { updateUser } = useMe();
  const { claimCoins, isLoading: isClaimingCoins } = useClaimCoins();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);

  // Prevent iOS scroll bounce and improve touch interactions
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.body.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    // Prevent iOS scroll bounce
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.removeEventListener("touchmove", preventTouchMove);
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, []);

  // Use the faucet hook to get daily_coins_reward
  const chainId = 1;
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

      // Step 3: Show success toast and redirect
      toast.success("Coins Claimed!", {
        description: `You've claimed ${dailyReward} ComicCoins`,
        duration: 3000,
      });

      // Redirect to dashboard
      router.push("/user/dashboard");
    } catch (err) {
      // Use toast for error handling
      toast.error("Claim Failed", {
        description: err instanceof Error ? err.message : "Unable to claim coins",
      });
      console.error("Error during claim process:", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-purple-50 py-4 px-4 touch-manipulation"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Main Content Container */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Comic-style Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-800 mb-2">
            Claim Your ComicCoins!
          </h1>
          <p className="text-sm text-purple-600">
            Your daily ComicCoins are ready to be claimed
          </p>
        </div>

        {/* Claim Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* Reward Header */}
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-purple-800">
                Daily Reward Ready!
              </h2>
              <p className="text-xs text-gray-600">
                Claim your {dailyReward} ComicCoins today
              </p>
            </div>
          </div>

          {/* Reward Display */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-xs text-purple-600 mb-1">
                Today's Reward
              </p>
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-purple-600" />
                <span className="text-xl font-bold text-purple-700">
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
            onTouchStart={() => setIsTouchActive(true)}
            onTouchEnd={() => setIsTouchActive(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl py-3 px-4 text-base font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {isClaimingCoins ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Claiming...
              </>
            ) : (
              <>
                <Coins className="h-5 w-5" />
                Claim ComicCoins
              </>
            )}
          </button>
        </div>

        {/* Next Claim Time Information */}
        <div className="bg-white rounded-xl p-4 border border-purple-100">
          <h3 className="text-base font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            When can I claim again?
          </h3>
          <p className="text-xs text-gray-600">
            You can claim ComicCoins once every 24 hours. After claiming,
            you'll need to wait until tomorrow to claim again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimCoinsPage;
