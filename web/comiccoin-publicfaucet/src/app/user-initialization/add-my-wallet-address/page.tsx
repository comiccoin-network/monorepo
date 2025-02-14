// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user-initialization/add-my-wallet-address.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { usePostMeConnectWallet } from "@/hooks/usePostMeConnectWallet";
import Link from "next/link";
import {
  Coins,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Globe,
  Download,
  X,
  ArrowLeft,
  Shield,
} from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, walletAddress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Confirm Your Wallet
          </h3>
          <p className="text-sm text-gray-600">
            Please verify that this is your correct wallet address:
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <p className="font-mono text-sm text-purple-800 break-all">
            {walletAddress}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
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

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Double-check
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Confirm Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AddMyWalletAddressPage() {
  const router = useRouter();
  const { updateWallet } = useMe();
  const {
    postMeConnectWallet,
    isPosting,
    error: postError,
  } = usePostMeConnectWallet();
  const [walletAddress, setWalletAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    console.log("🔄 Starting wallet confirmation process");

    try {
      const success = await postMeConnectWallet(walletAddress);

      if (success) {
        console.log("✅ Wallet connected successfully");

        // Update local state
        updateWallet(walletAddress);

        // Use replace instead of push to prevent back navigation
        console.log("🔄 Redirecting to dashboard");
        router.replace("/user/dashboard");

        // Force a page reload after a short delay to ensure all states are updated
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
      <nav className="bg-white border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-purple-800">
                ComicCoin Faucet
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-4rem)] bg-purple-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Step Indicator */}
          <div className="bg-white rounded-xl p-6 border-2 border-purple-200 text-center">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">
              Setup Progress
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 h-1 bg-green-500"></div>
              <div className="w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100"></div>
              <div className="flex-1 h-1 bg-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Step 2 of 3: Connect Wallet
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
            <div className="flex justify-center mb-6">
              <Coins className="h-12 w-12 text-purple-600" />
            </div>

            <h1
              className="text-2xl font-bold text-center text-purple-800 mb-6"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Connect Your Wallet
            </h1>

            {/* Get a Wallet Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Don't have a wallet?
              </h2>
              <div className="bg-purple-50 rounded-lg p-6 space-y-4">
                <p className="text-gray-700">
                  You'll need a ComicCoin wallet to receive and manage your
                  coins. Get started with:
                </p>
                <div className="grid gap-4">
                  <a
                    href="https://comiccoinwallet.com/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Web Wallet</div>
                        <div className="text-sm text-gray-500">
                          No installation required - get started instantly
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>

                  <a
                    href="https://comiccoinwallet.com/download-native-wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Mobile App</div>
                        <div className="text-sm text-gray-500">
                          Available for iOS and Android
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>

                  <a
                    href="https://comiccoinwallet.com/download-native-wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Desktop Wallet</div>
                        <div className="text-sm text-gray-500">
                          For Windows, Mac, and Linux
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Show API error if it exists */}
            {postError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">{postError.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enter Wallet Address */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">
                    Important
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Make sure to enter your wallet address correctly. If you
                    enter the wrong address, your ComicCoins will be sent to
                    someone else and cannot be recovered!
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
                  Your Wallet Address
                </label>
                <input
                  id="wallet"
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0x..."
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                  title="Please enter a valid Ethereum wallet address"
                  disabled={isPosting}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Your wallet address should start with "0x" followed by 40
                  characters
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  isPosting || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)
                }
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? "Connecting..." : "Connect Wallet"}
              </button>
            </form>
          </div>

          {/* Help Link */}
          <div className="text-center">
            <Link
              href="/help/wallet-setup"
              className="inline-flex items-center text-purple-600 hover:text-purple-700"
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
