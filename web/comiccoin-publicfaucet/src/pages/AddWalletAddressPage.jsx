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
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import { useWalletConnect } from "../hooks/useWalletConnect";
import { useAuth } from "../hooks/useAuth";
import withWallet from "../components/withWallet";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

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
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Include the common Header component */}
      <Header showBackButton={true} />

      <main id="main-content" className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Connect Your Wallet
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Link your ComicCoin wallet to start receiving daily rewards
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Step Indicator */}
          <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-md text-center mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-purple-800 mb-4">
              Account Setup Progress
            </h2>
            <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 h-1 bg-green-500"></div>
              <div className="w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100"></div>
              <div className="flex-1 h-1 bg-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            </div>
            <div className="flex justify-between max-w-md mx-auto text-sm text-gray-600">
              <span>Account</span>
              <span className="font-medium text-purple-700">Wallet</span>
              <span>Verification</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Wallet Entry Form */}
            <div className="md:col-span-2 order-2 md:order-1">
              <div className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden mb-8">
                {/* Form Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
                  <Coins className="h-7 w-7 mr-3 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold">
                      Enter Your Wallet Address
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">
                      This is where you'll receive your ComicCoins
                    </p>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-6">
                  {/* Show API errors if they exist */}
                  {(connectError || localError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-800">
                            {localError ||
                              (typeof connectError === "object" &&
                                connectError?.message) ||
                              (typeof connectError === "string" &&
                                connectError) ||
                              "An error occurred"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning Message */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-1">
                          Important
                        </h3>
                        <p className="text-sm text-yellow-800">
                          Make sure to enter your wallet address correctly. If
                          you enter the wrong address, your ComicCoins will be
                          sent to someone else and cannot be recovered!
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="wallet"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Your Wallet Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="wallet"
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-full px-4 py-3 h-12 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0x..."
                        required
                        pattern="^0x[a-fA-F0-9]{40}$"
                        title="Please enter a valid Ethereum wallet address"
                        disabled={isConnecting}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Your wallet address should start with "0x" followed by
                        40 hexadecimal characters
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isConnecting ||
                        !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)
                      }
                      className="w-full px-6 py-4 text-base font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Connecting...
                        </>
                      ) : (
                        <>
                          Connect Wallet
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column: How to get a wallet */}
            <div className="md:col-span-1 order-1 md:order-2">
              <div className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <h2 className="text-xl font-semibold">Need a Wallet?</h2>
                  <p className="text-purple-100 text-sm mt-1">
                    Get one of these options
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  <a
                    href="https://comiccoinwallet.com/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Web Wallet</div>
                        <div className="text-xs text-gray-500">
                          No installation required
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400" />
                  </a>

                  <a
                    href="https://comiccoinwallet.com/download-native-wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Mobile App</div>
                        <div className="text-xs text-gray-500">
                          iOS and Android
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400" />
                  </a>

                  <a
                    href="https://comiccoinwallet.com/download-native-wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Desktop Wallet</div>
                        <div className="text-xs text-gray-500">
                          Windows, Mac, Linux
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Include the common Footer component */}
      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />

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
