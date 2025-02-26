// src/pages/SettingsPage.tsx
import React, { useState } from "react";
import { withAuth } from "../hocs/withAuth";
import { useMe } from "../hooks/useMe";
import userService from "../services/userService";

const SettingsPageContent: React.FC = () => {
  const { user, updateUser } = useMe();
  const [walletAddress, setWalletAddress] = useState(user?.wallet_address || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle wallet address update
  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset status
    setError(null);
    setSuccess(null);
    setIsUpdating(true);

    try {
      // Call API to update wallet address
      const updatedUser = await userService.updateWalletAddress(walletAddress);

      // Update local state
      updateUser(updatedUser);

      // Show success message
      setSuccess("Wallet address updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update wallet address");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {/* Profile Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Profile Information</h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Name:</span> {user.name}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">ID:</span> {user.id}
          </div>
        </div>
      </div>

      {/* Wallet Settings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Wallet Settings</h2>

        <form onSubmit={handleUpdateWallet}>
          <div className="mb-4">
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your wallet address"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 text-green-500 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className={`px-4 py-2 rounded text-white ${
              isUpdating ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isUpdating ? 'Updating...' : 'Update Wallet Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Wrap the component with the auth HOC and export as default
const SettingsPage = withAuth(SettingsPageContent, {
  // Optional custom options
  checkInterval: 60000, // Re-check auth every minute
});

export default SettingsPage;
