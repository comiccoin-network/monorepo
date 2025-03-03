// src/pages/ClaimCoinsPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useClaimCoins } from "../api/endpoints/claimCoinsApi";
import { useFaucet } from "../api/endpoints/faucetApi";

function ClaimCoinsPage() {
  console.log("🚀 ClaimCoinsPage component initializing");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

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
      console.log("🔄 Setting up redirect to dashboard after successful claim");
      redirectionScheduledRef.current = true;

      // Redirect to dashboard after a delay to show the success message
      const redirectTimer = setTimeout(() => {
        navigate("/dashboard");
      }, 2500); // Wait 2.5 seconds

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
      // Set success state which will trigger the redirect
      setClaimSuccess(true);
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
    }
  };

  // Simple functional page without fancy styling
  return (
    <div>
      <h1>Claim ComicCoins</h1>

      {/* Back button */}
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>

      {/* Main content */}
      <div>
        {/* Success state */}
        {claimSuccess ? (
          <div>
            <h2>Claim Successful!</h2>
            <p>You've claimed {dailyReward} ComicCoins.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <div>
            <h2>Daily Reward Ready!</h2>
            <p>Claim your {dailyReward} ComicCoins today</p>

            {/* Error message if any */}
            {errorMessage && (
              <div>
                <strong>Claim failed:</strong>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Claim button */}
            <button
              onClick={handleClaimCoins}
              disabled={isClaimingCoins || isFaucetLoading}
            >
              {isClaimingCoins
                ? "Claiming your coins..."
                : `Claim ${dailyReward} ComicCoins`}
            </button>
          </div>
        )}
      </div>

      {/* Info sections */}
      <div>
        <h3>When can I claim again?</h3>
        <p>
          You can claim ComicCoins once every 24 hours. After claiming, you'll
          need to wait until tomorrow to claim again.
        </p>
      </div>

      <div>
        <h3>What are ComicCoins?</h3>
        <p>
          ComicCoins (CC) are our platform's digital currency. You can use them
          to unlock premium comics, purchase special editions, or trade with
          other collectors.
        </p>
      </div>
    </div>
  );
}

export default ClaimCoinsPage;
