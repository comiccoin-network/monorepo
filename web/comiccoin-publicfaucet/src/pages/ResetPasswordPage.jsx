// src/pages/ResetPasswordPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  AlertCircle,
  Shield,
  Lock,
  CheckSquare,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Mail,
  Clock,
} from "lucide-react";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";
import { useResetPassword } from "../hooks/useResetPassword";

// Countdown Timer Component
const CountdownTimer = ({ expirationTime }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  // Function to calculate and update the time remaining
  const updateTimeLeft = useCallback(() => {
    const now = new Date();
    const expiration = new Date(expirationTime);
    const totalSecondsLeft = Math.max(0, Math.floor((expiration - now) / 1000));

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
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
        isExpired
          ? "bg-red-100 text-red-800"
          : timeLeft.minutes < 1
            ? "bg-yellow-100 text-yellow-800"
            : "bg-blue-100 text-blue-800"
      }`}
    >
      <Clock className="mr-1 h-4 w-4" aria-hidden="true" />
      {isExpired ? (
        <span>Code expired</span>
      ) : (
        <span>
          Expires in {String(timeLeft.minutes).padStart(1, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      )}
    </div>
  );
};

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use our custom reset password hook
  const {
    resetUserPassword,
    isLoading,
    error: resetError,
    success,
    resetState,
  } = useResetPassword();

  // For the expiration time
  const location = useLocation();
  const expirationTime = location.state?.expirationTime;
  const emailFromPrevPage = location.state?.email;
  const [isCodeExpired, setIsCodeExpired] = useState(false);

  // Navigator for routing
  const navigate = useNavigate();

  // Check for expiration on component mount and whenever expirationTime changes
  useEffect(() => {
    if (!expirationTime) return;

    const checkExpiration = () => {
      const now = new Date();
      const expiration = new Date(expirationTime);
      if (now > expiration) {
        setIsCodeExpired(true);
        setGeneralError(
          "Your verification code has expired. Please request a new code.",
        );
      }
    };

    // Check immediately
    checkExpiration();

    // Set up recurring checks
    const intervalId = setInterval(checkExpiration, 1000);

    return () => clearInterval(intervalId);
  }, [expirationTime]);

  // Redirect to forgot password page if no expiration time is available
  useEffect(() => {
    if (!expirationTime && !generalError) {
      setGeneralError(
        "Missing verification information. Please start the password reset process again.",
      );

      // Optional: Auto-redirect back to forgot password after a few seconds
      const redirectTimer = setTimeout(() => {
        navigate("/forgot-password");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [expirationTime, generalError, navigate]);

  // Handle API error updates
  useEffect(() => {
    if (resetError) {
      setGeneralError(
        resetError.message || "Failed to reset password. Please try again.",
      );
    }
  }, [resetError]);

  // Redirect to login after successful reset
  useEffect(() => {
    if (success) {
      // In a real implementation, navigate to login after successful password reset
      const redirectTimer = setTimeout(() => {
        navigate("/login");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [success, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Reset any general errors
    if (generalError) {
      setGeneralError("");
    }

    // Reset state from the hook
    resetState();
  };

  const validateForm = () => {
    const newErrors = {};

    // First check if code has expired
    if (isCodeExpired) {
      newErrors.verificationCode =
        "Your verification code has expired. Please request a new code.";
      setErrors(newErrors);
      return false;
    }

    // Verify code validation
    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = "Verification code is required";
    } else if (formData.verificationCode.length < 6) {
      newErrors.verificationCode =
        "Verification code must be at least 6 characters";
    }

    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Reset password form submitted");
    setGeneralError("");

    // Check for expired code first
    if (isCodeExpired) {
      setGeneralError(
        "Your verification code has expired. Please request a new code.",
      );
      return;
    }

    // Validate the form
    if (!validateForm()) {
      return;
    }

    try {
      console.log("🔄 Attempting to reset password");

      // Prepare the payload for the API
      const resetData = {
        code: formData.verificationCode,
        password: formData.newPassword,
        password_confirm: formData.confirmPassword,
        // Include email if it was passed from the previous page
        ...(emailFromPrevPage ? { email: emailFromPrevPage } : {}),
      };

      // Call the hook's function to reset the password
      await resetUserPassword(resetData);

      // Success handling is managed by the useEffect watching the success state
    } catch (err) {
      console.error("❌ Password reset error:", err);
      // Error handling is handled by the useEffect watching resetError
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate("/login");
  };

  // Handle try again button (when code expires)
  const handleTryAgain = () => {
    navigate("/forgot-password");
  };

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
                Enter your verification code and new password to complete the
                password reset process
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
                <h2 className="text-xl font-semibold">Create New Password</h2>
                <p className="text-purple-100 text-sm mt-1">
                  Enter the verification code from your email
                </p>
              </div>
            </div>

            {/* Expiration Timer */}
            {expirationTime && !success && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Verification code sent to{" "}
                  <span className="font-medium">
                    {emailFromPrevPage || "your email"}
                  </span>
                </p>
                <CountdownTimer expirationTime={expirationTime} />
              </div>
            )}

            {/* Form Body */}
            {!success ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Display general error message if any */}
                {generalError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{generalError}</p>
                        {isCodeExpired && (
                          <button
                            type="button"
                            onClick={handleTryAgain}
                            className="mt-2 text-sm text-red-700 font-medium hover:text-red-800 underline"
                          >
                            Request a new verification code
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Code */}
                <div>
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Verification Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.verificationCode || isCodeExpired
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter verification code from your email"
                      required
                      disabled={isCodeExpired}
                    />
                  </div>
                  {errors.verificationCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.verificationCode}
                    </p>
                  )}
                  {!errors.verificationCode && !isCodeExpired && (
                    <p className="mt-2 text-sm text-gray-500">
                      Check your email for the verification code we sent
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.newPassword
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Create new password"
                      required
                      autoComplete="new-password"
                      disabled={isCodeExpired}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex="-1"
                      disabled={isCodeExpired}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Password must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.confirmPassword
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your new password"
                      required
                      autoComplete="new-password"
                      disabled={isCodeExpired}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex="-1"
                      disabled={isCodeExpired}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="pt-6 flex flex-col sm:flex-row-reverse gap-3">
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isCodeExpired}
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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="h-5 w-5" />
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
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <div className="flex items-start gap-4">
                    <CheckSquare className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg text-green-800 mb-2">
                        Password Reset Successful!
                      </h3>
                      <p className="mb-4">
                        Your password has been successfully reset. You can now
                        use your new password to log in to your account.
                      </p>
                      <p className="text-sm text-green-600">
                        You will be redirected to the login page in a few
                        seconds.
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
                If you're still having trouble resetting your password or
                haven't received a verification code, please contact our support
                team for assistance.
              </p>
              <Link
                to="https://comiccoinnetwork.com/support/"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
              >
                Contact Support
                <ArrowRight className="h-4 w-4 ml-1" />
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

export default ResetPasswordPage;
