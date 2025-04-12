// monorepo/web/comiccoin-iam/src/pages/Anonymous/Gateway/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  AlertCircle,
  Shield,
  LogIn,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  HelpCircle, // Added for forgot password icon
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import Header from "../../../components/IndexPage/Header";
import Footer from "../../../components/IndexPage/Footer";
import withRedirectAuthenticated from "../../../components/withRedirectAuthenticated";
import { USER_ROLE } from "../../../hooks/useUser"; // Import USER_ROLE constants

function LoginPage() {
  console.log("🚀 LoginPage component initializing");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth(); // Get user object from auth context
  console.log("🔐 Authentication state:", {
    isAuthenticated,
    userRole: user?.role,
  });

  // Check if navigate is defined correctly
  const navigate = useNavigate();
  console.log("🧭 Navigate function available:", !!navigate);

  // Updated useEffect to handle role-based redirection
  useEffect(() => {
    console.log(
      "🔄 LoginPage useEffect running, isAuthenticated:",
      isAuthenticated,
      "User:",
      user,
    );

    // Only redirect if authenticated
    if (isAuthenticated && user) {
      // Check if user is a root/admin user
      if (user.role === USER_ROLE.ROOT) {
        console.log("👑 Root user detected, redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("👉 Regular user detected, redirecting to dashboard");
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Login form submitted");
    setGeneralError("");
    setErrors({});
    setLoading(true);

    try {
      console.log("🔑 Attempting login with email:", formData.email);
      const loginRequest = {
        email: formData.email,
        password: formData.password,
      };

      const userData = await login(loginRequest);
      console.log("✅ Login successful, user data:", userData);
      // The redirect will happen in the useEffect when isAuthenticated and user changes
    } catch (err) {
      console.error("❌ Login error:", err);

      // Handle field-specific errors from the backend
      if (err.response?.data && typeof err.response.data === "object") {
        const fieldErrors = err.response.data;

        // Check if the error is in the format we expect
        if (fieldErrors.email || fieldErrors.password) {
          console.log("🔍 Field-specific errors detected:", fieldErrors);
          setErrors(fieldErrors);
        }
        // If we have a message field, use that as a general error
        else if (fieldErrors.message) {
          setGeneralError(fieldErrors.message);
        }
        // If the response is some other format, show it as JSON
        else {
          setGeneralError(`Login failed: ${JSON.stringify(fieldErrors)}`);
        }
      }
      // Handle network errors or other non-response errors
      else if (err.message) {
        setGeneralError(err.message);
      }
      // Fallback for unknown error formats
      else {
        setGeneralError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate("/get-started");
  };

  console.log("🎨 Rendering login form, errors:", {
    field: !!Object.keys(errors).length,
    general: !!generalError,
  });

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
                Welcome Back
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Sign in to access your account and securely manage your
                identity.
              </p>
            </div>
          </div>
        </div>

        {/* Beta Access Notice */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield
                  className="h-5 w-5 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-indigo-800">
                  Private Beta Access
                </h3>
                <div className="mt-2 text-sm text-indigo-700">
                  <p>
                    ComicCoin Digital ID is currently in private beta. If you
                    don't have an account yet, you'll need an access code to
                    register. Contact our team to request access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end Beta Access Notice */}

        {/* Form Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mb-8">
            {/* Form Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              <Shield className="h-7 w-7 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">
                  Sign in to ComicCoin Digital Identity
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Access your account and daily rewards
                </p>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Display general error message if any */}
              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-5 w-5" />
                    <p>{generalError}</p>
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 h-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}

                {/* Forgot Password Link - Added here */}
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-purple-600 hover:text-purple-800 inline-flex items-center"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Form Actions - Matching the Register page pattern */}
              <div className="pt-6 flex flex-col sm:flex-row-reverse gap-3">
                {/* Submit Button - Primary action first in code */}
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </>
                  )}
                </button>

                {/* Cancel Button - Secondary action second in code */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Registration Call to Action */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6 mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Don't have an account?
                </h3>
                <p className="text-gray-600">
                  Join our community and start collecting ComicCoins today
                </p>
              </div>
              <Link
                to="/register"
                className="whitespace-nowrap inline-flex items-center gap-2 px-5 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                Register Now
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

export default withRedirectAuthenticated(LoginPage);
