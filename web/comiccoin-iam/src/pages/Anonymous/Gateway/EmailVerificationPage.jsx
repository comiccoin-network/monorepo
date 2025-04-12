// src/pages/Anonymous/Gateway/EmailVerificationPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import {
  Coins,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
} from "lucide-react";

import { useEmailVerification } from "../../../hooks/useEmailVerification";

/**
 * EmailVerification component for handling email verification process
 * Allows both automatic verification from URL query parameters
 * and manual verification code entry
 */
const EmailVerificationPage = () => {
  // State for manual verification code entry
  const [manualCode, setManualCode] = useState("");
  const [codeInputFocused, setCodeInputFocused] = useState(false);
  const [verificationState, setVerificationState] = useState({
    attempted: false,
    success: false,
    error: null,
  });
  const codeInputRef = useRef(null);

  // Use search params to extract verification code from URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract verification code from URL query parameters
  const verificationCodeFromURL = searchParams.get("q") || "";

  // Use the custom email verification hook
  const { isLoading, error, verifyEmail, reset } = useEmailVerification(
    // onSuccess callback
    (response) => {
      console.log("Email verification successful", response);
      setVerificationState({
        attempted: true,
        success: true,
        error: null,
      });
    },
    // onError callback
    (apiError) => {
      console.error("Email verification failed", apiError);
      setVerificationState({
        attempted: true,
        success: false,
        error: apiError,
      });
    },
  );

  // Track if automatic verification has been attempted
  const autoVerificationAttempted = useRef(false);

  // Trigger automatic email verification on component mount if code is in URL
  useEffect(() => {
    if (verificationCodeFromURL && !autoVerificationAttempted.current) {
      autoVerificationAttempted.current = true;
      verifyEmail(verificationCodeFromURL);
    } else if (!verificationCodeFromURL && !autoVerificationAttempted.current) {
      // Don't redirect if no code in URL; allow manual entry instead
      autoVerificationAttempted.current = true;
    }
  }, [verificationCodeFromURL, verifyEmail]);

  // Handle manual verification code submission
  const handleSubmitCode = async (e) => {
    e.preventDefault();

    if (!manualCode.trim()) {
      return; // Don't submit empty code
    }

    try {
      // Reset any previous verification state
      reset();
      await verifyEmail(manualCode.trim());
    } catch (err) {
      console.error("Manual verification error:", err);
    }
  };

  // Create CSS classes for the code input field based on its state
  const getInputClasses = () => {
    let baseClasses =
      "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-center text-lg font-mono tracking-wider";

    if (error || verificationState.error) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50`;
    } else if (codeInputFocused) {
      return `${baseClasses} border-purple-300 focus:border-purple-500 focus:ring-purple-500`;
    } else {
      return `${baseClasses} border-gray-300 focus:border-purple-500 focus:ring-purple-500`;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white">
        <div className="text-center">
          <Loader className="h-10 w-10 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-purple-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  // Render verification result (success or error)
  if (
    verificationState.attempted &&
    (verificationState.success || verificationState.error)
  ) {
    // Success state
    if (verificationState.success) {
      return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
          {/* Navigation */}
          <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Coins className="h-8 w-8" />
                <span className="text-2xl font-bold">
                  ComicCoin Digital Identity
                </span>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-2xl mx-4">
              <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
                <div className="flex flex-col items-center space-y-6">
                  {/* Success Icon */}
                  <div className="text-green-500">
                    <CheckCircle className="h-16 w-16" />
                  </div>

                  {/* Header */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Mail className="h-8 w-8" />
                      <h1 className="text-2xl font-bold">
                        Email Verified Successfully!
                      </h1>
                    </div>
                    <p className="text-gray-500">
                      Your email address has been confirmed
                    </p>
                  </div>

                  {/* Message */}
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      Thank you for verifying your email address. You can now
                      access all features of ComicCoin Digital Identity.
                    </p>
                    <p className="text-gray-600">
                      Start exploring the platform and earn ComicCoins!
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/"
                      className="w-full sm:w-auto px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Back to Home</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="mb-4">
                © {new Date().getFullYear()} ComicCoin Digital Identity. All
                rights reserved.
              </p>
              <p>
                <Link to="/terms" className="underline hover:text-purple-200">
                  Terms of Service
                </Link>
                {" | "}
                <Link to="/privacy" className="underline hover:text-purple-200">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </footer>
        </div>
      );
    }

    // Error state
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8" />
              <span className="text-2xl font-bold">
                ComicCoin Digital Identity
              </span>
            </div>
          </div>
        </nav>

        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-2xl mx-4">
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-red-200">
              <div className="flex flex-col items-center space-y-6">
                <div className="text-red-500">
                  <AlertCircle className="h-16 w-16" />
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <h1 className="text-2xl font-bold text-red-600">
                    Email Verification Failed
                  </h1>
                  <p className="text-gray-500 text-center">
                    {verificationState.error ||
                      error ||
                      "The verification code is invalid or has expired."}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Link
                    to="/"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render manual code entry form
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coins className="h-8 w-8" />
            <span className="text-2xl font-bold">
              ComicCoin Digital Identity
            </span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
            <div className="flex flex-col items-center space-y-6">
              {/* Email Icon */}
              <div className="bg-purple-100 rounded-full p-4">
                <Mail className="h-12 w-12 text-purple-600" />
              </div>

              {/* Header */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Verify Your Email
                </h1>
                <p className="text-gray-600 mb-2">
                  We've sent a verification code to your email address
                </p>
                <p className="text-sm text-gray-500">
                  Please check your inbox (and spam folder) and enter the code
                  below
                </p>
              </div>

              {/* Error message if automatic verification failed */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full text-center">
                  <p className="text-red-600 text-sm flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              {/* Code entry form */}
              <form onSubmit={handleSubmitCode} className="w-full space-y-6">
                <div className="space-y-2">
                  <label htmlFor="verification-code" className="sr-only">
                    Verification Code
                  </label>
                  <input
                    ref={codeInputRef}
                    id="verification-code"
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter verification code"
                    className={getInputClasses()}
                    autoComplete="one-time-code"
                    onFocus={() => setCodeInputFocused(true)}
                    onBlur={() => setCodeInputFocused(false)}
                    maxLength="32"
                    aria-describedby="code-hint"
                  />
                  <p
                    id="code-hint"
                    className="text-xs text-gray-500 text-center"
                  >
                    The code is case-sensitive and contains numbers and letters
                  </p>
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading || !manualCode.trim()}
                    className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2
                      ${
                        isLoading || !manualCode.trim()
                          ? "bg-purple-300 cursor-not-allowed text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Verify Email</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Didn't receive the code?
                    </p>
                    <Link
                      to="/login"
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Go back to login
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4">
            © {new Date().getFullYear()} ComicCoin Digital Identity. All rights
            reserved.
          </p>
          <p>
            <Link to="/terms" className="underline hover:text-purple-200">
              Terms of Service
            </Link>
            {" | "}
            <Link to="/privacy" className="underline hover:text-purple-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EmailVerificationPage;
