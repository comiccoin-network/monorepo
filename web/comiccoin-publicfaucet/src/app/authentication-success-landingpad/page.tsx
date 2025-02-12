// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/authentication-success-landingpad/page.tsx
// authentication-success-landingpad/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ArrowRight, XCircle } from "lucide-react";

type AuthState = "processing" | "success" | "error";

export default function AuthenticationSuccessLandingpadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [state, setState] = useState<{
    authState: AuthState;
    error: string;
  }>({
    authState: "processing",
    error: "",
  });

  const handleAuthentication = useCallback(async () => {
    try {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const expiresAt = searchParams.get("expires_at");

      if (!accessToken || !refreshToken || !expiresAt) {
        throw new Error("Missing required authentication tokens");
      }

      const expiresAtNum = parseInt(expiresAt, 10);
      if (isNaN(expiresAtNum)) {
        throw new Error("Invalid expiration timestamp");
      }

      await login({
        accessToken,
        refreshToken,
        expiresAt: expiresAtNum,
      });

      setState({ authState: "success", error: "" });

      // Add a delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Try using Next.js router first
        router.push("/user/dashboard");
      } catch (error) {
        // Fallback to window.location if router fails
        console.warn("Next.js router failed, using fallback navigation");
        window.location.href = "/user/dashboard";
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setState({
        authState: "error",
        error: err instanceof Error ? err.message : "Authentication failed",
      });
    }
  }, [searchParams, login, router]);

  useEffect(() => {
    handleAuthentication();
  }, [handleAuthentication]);

  const renderContent = () => {
    switch (state.authState) {
      case "processing":
        return {
          icon: (
            <div className="h-16 w-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ),
          title: "Completing Your Login...",
          message: "We're setting up your account. Just a moment...",
        };
      case "success":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "Welcome to ComicCoin! 🎉",
          message: "You'll be redirected to your dashboard in a moment.",
        };
      case "error":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "Authentication Error",
          message:
            state.error ||
            "There was a problem completing your authentication.",
        };
    }
  };

  const content = renderContent();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 max-w-lg">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">{content.icon}</div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-gray-900">
                {content.title}
              </h1>
              <p className="text-gray-600 text-lg">{content.message}</p>
            </div>

            {state.authState === "error" && (
              <div className="flex gap-4">
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  Try Again
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Go Home
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
