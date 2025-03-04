// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { AlertCircle } from "lucide-react";

function LoginPage() {
  console.log("🚀 LoginPage component initializing");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  console.log("🔐 Authentication state:", { isAuthenticated });

  // Check if navigate is defined correctly
  const navigate = useNavigate();
  console.log("🧭 Navigate function available:", !!navigate);

  // Move the navigation to useEffect instead of doing it during render
  useEffect(() => {
    console.log(
      "🔄 LoginPage useEffect running, isAuthenticated:",
      isAuthenticated,
    );
    // Only redirect if authenticated
    if (isAuthenticated) {
      console.log("👉 User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Login form submitted");
    setGeneralError("");
    setErrors({});
    setLoading(true);

    try {
      console.log("🔑 Attempting login with email:", email);
      const loginRequest = {
        email,
        password,
      };

      await login(loginRequest);
      console.log("✅ Login successful");
      // The redirect will happen in the useEffect when isAuthenticated changes
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

  console.log("🎨 Rendering login form, errors:", {
    field: !!Object.keys(errors).length,
    general: !!generalError,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-800">
          ComicCoin Faucet Login
        </h1>

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error when typing
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="Enter your email"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear error when typing
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.password ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
