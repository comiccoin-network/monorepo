// src/pages/ClaimCoinsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Coins,
  Gift,
  Clock,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import AppTopNavigation from "../components/AppTopNavigation";
import AppFooter from "../components/AppFooter";
import { useClaimCoins } from "../api/endpoints/claimCoinsApi";
import { useFaucet } from "../api/endpoints/faucetApi";
import withWallet from "../components/withWallet";

// Animated loading spinner component
const LoadingSpinner = () => (
  <div
    className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"
    aria-hidden="true"
  />
);

// Confetti animation component for successful claims
const ClaimConfetti = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {[...Array(30)].map((_, i) => {
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const animationDelay = Math.random() * 0.5;
        const color = [
          "bg-purple-500",
          "bg-indigo-400",
          "bg-pink-400",
          "bg-yellow-300",
          "bg-blue-400",
        ][Math.floor(Math.random() * 5)];

        return (
          <div
            key={i}
            className={`absolute ${color} rounded-full`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: "-10px",
              animation: `confetti ${animationDuration}s ease-in ${animationDelay}s forwards`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(calc(100vh + 10px)) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

function ClaimCoinsPageContent() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const mainContainerRef = useRef(null);

  // Track if redirection is scheduled
  const redirectionScheduledRef = useRef(false);

  // Get faucet data to display daily reward amount
  const { data: faucet, isLoading: isFaucetLoading } = useFaucet();

  // Set up claim coins mutation
  const {
    mutateAsync: claimCoins,
    isLoading: isClaimingCoins,
    isError,
    error,
  } = useClaimCoins();

  // Get the daily reward amount from faucet data
  const dailyReward = faucet?.daily_coins_reward || 2; // Fallback to 2 if not available yet

  // Effect to handle redirection after successful claim
  useEffect(() => {
    if (claimSuccess && !redirectionScheduledRef.current) {
      redirectionScheduledRef.current = true;

      // Redirect to dashboard after a delay to show the success animation
      const redirectTimer = setTimeout(() => {
        navigate("/dashboard");
      }, 2500); // Wait 2.5 seconds to show confetti animation

      // Cleanup timer if component unmounts
      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [claimSuccess, navigate]);

  // Function to handle coin claiming
  const handleClaimCoins = async () => {
    // Clear any previous error
    setErrorMessage(null);

    try {
      // Attempt to claim coins
      await claimCoins();

      // Show confetti animation
      setShowConfetti(true);
      setClaimSuccess(true);

      // Show success toast
      toast.success(`You've claimed ${dailyReward} ComicCoins!`, {
        autoClose: 3000,
        position: "bottom-center",
      });

      // Announce success for screen readers
      const successAnnouncement = document.createElement("div");
      successAnnouncement.setAttribute("aria-live", "assertive");
      successAnnouncement.setAttribute("role", "status");
      successAnnouncement.className = "sr-only";
      successAnnouncement.textContent = `Success! You've claimed ${dailyReward} ComicCoins!`;
      document.body.appendChild(successAnnouncement);

      // Remove announcement after it's been read
      setTimeout(() => {
        document.body.removeChild(successAnnouncement);
      }, 4000);
    } catch (err) {
      console.error("Error claiming coins:", err);

      // Extract detailed error message from response
      let message = "Unable to claim coins";

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMessage(message);

      // Also show the error as a toast
      toast.error("Claim Failed: " + message, {
        autoClose: 5000,
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AppTopNavigation />

      <main
        id="main-content"
        ref={mainContainerRef}
        className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl flex-grow"
      >
        {/* Confetti animation for successful claims */}
        <ClaimConfetti visible={showConfetti} />

        {/* Header with Back Button */}
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">
                Claim ComicCoins
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Claim your daily ComicCoin reward
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
          {/* Info box */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-block mb-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Coins className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              Your daily reward is ready to be collected. Claim now and start
              exploring premium content!
            </p>
          </div>

          {/* Error message display */}
          {errorMessage && (
            <div
              className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start mb-4 sm:mb-6"
              role="alert"
              aria-labelledby="error-heading"
            >
              <AlertCircle
                className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <h3
                  id="error-heading"
                  className="text-sm font-medium text-red-800"
                >
                  Claim failed
                </h3>
                <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Claim Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
            {/* Success state */}
            {claimSuccess ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle
                    className="h-8 w-8 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-medium text-green-700 mb-2">
                  Claim Successful!
                </h3>
                <p className="text-sm text-gray-600">
                  Congratulations! {dailyReward} ComicCoins have been added to
                  your wallet.
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Reward Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Gift
                      className="h-6 w-6 text-purple-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-800">
                      Daily Reward Ready!
                    </h2>
                    <p className="text-sm text-gray-600">
                      Claim your {dailyReward} ComicCoins today
                    </p>
                  </div>
                </div>

                {/* Reward Display */}
                <div className="bg-purple-50 rounded-lg p-4 sm:p-6 text-center mb-4 sm:mb-6">
                  <p className="text-sm text-gray-600 mb-2" id="reward-label">
                    Today's Reward
                  </p>
                  <div
                    className="flex items-center justify-center gap-3"
                    aria-labelledby="reward-label"
                  >
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Coins
                        className="h-6 w-6 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <div
                        className="text-2xl font-bold text-purple-700"
                        aria-live="polite"
                      >
                        {isFaucetLoading ? (
                          <span className="text-sm text-purple-500 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mr-2"></div>
                            Loading...
                          </span>
                        ) : (
                          `${dailyReward} CC`
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ComicCoins
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <button
                  onClick={handleClaimCoins}
                  disabled={isClaimingCoins || isFaucetLoading}
                  className="w-full rounded-lg py-3 px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-white bg-purple-600 hover:bg-purple-700"
                  aria-live="polite"
                  aria-busy={isClaimingCoins}
                >
                  {isClaimingCoins ? (
                    <>
                      <LoadingSpinner />
                      <span>Claiming your coins...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="h-5 w-5" aria-hidden="true" />
                      <span>Claim {dailyReward} ComicCoins</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Next Claim Time Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-medium text-purple-800 mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" aria-hidden="true" />
              <span>When can I claim again?</span>
            </h3>
            <p className="text-sm text-gray-600">
              You can claim ComicCoins once every 24 hours. After claiming,
              you'll need to wait until tomorrow to claim again.
            </p>
          </div>

          {/* Additional help information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-medium text-purple-800 mb-2 flex items-center gap-2">
              <Coins className="h-5 w-5 text-purple-600" aria-hidden="true" />
              <span>What are ComicCoins?</span>
            </h3>
            <p className="text-sm text-gray-600">
              ComicCoins (CC) are our platform's digital currency. You can use
              them to unlock premium comics, purchase special editions, or trade
              with other collectors. Check your total balance on the dashboard.
            </p>
          </div>
        </div>

        {/* Add necessary keyframes for animations */}
        <style>{`
          @keyframes confetti {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(calc(100vh + 10px)) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </main>

      <AppFooter />
    </div>
  );
}

// Wrap the component with authentication and wallet HOCs
const ClaimCoinsPage = withWallet(ClaimCoinsPageContent);
export default ClaimCoinsPage;
