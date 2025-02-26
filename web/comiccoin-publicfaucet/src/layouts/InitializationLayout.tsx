import React from "react";
import { Outlet, useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";
import { X } from "lucide-react";

/**
 * Layout component for user initialization flows like wallet setup
 * Provides a restricted interface with no navigation to other app sections
 */
const InitializationLayoutContent: React.FC = () => {
  const { user, logout } = useMe();
  const navigate = useNavigate();

  // Custom logout handler
  const handleLogout = () => {
    logout();
    window.location.href = "/get-started";
  };

  return (
    <div className="min-h-screen flex flex-col bg-purple-50">
      {/* Simplified header - just logo and logout */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            {/* Logo section */}
            <div className="flex items-center">
              <img src="/appicon-1024x1024.svg" alt="ComicCoin" className="h-8 w-auto" />
              <h1 className="ml-3 text-lg sm:text-xl font-bold text-purple-800">
                ComicCoin Faucet
              </h1>
            </div>

            {/* Only logout option */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100"
              title="Logout"
            >
              <X className="h-5 w-5" />
              <span className="ml-1 hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ComicCoin Network. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Protect the initialization layout with auth HOC
const InitializationLayout = withAuth(InitializationLayoutContent);
export default InitializationLayout;
