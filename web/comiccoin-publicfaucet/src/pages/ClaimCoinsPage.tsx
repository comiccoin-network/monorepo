import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Coins, Gift, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

// Import custom hooks
import { useMe } from "../hooks/useMe";
import { useClaimCoins } from "../hooks/useClaimCoins";
import { useGetFaucet } from "../hooks/useGetFaucet";

const ClaimCoinsPage: React.FC = () => {
  const navigate = useNavigate();
  const { refetch } = useMe();
  const { claimCoins, isLoading: isClaimingCoins } = useClaimCoins();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get faucet data
  const { faucet, isLoading: isFaucetLoading } = useGetFaucet({
    chainId: 1,
    refreshInterval: 60000, // Refresh every minute
  });

  // Get the daily reward amount from faucet data
  const dailyReward = faucet?.daily_coins_reward || 2; // Fallback to 2 if not available yet

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

  const handleClaimCoins = async () => {
    // Clear any previous error
    setErrorMessage(null);

    try {
      // Step 1: Claim coins
      await claimCoins();

      // Step 2: Refresh user profile data
      await refetch();

      // Step 3: Show success toast and redirect
      toast.success(`You've claimed ${dailyReward} ComicCoins!`, {
        autoClose: 3000,
      });

      // Redirect to dashboard
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Error during claim process:", err);

      // Extract detailed error message from backend response
      let message = "Unable to claim coins";

      if (err instanceof Error) {
        message = err.message;

        // For axios errors
        if ('response' in err && err.response && typeof err.response === 'object') {
          const errorResponse = err.response as any;
          if (errorResponse.data) {
            if (errorResponse.data.detail) {
              message = errorResponse.data.detail;
            } else if (errorResponse.data.message) {
              message = errorResponse.data.message;
            }
          }
        }
      }

      // Set the error message to display on the page
      setErrorMessage(message);

      // Also show the error as a toast
      toast.error("Claim Failed: " + message, {
        autoClose: 5000,
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-4 px-4"
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Main Content Container */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Claim Your ComicCoins!
          </h1>
          <p className="text-sm text-gray-600">
            Your daily ComicCoins are ready to be claimed
          </p>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Claim failed</h3>
              <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Claim Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Reward Header */}
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Daily Reward Ready!
              </h2>
              <p className="text-xs text-gray-600">
                Claim your {dailyReward} ComicCoins today
              </p>
            </div>
          </div>

          {/* Reward Display */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">
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
            className="w-full bg-purple-600 text-white rounded-lg py-3 px-4 text-base font-medium hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
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
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center gap-2">
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
