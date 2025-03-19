// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  AlertCircle,
  Shield,
  Mail,
  ArrowLeft,
  CheckCircle,
  Send,
} from "lucide-react";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

//TODO: Add code for posting forgot password API

function ForgotPasswordPage() {
  console.log("🚀 ForgotPasswordPage component initializing");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Navigator for routing
  const navigate = useNavigate();
  console.log("🧭 Navigate function available:", !!navigate);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Clear error when typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Forgot password form submitted");
    setError("");
    setLoading(true);

    try {
      console.log("📧 Attempting to send password reset email to:", email);

      // This is a mock implementation - in a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      // Check if email is valid (simple validation for demonstration)
      if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Please enter a valid email address.");
      }

      console.log("✅ Password reset email sent successfully");
      setIsSubmitted(true);
    } catch (err) {
      console.error("❌ Password reset error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate("/login");
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
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Display error message if any */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-5 w-5" />
                      <p>{error}</p>
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
                      value={email}
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
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
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
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              /* Success Message */
              <div className="p-6">
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg text-green-800 mb-2">
                        Reset Instructions Sent!
                      </h3>
                      <p className="mb-4">
                        We've sent password reset instructions to{" "}
                        <strong>{email}</strong>. Please check your inbox and
                        follow the instructions in the email.
                      </p>
                      <p className="mb-4">
                        If you don't see the email in your inbox, please check
                        your spam folder. The email should arrive within a few
                        minutes.
                      </p>
                      <p className="text-sm text-green-600">
                        Note: The reset link in the email will expire after 24
                        hours for security reasons.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Return to Login
                  </Link>
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

export default ForgotPasswordPage;
