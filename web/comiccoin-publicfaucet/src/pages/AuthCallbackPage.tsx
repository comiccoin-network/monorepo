import React, { useEffect, useRef, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router"; 
import { Loader2 } from "lucide-react";
import { useMe } from "../hooks/useMe";
import authService, { AuthTokens } from "../services/authService";

// Create a client component that uses the search params
const AuthCallbackContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use the useMe hook with initial disabled state
  const { user, isLoading, error, updateUser } = useMe({
    enabled: false,
  });

  const hasProcessedAuth = useRef(false);

  useEffect(() => {
    if (hasProcessedAuth.current) {
      console.log("🔄 AUTH CALLBACK: Already processed");
      return;
    }

    async function handleAuth() {
      console.log("🚀 AUTH CALLBACK: Starting authentication");

      try {
        hasProcessedAuth.current = true;

        // Step 1: Get and validate tokens
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresAt = searchParams.get("expires_at");
        const federatedidentityID = searchParams.get("federatedidentity_id");

        console.log("🔍 AUTH CALLBACK: Validating tokens", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasExpiryTime: !!expiresAt,
          hasFederatedIdentityID: !!federatedidentityID,
        });

        // Validation checks
        if (!accessToken) throw new Error("Missing access token");
        if (!refreshToken) throw new Error("Missing refresh token");
        if (!expiresAt) throw new Error("Missing expires at");
        if (!federatedidentityID)
          throw new Error("Missing federated identity ID");

        // Step 2: Store tokens in local storage using our auth service
        console.log("💾 AUTH CALLBACK: Storing tokens");

        // Create token data object - ensure null values are handled correctly
        const tokenData: AuthTokens = {
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresAt: parseInt(expiresAt, 10),
          federatedidentityID: federatedidentityID,
        };

        // Save tokens to localStorage using the authService
        authService.saveTokens(tokenData);

        // Verify tokens were saved correctly
        const storedTokens = authService.getTokens();
        console.log("✅ AUTH CALLBACK: Storage verification", {
          saved: !!storedTokens.accessToken,
          hasRefreshToken: !!storedTokens.refreshToken
        });

        // Add a small delay to ensure browser storage is fully synchronized
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          // Step 3: Instead of fetching user profile from API,
          // use user data from query params to create user object
          console.log("👤 AUTH CALLBACK: Creating user profile from auth data");

          // Extract user info from URL params (assuming they're passed along with tokens)
          const email = searchParams.get("email") || "";
          const firstName = searchParams.get("first_name") || "";
          const lastName = searchParams.get("last_name") || "";
          const name = `${firstName} ${lastName}`.trim() || email.split("@")[0];
          const walletAddress = searchParams.get("wallet_address") || null;

          // Create user object - make sure it matches the User interface from userService
          const userData = {
            id: federatedidentityID, // Use as ID
            federatedidentity_id: federatedidentityID, // Also include as federatedidentity_id
            email,
            first_name: firstName,
            last_name: lastName,
            name,
            lexical_name: name.toLowerCase(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            wallet_address: walletAddress,
            // Add any other required fields with default values if needed
          };

          // Store user data using the updateUser function from useMe hook
          updateUser(userData);

          // Step 4: Profile created successfully
          console.log("📱 AUTH CALLBACK: User profile created", {
            email: userData.email,
            wallet_address: userData.wallet_address,
          });

          // Step 5: Navigate to dashboard
          console.log("🎯 AUTH CALLBACK: Success - redirecting to dashboard");
          navigate("/user/dashboard", { replace: true });
        } catch (profileError) {
          console.log("❌ AUTH CALLBACK: Profile creation failed", {
            error:
              profileError instanceof Error
                ? profileError.message
                : "Unknown error",
          });
          throw profileError;
        }
      } catch (error) {
        console.log("💥 AUTH CALLBACK: Process failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        navigate("/?message=failed_loading", { replace: true });
      }
    }

    handleAuth();
  }, [searchParams, navigate, updateUser]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500">
            <Loader2 className="h-12 w-12 text-blue-500" />
          </div>
          <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-600">
            Setting up your profile...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-500 mb-4">Authentication Failed</h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Successful authentication with user data
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Welcome, {user?.name || "User"}!</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

// Loading fallback for Suspense
const AuthCallbackLoading: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-600">
          Loading...
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense
const AuthCallbackPage: React.FC = () => {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
};

export default AuthCallbackPage;
