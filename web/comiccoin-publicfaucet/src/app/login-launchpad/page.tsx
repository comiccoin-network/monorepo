// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/login-launchpad/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthorizationUrl } from "@/hooks/useAuthorizationUrl";
import { Loader2, ArrowRight, ExternalLink } from "lucide-react";

export default function LoginLaunchpadPage() {
  const router = useRouter();
  const [showManualButton, setShowManualButton] = useState(false);
  const [processedUrl, setProcessedUrl] = useState("");
  const [redirectUri, setRedirectUri] = useState<string>("");

  // Set up redirect URI once we're on the client side
  useEffect(() => {
    setRedirectUri(`${window.location.origin}/auth-callback`);
  }, []);

  // Initialize the authorization hook with the callback URL
  const { authUrl, state, expiresAt, isLoading, error } = useAuthorizationUrl({
    redirectUri: `${window.location.origin}/auth-callback`,
    scope: "read, write",
  });

  useEffect(() => {
    if (authUrl) {
      const updatedUrl = authUrl.replace("comiccoin_gateway", "127.0.0.1");
      setProcessedUrl(updatedUrl);
      console.log("Attempting redirect to:", updatedUrl);

      try {
        const opened = window.open(updatedUrl, "_self");

        if (!opened) {
          window.location.href = updatedUrl;
        }

        setTimeout(() => {
          setShowManualButton(true);
        }, 1000);
      } catch (e) {
        console.log("Redirect failed:", e);
        setShowManualButton(true);
      }
    }
  }, [authUrl]);

  const handleManualRedirect = () => {
    if (processedUrl) {
      if (state) {
        localStorage.setItem("auth_state", state);
      }
      window.open(processedUrl, "_blank");
      window.close();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-6">
            {isLoading && !showManualButton && (
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            )}

            <div className="space-y-3">
              {showManualButton ? (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Ready to Sign In
                  </h1>
                  <p className="text-gray-600">
                    For security reasons, we need you to click the button below
                    to continue with your login. A new tab will open, and this
                    window will close automatically.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {isLoading
                      ? "Preparing Your Login..."
                      : error
                        ? "Oops! Something Went Wrong"
                        : "Redirecting to Login..."}
                  </h1>
                  <p className="text-gray-600">
                    {isLoading
                      ? "We're setting up your secure login process. This will just take a moment."
                      : error
                        ? "We encountered an error while setting up your login."
                        : "You'll be redirected to our login page in a moment."}
                  </p>
                </>
              )}
            </div>

            {showManualButton && processedUrl && (
              <button
                onClick={handleManualRedirect}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
              >
                Continue to Login
                <ExternalLink className="h-5 w-5" />
              </button>
            )}

            {error && (
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => refetch()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  Try Again
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Go Back Home
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
