import React, { useState } from 'react';
import { Loader2 } from "lucide-react";

const WalletImportModal = ({ isOpen, onClose, onImport }) => {
  const [label, setLabel] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onImport({ label, mnemonic, password });
      setLabel('');
      setMnemonic('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import wallet');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Import Wallet</h2>
            <p className="text-sm text-gray-500 mt-2">
              Import your existing wallet using your recovery phrase. You'll be able to choose a new name and password for this wallet.
            </p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm text-blue-800">
                Important: You'll need your original recovery phrase, but you can choose a new name and password for the imported wallet.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="label"
                className="block text-sm font-medium text-gray-700"
              >
                Wallet Label
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Choose any name that helps you identify this wallet. Example: "My Main Wallet" or "Trading Wallet"
              </p>
              <input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter a name for your wallet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mnemonic"
                className="block text-sm font-medium text-gray-700"
              >
                Recovery Phrase
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Enter your original wallet's 12 or 24-word recovery phrase exactly as it was given to you
              </p>
              <textarea
                id="mnemonic"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="word1 word2 word3 ... word12"
                className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure to enter the words in the correct order, separated by spaces
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Set New Password
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Create a new password to secure this wallet. It doesn't need to match your original wallet's password
              </p>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Wallet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletImportModal;
