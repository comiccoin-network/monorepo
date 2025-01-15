// src/Components/User/SendCoin/View.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Send,
  Loader2,
  Info,
  Wallet,
  LogOut,
  Coins
} from 'lucide-react';
import { useWallet } from '../../../Hooks/useWallet';
import { useWalletTransactions } from '../../../Hooks/useWalletTransactions';
import { useTransaction } from '../../../Hooks/useTransaction';

const SendCoinsPage = () => {
  const navigate = useNavigate();
  const { currentWallet, logout } = useWallet();
  const { statistics } = useWalletTransactions(currentWallet?.address);
   const { submitTransaction } = useTransaction();

  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
    note: '',
    password: '123password123'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientAddress) {
      newErrors.recipientAddress = 'Recipient address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipientAddress)) {
      newErrors.recipientAddress = 'Invalid wallet address format';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) > statistics?.totalCoinValue) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required to authorize transaction';
    }

    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return !hasErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    setIsSubmitting(true);

    try {
        const result = await submitTransaction(
            formData.recipientAddress,
            formData.amount,
            formData.note,
            currentWallet, // This should include the wallet.address
            formData.password
        );

        navigate('/dashboard', {
            state: {
                transactionSuccess: true,
                message: `Transaction submitted: ${result.nonce_string}`
            }
        });
    } catch (error) {
        setErrors({ submit: error.message });
    } finally {
        setIsSubmitting(false);
        setShowConfirmation(false);
    }
};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Header/Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Wallet aria-hidden="true" className="h-8 w-8" />
              <span className="text-2xl font-bold">ComicCoin Web Wallet</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800">Transaction Error</h3>
                    <div className="text-sm text-red-600 mt-1">
                      {Object.values(errors).map((error, index) => (
                        <p key={index} className="flex items-center gap-2">
                          <span>•</span> {error}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Send ComicCoins</h1>
          <p className="text-xl text-gray-600">Transfer CC to another wallet</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Balance</h2>
              <p className="text-gray-600">{statistics?.totalCoinValue || 0} CC</p>
            </div>
          </div>

          {/* Important Notices Section */}
          <div className="space-y-4 mb-6">
            {/* Warning Notice */}
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

            {/* Transaction Fee Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Transaction Fee Information</p>
                <p>
                  A network fee of 0.001 CC will be added to your transaction to ensure timely processing.
                  This fee goes to network validators who process your transaction.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="recipientAddress" className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Pay To <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    id="recipientAddress"
                    name="recipientAddress"
                    value={formData.recipientAddress}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.recipientAddress ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter recipient's wallet address"
                  />
                  {errors.recipientAddress && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.recipientAddress}
                    </p>
                  )}
                </label>
              </div>

              <div>
                <label htmlFor="amount" className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Coins <span className="text-red-500">*</span>
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      Balance: {statistics?.totalCoinValue || 0} CC
                    </span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    max={statistics?.totalCoinValue}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter amount of coins to send"
                    step="0.000001"
                    min="0"
                  />
                  {errors.amount ? (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amount}
                    </p>
                  ) : (
                    formData.amount && (
                      <p className="mt-1.5 text-sm text-gray-500">
                        Remaining balance after transaction:{' '}
                        {(statistics?.totalCoinValue - parseFloat(formData.amount)).toFixed(2)} CC
                      </p>
                    )
                  )}
                </label>
              </div>

              <div>
                <label htmlFor="note" className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Message (Optional)
                    </span>
                    <span className="text-xs text-gray-500">
                      Include a note with your transaction
                    </span>
                  </div>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Add a message to this transaction"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This message will be visible to the recipient of your transaction.
                  </p>
                </label>
              </div>

              <div>
                <label htmlFor="password" className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Wallet Password <span className="text-red-500">*</span>
                    </span>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
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

            {errors.submit && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Coins
                </div>
              )}
            </button>
          </form>
        </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 ComicCoin Web Wallet. All rights reserved.</p>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Transaction</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-lg font-medium text-gray-900">{formData.amount} CC</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">To Address</p>
                <p className="text-lg font-medium text-gray-900 break-all">{formData.recipientAddress}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Network Fee</p>
                <p className="text-lg font-medium text-gray-900">1 CC</p>
              </div>

              {formData.note && (
                <div>
                  <p className="text-sm text-gray-600">Note</p>
                  <p className="text-lg font-medium text-gray-900">{formData.note}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmTransaction}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendCoinsPage;
