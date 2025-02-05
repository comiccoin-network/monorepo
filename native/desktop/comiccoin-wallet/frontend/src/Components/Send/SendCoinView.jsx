import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Send, AlertCircle, Info, Coins } from "lucide-react";
import { useRecoilState } from "recoil";

import { TransferCoin } from "../../../wailsjs/go/main/App";
import { currentOpenWalletAtAddressState } from "../../AppState";
import useTotalCoins from "../../Hooks/totalcoins";
import useSyncStatus from "../../Hooks/syncstatus";

function SendCoinView() {
  // Global State
  const [currentOpenWalletAtAddress] = useRecoilState(
    currentOpenWalletAtAddressState,
  );
  const isSyncing = useSyncStatus();

  // Component states
  const [showErrorBox, setShowErrorBox] = useState(false);
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wasSyncing, setWasSyncing] = useState(false);

  // Get current balance using the hook
  const currentBalance = useTotalCoins(currentOpenWalletAtAddress, setForceURL);

  // Form state
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    message: "",
    password: "",
  });

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipient.trim()) {
      newErrors.recipient = "Recipient address is required";
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(formData.amount) > currentBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (!formData.password) {
      newErrors.password = "Password is required to authorize transaction";
    }

    setErrors(newErrors);
    setShowErrorBox(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isLoading || isSyncing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);

    try {
      await TransferCoin(
        formData.recipient,
        parseInt(formData.amount),
        formData.message,
        currentOpenWalletAtAddress,
        formData.password,
      );

      console.log("Transaction submitted successfully");
      setForceURL("/send-processing");
    } catch (errorJsonString) {
      console.error("Transaction failed:", errorJsonString);

      try {
        const errorObject = JSON.parse(errorJsonString);
        const newErrors = {
          recipient: errorObject.to,
          amount: errorObject.coin || errorObject.value,
          message: errorObject.message,
          password: errorObject.wallet_password,
        };

        // Remove empty error messages
        Object.keys(newErrors).forEach((key) => {
          if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        setShowErrorBox(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
        setErrors({ general: "An unexpected error occurred" });
        setShowErrorBox(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for the changed field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      setShowErrorBox(false);
    }
  };

  // Effect to track sync status changes
  useEffect(() => {
    if (wasSyncing && !isSyncing) {
      // Refresh balance after syncing completes
      // Note: useTotalCoins hook will handle this automatically
      console.log("🔄 Sync completed");
    }
    setWasSyncing(isSyncing);
  }, [isSyncing, wasSyncing]);

  // Initial setup
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle navigation
  if (forceURL) {
    return <Navigate to={forceURL} />;
  }

  // Calculate remaining balance for display
  const remainingBalance = formData.amount
    ? currentBalance - parseFloat(formData.amount)
    : currentBalance;

  return (
    <div>
      <main className="max-w-2xl mx-auto px-6 py-12 mb-24">
        {/* Disable the form while syncing */}
        {isSyncing && (
          <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {showErrorBox && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">
                Unable to Send Coins
              </h3>
              <div className="text-sm text-red-600 mt-1 space-y-1">
                {Object.values(errors).map(
                  (error, index) => error && <p key={index}>• {error}</p>,
                )}
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border-2 border-gray-100"
        >
          {/* Form header */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Send
                    className="w-5 h-5 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Send ComicCoins
                </h2>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Transfer coins to another wallet address. Please fill in all
              required fields.
            </p>
          </div>

          {/* Form fields */}
          <div className="p-6 space-y-8">
            {/* Warning notice */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>
                  All transactions are final and cannot be undone. Please verify
                  all details before sending.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Recipient field */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Pay To <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  disabled={isLoading || isSyncing}
                  className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.recipient
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter recipient's wallet address"
                />
                {errors.recipient && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.recipient}
                  </p>
                )}
              </label>

              {/* Amount field */}
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Coins <span className="text-red-500">*</span>
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    Balance: {currentBalance} CC
                  </span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  disabled={isLoading || isSyncing}
                  max={currentBalance}
                  className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.amount
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter amount of coins to send"
                />
                {errors.amount ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.amount}
                  </p>
                ) : (
                  formData.amount && (
                    <p className="mt-1.5 text-sm text-gray-500">
                      Remaining balance after transaction:{" "}
                      {remainingBalance.toFixed(2)} CC
                    </p>
                  )
                )}
              </label>

              {/* Message field */}
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Message (Optional)
                  </span>
                  <span className="text-xs text-gray-500">
                    Include a note with your transaction
                  </span>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={isLoading || isSyncing}
                  className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Add a message to this transaction"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This message will be visible to the recipient of your
                  transaction.
                </p>
              </label>

              {/* Password field */}
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Wallet Password <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading || isSyncing}
                  className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter your wallet password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Your wallet is encrypted and stored locally. The password is
                    required to authorize this transaction.
                  </span>
                </p>
              </label>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading || isSyncing}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    Processing...
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </>
                ) : (
                  <>
                    Send Coins
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default SendCoinView;
