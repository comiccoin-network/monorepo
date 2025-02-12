// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/login-success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiresAt = searchParams.get("expires_at");

    console.log("Tokens received:", {
      accessToken: accessToken?.substring(0, 10) + "...",
      refreshToken: refreshToken?.substring(0, 10) + "...",
      expiresAt,
    });

    if (accessToken && refreshToken && expiresAt) {
      login({
        accessToken,
        refreshToken,
        expiresAt: parseInt(expiresAt, 10),
      });
    }
  }, [searchParams, login]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 max-w-lg">
          <div className="flex flex-col items-center gap-6">
            {/* Success icon with animation */}
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
            </div>

            {/* Welcome message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-gray-900">
                Welcome to ComicCoin! 🎉
              </h1>
              <p className="text-gray-600 text-lg">
                Your login was successful! You're now ready to resume your
                journey in the comic-collecting community.
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => router.push("/user/dashboard")}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>

            {/* Getting started tips */}
            <div className="mt-8 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Tips to Get Started:
              </h2>
              <div className="space-y-3 text-gray-600">
                <p>• Upload your first comic to earn bonus coins</p>
                <p>• Complete your profile to unlock special features</p>
                <p>• Join our community events to meet fellow collectors</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
