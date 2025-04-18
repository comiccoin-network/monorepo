// monorepo/web/comiccoin-iam/src/pages/Gatway/RegistrationSuccessPage.jsx
import { useState, useRef } from "react";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader,
  AlertCircle,
  Send,
} from "lucide-react";
import { Link, Navigate } from "react-router";
import Header from "../../../components/IndexPage/Header";
import Footer from "../../../components/IndexPage/Footer";
import { useEmailVerification } from "../../../hooks/useEmailVerification";

const RegistrationSuccessPage = () => {
  // State for redirecting
  const [redirectTo, setRedirectTo] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeInputFocused, setCodeInputFocused] = useState(false);
  const [verificationState, setVerificationState] = useState({
    attempted: false,
    success: false,
    error: null,
  });
  const codeInputRef = useRef(null);

  // Use the email verification hook
  const { isLoading, error, verifyEmail } = useEmailVerification(
    // onSuccess callback
    (response) => {
      console.log("Email verification successful", response);
      setVerificationState({
        attempted: true,
        success: true,
        error: null,
      });
      // Redirect to login after successful verification (with slight delay for user to see success message)
      setTimeout(() => {
        setRedirectTo("/login");
      }, 2000);
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

  // Handle form submission for verification code
  const handleSubmitCode = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      return; // Don't submit empty code
    }

    try {
      await verifyEmail(verificationCode.trim());
    } catch (err) {
      console.error("Verification error:", err);
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

  // Handle redirect
  if (redirectTo !== "") {
    return <Navigate to={redirectTo} />;
  }

  // Success state after verification
  if (verificationState.attempted && verificationState.success) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <Header showBackButton={true} />

        <main
          id="main-content"
          className="flex-grow flex items-center justify-center py-12 px-4"
        >
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-green-200">
              <div className="flex flex-col items-center space-y-8">
                <div className="bg-green-100 rounded-full p-6 h-24 w-24 flex items-center justify-center">
                  <Check className="h-12 w-12 text-green-600" />
                </div>

                <h1 className="text-3xl font-bold text-green-700 text-center">
                  Email Verified Successfully!
                </h1>

                <div className="text-center text-gray-700 space-y-4 max-w-lg">
                  <p className="text-lg">
                    Your email has been verified and your account is now active!
                  </p>
                  <p>
                    You can now login to your account and start collecting
                    ComicCoins.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    onClick={() => setRedirectTo("/login")}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Go to Login
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer isLoading={false} error={null} faucet={null} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Add the Header component here */}
      <Header showBackButton={true} />

      {/* Main Content - Centered both vertically and horizontally */}
      <main
        id="main-content"
        className="flex-grow flex items-center justify-center py-12 px-4"
      >
        {/* Content card */}
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
            <div className="flex flex-col items-center space-y-6">
              {/* Success Icon */}
              <div className="bg-purple-100 rounded-full p-6 h-20 w-20 flex items-center justify-center">
                <Mail className="h-10 w-10 text-purple-600" />
              </div>

              {/* Header */}
              <h1 className="text-2xl font-bold text-purple-800 text-center">
                Registration Successful!
              </h1>

              {/* Message */}
              <div className="text-center text-gray-700 space-y-4 max-w-lg">
                <p className="text-base">
                  Thank you for registering! We've sent a verification code to
                  your email.
                </p>
                <p className="text-sm text-gray-600">
                  Please check your inbox (including spam or promotions folders)
                  and enter the code below to activate your account.
                </p>
              </div>

              {/* Error message if verification failed */}
              {(error || verificationState.error) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{verificationState.error || error}</span>
                  </p>
                </div>
              )}

              {/* Verification code form */}
              <form
                onSubmit={handleSubmitCode}
                className="w-full space-y-4 max-w-md mx-auto"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="verification-code"
                    className="text-sm font-medium text-gray-700 block text-left"
                  >
                    Verification Code:
                  </label>
                  <input
                    ref={codeInputRef}
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter code from your email"
                    className={getInputClasses()}
                    autoComplete="one-time-code"
                    onFocus={() => setCodeInputFocused(true)}
                    onBlur={() => setCodeInputFocused(false)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 text-left">
                    The verification code is case-sensitive
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !verificationCode.trim()}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isLoading || !verificationCode.trim()
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

                  <button
                    onClick={() => setRedirectTo("/")}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Home</span>
                  </button>
                </div>
              </form>

              {/* Additional help text */}
              <div className="text-center text-sm text-gray-600 mt-4">
                <p>Didn't receive the code? Check your spam folder or</p>
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  click here to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer component */}
      <Footer isLoading={false} error={null} faucet={null} />
    </div>
  );
};

export default RegistrationSuccessPage;
