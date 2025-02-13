// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/dashboard/page.tsx
"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";

function DashboardPage() {
  const { isAuthenticated, tokens } = useAuthStore();
  const { user } = useMe();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p>Welcome to your dashboard!</p>

        {/* Authentication Status */}
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Authentication Status:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(
              {
                isAuthenticated,
                hasTokens: !!tokens,
                tokenExpiry: tokens ? new Date(tokens.expiresAt).toLocaleString() : 'No tokens',
                user: user ? {
                  name: user.name,
                  email: user.email
                } : 'No user data'
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
