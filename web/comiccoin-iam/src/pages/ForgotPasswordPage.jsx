// src/pages/ForgotPasswordPage.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  AlertCircle,
  Shield,
  Mail,
  ArrowLeft,
  CheckCircle,
  Send,
  ArrowRight,
  Clock,
} from "lucide-react";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";
import { useForgotPassword } from "../hooks/useForgotPassword";
import withRedirectAuthenticated from "../components/withRedirectAuthenticated";

function ForgotPasswordPage() {
  console.log("🚀 ForgotPasswordPage component initializing");

  // Use the forgotPassword hook instead of local state management
  const {
    sendPasswordResetEmail,
    isLoading,
    error,
    success,
    emailSentTo,
    resetState,
  } = useForgotPassword();

  // Navigator for routing
  const navigate = useNavigate();
  console.log("🧭 Navigate function available:", !!navigate);

  // Use email from the successful response
  const email = emailSentTo || "";

  // Calculate expiration time: current time + 5 minutes from time of success
  const [expirationTime, setExpirationTime] = useState(null);

  // Set expiration time when request is successful
  useEffect(() => {
    if (success) {
      const expiration = new Date();
      expiration.setMinutes(expiration.getMinutes() + 5);
      setExpirationTime(expiration);

      console.log(
        "✅ Password reset email sent successfully, expires at:",
        expiration,
      );
    }
  }, [success]);

  const handleInputChange = (e) => {
    // When user starts typing again, reset the state
    // This will clear any previous success/error messages
    resetState();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Forgot password form submitted");

    // Get the email value from the form
    const emailInput = e.target.elements.email.value;

    try {
      console.log("📧 Attempting to send password reset email to:", emailInput);

      // Use the hook's function to send the request
      await sendPasswordResetEmail(emailInput);

      // Success handling is done within the hook and reflected in the success state
    } catch (err) {
      console.error("❌ Password reset error:", err);
      // Error handling is done within the hook
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate("/login");
  };

  // Format the remaining time for display
  const formatRemainingTime = () => {
    if (!expirationTime) return "5:00";

    const now = new Date();
    const expiration = new Date(expirationTime);
    const timeLeft = Math.max(0, Math.floor((expiration - now) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // CountdownTimer Component with dynamic updates
  const CountdownTimer = ({ expirationTime }) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    // Function to calculate and update the time remaining
    const updateTimeLeft = useCallback(() => {
      const now = new Date();
      const expiration = new Date(expirationTime);
      const totalSecondsLeft = Math.max(
        0,
        Math.floor((expiration - now) / 1000),
      );

      if (totalSecondsLeft <= 0) {
        setIsExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }

      const minutes = Math.floor(totalSecondsLeft / 60);
      const seconds = totalSecondsLeft % 60;
      setTimeLeft({ minutes, seconds });
    }, [expirationTime]);

    // Set up the timer effect
    useEffect(() => {
      // Initial calculation
      updateTimeLeft();

      // Update every second
      const timerId = setInterval(updateTimeLeft, 1000);

      // Clean up the interval on unmount
      return () => clearInterval(timerId);
    }, [updateTimeLeft]);

    // Display the timer with appropriate styling
    return (
      <div
        className={`inline-flex items-center rounded-full px-3 py-1.5 ${
          isExpired
            ? "bg-red-100 border border-red-200 text-red-800"
            : timeLeft.minutes < 1
              ? "bg-yellow-100 border border-yellow-200 text-yellow-800"
              : "bg-blue-100 border border-blue-200 text-blue-800"
        }`}
      >
        <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
        {isExpired ? (
          <span className="text-sm font-medium">Code expired</span>
        ) : (
          <span className="text-sm font-medium tabular-nums">
            {timeLeft.minutes > 0
              ? `Expires in ${timeLeft.minutes} min ${String(timeLeft.seconds).padStart(2, "0")} sec`
              : `Expires in ${timeLeft.seconds} seconds`}
          </span>
        )}
      </div>
    );
  };

  console.log("🎨 Rendering forgot password form, error:", !!error);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Include the common Header component */}
      <Header showBackButton={true} />

      <main id="main-content" className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Reset Your Password
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Enter your email address and we'll send you instructions to
                reset your password
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mb-8">
            {/* Form Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              <Shield className="h-7 w-7 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Forgot Your Password?</h2>
                <p className="text-purple-100 text-sm mt-1">
                  We'll help you get back into your account
                </p>
              </div>
            </div>

            {/* Form Body */}
            {!success ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Display error message if any */}
                {error && error.message && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-5 w-5" />
                      <p>{error.message}</p>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue=""
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        error ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* Form Actions */}
                <div className="pt-6 flex flex-col sm:flex-row-reverse gap-3">
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Reset Instructions
                      </>
                    )}
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              /* Success Message */
              <div className="p-6">
                <div className="mb-6 bg-white border border-green-200 rounded-xl shadow-md overflow-hidden">
                  {/* Success Header */}
                  <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="font-medium text-lg text-green-800">
                      Reset Instructions Sent!
                    </h3>
                  </div>

                  {/* Timer Banner - Highly Visible */}
                  <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-yellow-800 font-medium">
                        Verification code expires in:
                      </div>
                      <CountdownTimer expirationTime={expirationTime} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="mb-4">
                      We've sent password reset instructions to{" "}
                      <strong className="font-medium">{email}</strong>. Please
                      check your inbox and follow the instructions in the email.
                    </p>

                    <div className="bg-blue-50 rounded-lg p-4 mb-4 flex items-start border border-blue-100">
                      <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 font-medium mb-1">
                          Important:
                        </p>
                        <p className="text-blue-700 text-sm">
                          The email contains a{" "}
                          <span className="font-semibold">
                            verification code
                          </span>{" "}
                          that you'll need to enter on the next screen. Please
                          complete the process before the timer expires.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      If you don't see the email in your inbox, please check
                      your spam folder. The email should arrive within a few
                      minutes.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mt-5 text-sm border border-gray-200">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">
                          For security reasons, the verification code will
                          expire after 5 minutes. The timer started when the
                          email was sent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() =>
                      navigate("/reset-password", {
                        state: {
                          expirationTime: expirationTime.toISOString(),
                          email: email,
                        },
                      })
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md"
                  >
                    Continue to Reset Password
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Box */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6 mb-12">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Having Trouble?
              </h3>
              <p className="text-gray-600 mb-4">
                If you're still having trouble accessing your account or haven't
                received a reset email after several minutes, please contact our
                support team for assistance.
              </p>
              <Link
                to="https://comiccoinnetwork.com/support/"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
              >
                Contact Support
                <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />
    </div>
  );
}

export default withRedirectAuthenticated(ForgotPasswordPage);
