// src/pages/AddWalletAddressPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Coins,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Globe,
  Download,
  X,
  Shield,
} from "lucide-react";

import { useWalletConnect } from "../hooks/useWalletConnect";
import { useAuth } from "../hooks/useAuth";
import withWallet from "../components/withWallet";

// Confirmation Modal component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, walletAddress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 sm:mb-6 text-center">
          <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1 sm:mb-2">
            Confirm Your Wallet
          </h3>
          <p className="text-sm text-gray-600">
            Please verify that this is your correct wallet address:
          </p>
        </div>

        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <p className="font-mono text-sm text-purple-800 break-all">
            {walletAddress}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                Double-check your wallet address carefully. Coins sent to the
                wrong address cannot be recovered!
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
          >
            Double-check
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 sm:px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
          >
            Confirm Address
          </button>
        </div>
      </div>
    </div>
  );
};

function AddWalletAddressPageContent() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const {
    connectWallet,
    isConnecting,
    error: connectError,
  } = useWalletConnect();

  const [walletAddress, setWalletAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [localError, setLocalError] = useState(null);

  // Handle initial authentication check and redirection
  useEffect(() => {
    // If user data is present, we're no longer initializing
    if (user) {
      setIsInitializing(false);
    }
  }, [user]);

  // Don't render the main content while checking user status
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous errors when opening confirmation modal
    setLocalError(null);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    console.log("🔄 Starting wallet confirmation process");

    try {
      // Call the wallet connection API
      const success = await connectWallet(walletAddress).catch((err) => {
        // Direct error handling for the catch block
        console.error("Caught error during wallet connect:", err);

        // Check for API response with error message
        if (err.response && err.response.data) {
          // Log the full error response for debugging
          console.log("API error response:", err.response.data);

          // Extract message from response data
          if (err.response.data.message) {
            setLocalError(err.response.data.message);
          } else {
            // Fallback to stringifying the data object
            setLocalError(JSON.stringify(err.response.data));
          }
        } else {
          // Fallback for network or other errors
          setLocalError(err.message || "Failed to connect wallet");
        }

        // Return false to indicate failure
        return false;
      });

      // If successfully connected the wallet
      if (success && user) {
        console.log("✅ Wallet connected successfully");

        // Update user data with the wallet address
        const updatedUser = {
          ...user,
          walletAddress: walletAddress,
          wallet_address: walletAddress,
        };
        updateUser(updatedUser);

        console.log("👤 Updated user with wallet:", updatedUser);
        console.log("🔄 Redirecting to dashboard");

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        console.log("❌ Wallet connection failed or was cancelled");
        // Keep modal open if there's an error to display
        if (!localError) {
          setShowConfirmation(false);
        }
      }
    } catch (error) {
      console.error("❌ Error during wallet confirmation:", error);
      setShowConfirmation(false);

      // Extract error message from various possible formats
      let errorMessage = "An unexpected error occurred";

      if (error.response) {
        // The request was made and the server responded with an error status
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Request failed: ${error.response.status}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened while setting up the request
        errorMessage = error.message || errorMessage;
      }

      setLocalError(errorMessage);
    }
  };

  // Close confirmation modal and clear error
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-purple-50 w-full">
      <div className="w-full py-4 px-3 sm:p-4">
        <div className="max-w-2xl w-full mx-auto space-y-4 sm:space-y-6">
          {/* Step Indicator */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-purple-200 text-center">
            <h2 className="text-base sm:text-lg font-semibold text-purple-800 mb-2">
              Setup Progress
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 h-1 bg-green-500"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-600 ring-4 ring-purple-100"></div>
              <div className="flex-1 h-1 bg-gray-200"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-200"></div>
            </div>
            <div className="mt-2 text-xs sm:text-sm text-gray-600">
              Step 2 of 3: Connect Wallet
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-2 border-purple-200">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Coins className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
            </div>

            <h1
              className="text-xl sm:text-2xl font-bold text-center text-purple-800 mb-4 sm:mb-6"
              style={{ fontFamily: "Comic Sans MS" }}
            >
              Connect Your Wallet
            </h1>

            {/* Get a Wallet Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                {"Don't have a wallet?"}
              </h2>
              <div className="bg-purple-50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base text-gray-700">
                  {
                    "You'll need a ComicCoin wallet to receive and manage your coins. Get started with:"
                  }
                </p>
                <div className="grid gap-3 sm:gap-4">
                  <a
                    href="https://comiccoinwallet.com/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      <div>
                        <div className="font-medium text-sm sm:text-base">
                          Web Wallet
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          No installation required - get started instantly
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </a>

                  <a
                    href="https://comiccoinwallet.com/download-native-wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      <div>
                        <div className="font-medium text-sm sm:text-base">
                          Mobile App
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Available for iOS and Android
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </a>

                  <a
                    href="https://comiccoinwallet.com/download-native-wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      <div>
                        <div className="font-medium text-sm sm:text-base">
                          Desktop Wallet
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          For Windows, Mac, and Linux
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Show API errors if they exist */}
            {(connectError || localError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">
                      {localError ||
                        (typeof connectError === "object" &&
                          connectError?.message) ||
                        (typeof connectError === "string" && connectError) ||
                        "An error occurred"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enter Wallet Address */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1 text-sm sm:text-base">
                    Important
                  </h3>
                  <p className="text-xs sm:text-sm text-yellow-800">
                    Make sure to enter your wallet address correctly. If you
                    enter the wrong address, your ComicCoins will be sent to
                    someone else and cannot be recovered!
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="wallet"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Wallet Address
                </label>
                <input
                  id="wallet"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0x..."
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                  title="Please enter a valid Ethereum wallet address"
                  disabled={isConnecting}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  Your wallet address should start with "0x" followed by 40
                  characters
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  isConnecting || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)
                }
                className="w-full px-4 py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirm}
        walletAddress={walletAddress}
      />
    </div>
  );
}

// We don't use withAuth here since the component will be used in a route already protected by ProtectedRoute
const AddWalletAddressPage = withWallet(AddWalletAddressPageContent);
export default AddWalletAddressPage;
