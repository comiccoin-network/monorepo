// src/Components/User/NFT/Transfer/View.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Send,
  Loader2,
  Info,
  Wallet,
  Coins
} from 'lucide-react';
import { useWallet } from '../../../../Hooks/useWallet';
import { useWalletTransactions } from '../../../../Hooks/useWalletTransactions';
import { useTransactionSignAndSubmit } from '../../../../Hooks/useTransactionSignAndSubmit';
import NavigationMenu from "../../NavigationMenu/View";
import FooterMenu from "../../FooterMenu/View";
import walletService from '../../../../Services/WalletService';

const TransferNFTPage = () => {
  const navigate = useNavigate();
  const {
    currentWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();
  const { statistics } = useWalletTransactions(currentWallet?.address);
  const { submitTransaction, loading: transactionLoading, error: transactionError } = useTransactionSignAndSubmit(1);

  // State for session management
  const [forceURL, setForceURL] = useState("");
  const [generalError, setGeneralError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form-related state
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
    note: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    console.log('TransferNFTPage: Initial useEffect running');
    let mounted = true;

    const checkWalletSession = async () => {
      console.log('TransferNFTPage: checkWalletSession starting');
      try {
        if (!mounted) return;
        setIsLoading(true);

        if (serviceLoading) {
          console.log('TransferNFTPage: Service still loading, waiting...');
          return;
        }

        if (!currentWallet) {
          console.log('TransferNFTPage: No current wallet found, redirecting to login');
          if (mounted) {
            setForceURL("/login");
          }
          return;
        }

        // Check session using the wallet service
        if (!walletService.checkSession()) {
          throw new Error("Session expired");
        }

        if (mounted) {
          setForceURL("");
        }

      } catch (error) {
        console.error('TransferNFTPage: Session check error:', error);
        if (error.message === "Session expired" && mounted) {
          handleSessionExpired();
        } else if (mounted) {
          setGeneralError(error.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkWalletSession();
    const sessionCheckInterval = setInterval(checkWalletSession, 60000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [currentWallet, serviceLoading]);

  const handleSessionExpired = () => {
    setIsSessionExpired(true);
    logout();
    setGeneralError("Your session has expired. Please sign in again.");
    setTimeout(() => {
      setForceURL("/login");
    }, 3000);
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

    setFormErrors(newErrors);
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

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    setIsSubmitting(true);
    try {
      await submitTransaction(
        formData.recipientAddress,
        formData.amount,
        formData.note || "",
        currentWallet,
        formData.password
      );
      navigate('/dashboard', {
        state: {
          transactionSuccess: true,
          message: 'Transaction submitted successfully!'
        }
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      setFormErrors(prev => ({ ...prev, submit: error.message }));
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (forceURL !== "" && !serviceLoading) {
    console.log('TransferNFTPage: Navigating to:', forceURL);
    return <Navigate to={forceURL} />;
  }

  if (serviceLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <NavigationMenu />

      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 mb-16 md:mb-0">
        {/* Error Messages */}
        {generalError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{generalError}</p>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Send ComicCoins</h1>
          <p className="text-xl text-gray-600">Transfer CC to another wallet</p>
        </div>

        {/* Form Errors */}
        {Object.keys(formErrors).length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Transaction Error</h3>
                <div className="text-sm text-red-600 mt-1">
                  {Object.values(formErrors).map((error, index) => (
                    <p key={index} className="flex items-center gap-2">
                      <span>•</span> {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          {/* Balance Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Available Balance</h2>
                  <p className="text-2xl font-bold text-purple-600">{statistics?.totalCoinValue || 0} CC</p>
                </div>
                {formData.amount && (
                  <div className="mt-2 pt-2 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Amount to Send</span>
                      <span className="text-red-600">- {formData.amount} CC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Network Fee</span>
                      <span className="text-red-600">- 1 CC</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600">Remaining Balance</span>
                      <span className="text-gray-900">
                        = {(statistics?.totalCoinValue - parseFloat(formData.amount || 0) - 1).toFixed(2)} CC
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div className="p-6 border-b border-gray-100 space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>All transactions are final and cannot be undone. Please verify all details before sending.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Transaction Fee Information</p>
                <p>A network fee of 1 CC will be added to your transaction to ensure timely processing.</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6" autoComplete="off">
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
                    formErrors.recipientAddress ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Enter recipient's wallet address"
                />
                {formErrors.recipientAddress && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.recipientAddress}
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
                    Current Balance: {statistics?.totalCoinValue || 0} CC
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
                   formErrors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                 }`}
                 placeholder="Enter amount of coins to send"
                 step="0.000001"
                 min="0"
               />
               {formErrors.amount ? (
                 <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                   <AlertCircle className="w-4 h-4" />
                   {formErrors.amount}
                 </p>
               ) : formData.amount ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-red-600">
                        Network Fee: 1 CC
                      </p>
                      <p className="text-sm text-gray-600">
                      Total amount (including fee): {(parseFloat(formData.amount) + 1).toFixed(2)} CC
                  </p>
                </div>
              ) : null}
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
                  formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Enter your wallet password"
                autoComplete="off"
              />
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.password}
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

          {formErrors.submit && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{formErrors.submit}</p>
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
    </main>

    <FooterMenu />

    {/* Confirmation Modal */}
    {showConfirmation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Transaction</h3>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-gray-600">Send Amount</p>
                <p className="text-lg font-medium text-red-600">- {formData.amount} CC</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Network Fee</p>
                <p className="text-lg font-medium text-red-600">- 1 CC</p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Total Deduction</p>
                <p className="text-lg font-bold text-red-600">- {(parseFloat(formData.amount) + 1).toFixed(2)} CC</p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Remaining Balance</p>
                <p className="text-lg font-bold text-gray-900">
                  {(statistics?.totalCoinValue - parseFloat(formData.amount) - 1).toFixed(2)} CC
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">To Address</p>
              <p className="text-lg font-medium text-gray-900 break-all">{formData.recipientAddress}</p>
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

export default TransferNFTPage;
