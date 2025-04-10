// src/pages/More/DeleteAccountPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  AlertCircle,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader,
} from "lucide-react";

import AppTopNavigation from "../../../components/AppTopNavigation";
import AppFooter from "../../../components/AppFooter";
import { useDeleteAccount } from "../../../api/endpoints/deleteMeApi";

function DeleteAccountPageContent() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get delete account functionality from our hook
  const { deleteAccount, isDeleting, error } = useDeleteAccount();

  // Clear form error when password changes
  useEffect(() => {
    if (formError && password) {
      setFormError(null);
    }
  }, [password]);

  // Update error from API
  useEffect(() => {
    if (error) {
      setFormError(
        error.message ||
          "An error occurred while trying to delete your account.",
      );
    }
  }, [error]);

  // Navigate back to `More page.
  const handleBackToDashboard = () => {
    navigate("/more");
  };

  // Handle showing the confirmation dialog
  const handleShowConfirmation = (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setFormError("Password is required to confirm account deletion");
      return;
    }

    setShowConfirmation(true);
  };

  // Handle actual account deletion
  const handleConfirmDelete = async () => {
    try {
      const success = await deleteAccount(password);

      if (success) {
        // The logout happens automatically in the hook
        // No need for navigation as the auth context will handle redirecting to login
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      // Close confirmation dialog to show the error
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AppTopNavigation />

      <main
        id="main-content"
        className="container mx-auto px-4 py-4 sm:py-6 max-w-3xl flex-grow"
      >
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">
                Delete Account
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
          </div>
        </header>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
            <h2 className="text-xl font-bold text-red-700 mb-2">
              Delete Your Account
            </h2>
            <p className="text-red-700 max-w-lg mx-auto">
              This action permanently deletes your account and all associated
              data. Once completed, this action cannot be undone and you will
              lose access to all your data.
            </p>
          </div>
        </div>

        {/* What Gets Deleted Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              What will be deleted:
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Your account information and login credentials
                </span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Your transaction history and activity logs
                </span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Your wallet address association
                </span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  All personal data and preferences
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Password Confirmation Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Confirm with your password
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleShowConfirmation}>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2
                      ${formError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {formError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                    {formError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBackToDashboard}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700
                  bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !password.trim()}
                  className={`w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-2 rounded-lg shadow-sm text-white
                  ${isDeleting || !password.trim() ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"}`}
                >
                  {isDeleting ? (
                    <>
                      <Loader
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <AppFooter />

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle
                  className="h-8 w-8 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm Account Deletion
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently lost.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2
                ${isDeleting ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"}`}
              >
                {isDeleting ? (
                  <>
                    <Loader
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    <span>Permanently Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap the component with the XXX HOC
const UserDeleteAccountPage = DeleteAccountPageContent;
export default UserDeleteAccountPage;
