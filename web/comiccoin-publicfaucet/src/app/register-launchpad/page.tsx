"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationUrl } from "@/hooks/useRegistrationUrl";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterLaunchpadPage() {
  const router = useRouter();
  const { registrationUrl, isLoading, error, refetch } = useRegistrationUrl();

  useEffect(() => {
    if (registrationUrl) {
      window.location.href = registrationUrl;
    }
  }, [registrationUrl]);

  // We're using min-h-screen to ensure the container takes up at least the full viewport height
  // The outer div uses flex and min-h-screen to create a full-height container
  // The inner main element uses flex-1 to take up all available space
  // We then use flex, items-center, and justify-center to center the content both vertically and horizontally
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isLoading
                  ? "Preparing Your Registration..."
                  : error
                    ? "Oops! Something Went Wrong"
                    : "Redirecting to Registration..."}
              </h1>
              <p className="text-gray-600">
                {isLoading
                  ? "We're setting up your registration process. This will just take a moment."
                  : error
                    ? "We encountered an error while setting up your registration."
                    : "You'll be redirected to our registration page in a moment."}
              </p>
            </div>

            {/* Only show buttons if there's an error */}
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
