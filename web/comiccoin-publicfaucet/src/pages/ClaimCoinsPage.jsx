// src/pages/ClaimCoinsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Coins,
  Gift,
  Clock,
  AlertCircle,
  ArrowLeft,
  Star,
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

// Enhanced card component with customizable visual styles
const Card = ({
  children,
  className = "",
  withGlow = false,
  withBorder = false,
  withShadow = "sm",
  gradient = false,
}) => (
  <div
    className={`
      bg-white rounded-xl
      ${withBorder ? "border border-purple-100" : ""}
      ${withShadow === "sm" ? "shadow-sm" : withShadow === "md" ? "shadow-md" : withShadow === "lg" ? "shadow-lg" : ""}
      ${withGlow ? "ring-2 ring-purple-100 ring-opacity-50" : ""}
      ${gradient ? "bg-gradient-to-br from-white to-purple-50" : ""}
      ${className}
    `}
    style={withGlow ? { boxShadow: "0 0 15px rgba(147, 51, 234, 0.1)" } : {}}
  >
    {children}
  </div>
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
  console.log("🚀 ClaimCoinsPage component initializing");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
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

  // Add custom animation keyframes
  useEffect(() => {
    // Add custom animation styling to document
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
        100% { transform: translateY(0px); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Effect to handle redirection after successful claim
  useEffect(() => {
    if (claimSuccess && !redirectionScheduledRef.current) {
      console.log("🔄 Setting up redirect to dashboard after successful claim");
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
    console.log("🪙 Initiating coin claim");
    // Clear any previous error
    setErrorMessage(null);

    try {
      // Attempt to claim coins
      await claimCoins();

      console.log("✅ Coin claim successful");

      // Show confetti animation
      setShowConfetti(true);
      setClaimSuccess(true);

      // Show success toast
      toast.success(`You've claimed ${dailyReward} ComicCoins!`, {
        autoClose: 3000,
        position: "bottom-center",
        style: {
          background: "linear-gradient(to right, #8b5cf6, #6366f1)",
          color: "white",
          borderRadius: "10px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          backgroundImage: "rgba(255, 255, 255, 0.4)",
        },
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
      console.error("❌ Error claiming coins:", err);

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
        style: {
          borderLeft: "4px solid #ef4444",
          borderRadius: "4px",
        },
      });
    }
  };

  // Handle button press visual feedback
  const handleButtonPress = () => setIsButtonPressed(true);
  const handleButtonRelease = () => setIsButtonPressed(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppTopNavigation />

      <main
        ref={mainContainerRef}
        className="container mx-auto px-4 py-4 max-w-5xl flex-grow"
        style={{
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Confetti animation for successful claims */}
        <ClaimConfetti visible={showConfetti} />

        {/* Header with Back Button - Matches TransactionsPage */}
        <header className="mb-6 md:mb-8">
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

        <div className="max-w-md mx-auto space-y-6">
          {/* Info box with animation */}
          <div className="text-center mb-6">
            <div
              className="inline-block mb-3"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400 rounded-full opacity-20 blur-xl transform scale-110"></div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-3 rounded-full shadow-lg">
                  <Coins className="h-8 w-8" />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              Your daily reward is ready to be collected. Claim now and start
              exploring premium content!
            </p>
          </div>

          {/* Error message display with improved accessibility */}
          {errorMessage && (
            <div
              className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4 flex items-start shadow-sm animate-pulse"
              role="alert"
              aria-labelledby="error-heading"
              style={{ animation: "pulse 2s ease-in-out" }}
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

          {/* Claim Card with enhanced visual appeal */}
          <Card
            className="p-6 space-y-6 transform transition-all duration-300"
            withGlow={!claimSuccess}
            withShadow="md"
            gradient={true}
          >
            {/* Success state */}
            {claimSuccess ? (
              <div className="text-center py-4">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                >
                  <CheckCircle
                    className="h-8 w-8 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  Claim Successful!
                </h3>
                <p className="text-gray-600">
                  Congratulations! {dailyReward} ComicCoins have been added to
                  your wallet.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Reward Header */}
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-full shadow-md">
                    <Gift className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Daily Reward Ready!
                    </h2>
                    <p className="text-sm text-gray-600">
                      Claim your {dailyReward} ComicCoins today
                    </p>
                  </div>
                </div>

                {/* Reward Display */}
                <div
                  className="relative overflow-hidden bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 text-center shadow-inner"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
                  }}
                >
                  {/* Decorative stars */}
                  <div
                    className="absolute top-3 left-3 text-yellow-400 opacity-70"
                    aria-hidden="true"
                  >
                    <Star size={16} fill="currentColor" />
                  </div>
                  <div
                    className="absolute bottom-3 right-3 text-yellow-400 opacity-70"
                    aria-hidden="true"
                  >
                    <Star size={16} fill="currentColor" />
                  </div>

                  <p className="text-sm text-gray-600 mb-2" id="reward-label">
                    Today's Reward
                  </p>
                  <div
                    className="flex items-center justify-center gap-3"
                    aria-labelledby="reward-label"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-400 rounded-full opacity-30 blur-sm"></div>
                      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-full shadow-md relative">
                        <Coins
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600"
                        style={
                          !isFaucetLoading
                            ? { animation: "pulse 3s ease-in-out infinite" }
                            : {}
                        }
                        aria-live="polite"
                      >
                        {isFaucetLoading ? (
                          <span className="text-sm text-purple-500 opacity-70 flex items-center">
                            <LoadingSpinner />
                            <span className="ml-2">Loading...</span>
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

                {/* Claim Button with enhanced accessibility and visual feedback */}
                <button
                  onClick={handleClaimCoins}
                  onTouchStart={handleButtonPress}
                  onTouchEnd={handleButtonRelease}
                  onMouseDown={handleButtonPress}
                  onMouseUp={handleButtonRelease}
                  onMouseLeave={handleButtonRelease}
                  disabled={isClaimingCoins || isFaucetLoading}
                  className={`w-full rounded-lg py-4 px-4 text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-white shadow-md ${
                    isButtonPressed
                      ? "bg-gradient-to-r from-purple-800 to-indigo-800 scale-95 shadow-inner"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  }`}
                  style={{
                    backgroundSize: isClaimingCoins ? "200% 200%" : "100% 100%",
                    animation: isClaimingCoins
                      ? "shimmer 2s infinite linear"
                      : "none",
                  }}
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
          </Card>

          {/* Next Claim Time Information */}
          <Card className="p-5" withBorder={true} withShadow="sm">
            <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center gap-2">
              <div className="bg-purple-100 p-1.5 rounded-full">
                <Clock className="h-4 w-4 text-purple-600" aria-hidden="true" />
              </div>
              <span>When can I claim again?</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed pl-9">
              You can claim ComicCoins once every 24 hours. After claiming,
              you'll need to wait until tomorrow to claim again.
            </p>
          </Card>

          {/* Additional help information */}
          <Card className="p-5" withBorder={true} withShadow="sm">
            <h3 className="text-base font-medium text-gray-800 mb-2 flex items-center gap-2">
              <div className="bg-purple-100 p-1.5 rounded-full">
                <Coins className="h-4 w-4 text-purple-600" aria-hidden="true" />
              </div>
              <span>What are ComicCoins?</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed pl-9">
              ComicCoins (CC) are our platform's digital currency. You can use
              them to unlock premium comics, purchase special editions, or trade
              with other collectors. Check your total balance on the dashboard.
            </p>
          </Card>
        </div>

        <style>{`
          @keyframes confetti {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(calc(100vh + 10px)) rotate(720deg); opacity: 0; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
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
