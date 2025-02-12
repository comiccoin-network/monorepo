// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/register-canceled/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, Home } from "lucide-react";

export default function RegisterCanceledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 max-w-lg">
          <div className="flex flex-col items-center gap-6">
            {/* Icon with animation */}
            <div className="relative">
              <XCircle className="h-16 w-16 text-red-500 animate-fade-in" />
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-gray-900">
                Registration Canceled
              </h1>
              <p className="text-gray-600 text-lg">
                Your registration process has been canceled. You can return to
                the homepage or start a new registration whenever you're ready.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="h-5 w-5" />
                Return Home
              </button>
              <button
                onClick={() => router.push("/register-launchpad")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Try Again
              </button>
            </div>

            {/* Additional context */}
            <p className="text-sm text-gray-500 mt-6">
              Need help? Contact our support team at support@comiccoin.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
