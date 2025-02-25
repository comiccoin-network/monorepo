// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/register-call/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationUrl } from "@/hooks/useRegistrationUrl";
import { Loader2, ArrowRight, ExternalLink } from "lucide-react";

export default function RegisterCallPage() {
  const router = useRouter();
  const { registrationUrl, isLoading, error, refetch } = useRegistrationUrl();
  const [showManualButton, setShowManualButton] = useState(false);
  const [processedUrl, setProcessedUrl] = useState("");

  useEffect(() => {
    if (registrationUrl) {
      const updatedUrl = registrationUrl.replace(
        "comiccoin_gateway",
        "127.0.0.1",
      );
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
  }, [registrationUrl]);

  const handleManualRedirect = () => {
    if (processedUrl) {
      // Open new tab
      window.open(processedUrl, "_blank");
      // Close current tab
      window.close();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Only show loader when loading and not showing manual button */}
            {isLoading && !showManualButton && (
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            )}

            <div className="space-y-3">
              {showManualButton ? (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Ready to Complete Registration
                  </h1>
                  <p className="text-gray-600">
                    For security reasons, we need you to click the button below
                    to continue with your registration. A new tab will open, and
                    this window will close automatically.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {isLoading
                      ? "Preparing Your Registration..."
                      : error
                        ? "Oops! Something Went Wrong"
                        : "Redirecting to Registration..."}
                  </h1>
                  <p className="text-gray-600">
                    {isLoading
                      ? "We're setting up your secure registration process. This will just take a moment."
                      : error
                        ? "We encountered an error while setting up your registration."
                        : "You'll be redirected to our registration page in a moment."}
                  </p>
                </>
              )}
            </div>

            {/* Manual redirect button with improved styling */}
            {showManualButton && processedUrl && (
              <button
                onClick={handleManualRedirect}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm hover:shadow-md"
              >
                Continue Registration
                <ExternalLink className="h-5 w-5" />
              </button>
            )}

            {/* Error state buttons */}
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
