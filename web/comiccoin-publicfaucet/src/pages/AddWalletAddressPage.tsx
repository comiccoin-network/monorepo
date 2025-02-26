import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import {
  Coins,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Globe,
  Download,
  X,
  Shield,
} from "lucide-react";

import { useWalletConnect } from "../hooks/useWalletConnect";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";

// Add interface for ConfirmationModal props
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  walletAddress: string;
}



const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  walletAddress,
}: ConfirmationModalProps) => {
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

function AddWalletAddressPage() {
  const navigate = useNavigate();
  const {
    user,
    updateUser,
    isLoading,
    error: userError
  } = useMe();

  const {
    connectWallet,
    isConnecting,
    error: connectError,
  } = useWalletConnect();

  const [walletAddress, setWalletAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle initial authentication check and redirection
  useEffect(() => {
    if (!isLoading) {
      setIsInitializing(false);
    }
  }, [user, isLoading]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    console.log("🔄 Starting wallet confirmation process");

    try {
      const success = await connectWallet(walletAddress);

      if (success && user) {
        // Make sure we have a user
        console.log("✅ Wallet connected successfully");

        // Update the entire user object with the new wallet address
        if (user) {
          const updatedUser = {
            ...user,
            wallet_address: walletAddress,
          };
          updateUser(updatedUser);
        }

        console.log("🔄 Redirecting to dashboard");
        navigate("/user/dashboard");

        setTimeout(() => {
          console.log("🔄 Forcing page reload to refresh states");
          window.location.href = "/user/dashboard";
        }, 100);
      } else {
        console.log("❌ Wallet connection failed");
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error("❌ Error during wallet confirmation:", error);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      {/* Simple Navigation */}
      {/*
      <nav className="bg-white border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="flex items-center">
              <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-purple-800 truncate">
                ComicCoin Faucet
              </span>
            </div>
          </div>
        </div>
      </nav>
      */}

      <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-purple-50 flex flex-col py-4 px-3 sm:p-4 overflow-auto">
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
            {(connectError || userError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">
                      {connectError?.message || userError?.message || "An error occurred"}
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
                  Your wallet address should start with &quot;0x&quot; followed
                  by 40 characters
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

          {/* Help Link */}
          <div className="text-center pb-6">
            <Link
              to="/help/wallet-setup"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm sm:text-base"
            >
              Need help setting up your wallet?
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        walletAddress={walletAddress}
      />
    </>
  );
}

export default withAuth(AddWalletAddressPage);
