import React from "react";
import { Outlet } from "react-router";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";
import { Coins, LogOut, Heart } from "lucide-react";

/**
 * Layout component for user initialization flows like wallet setup
 * Provides a restricted interface with no navigation to other app sections
 * Enhanced with accessibility improvements and consistent styling
 */
const InitializationLayoutContent: React.FC = () => {
  const { logout } = useMe();

  // Custom logout handler
  const handleLogout = () => {
    logout();
    window.location.href = "/get-started";
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Header - Styled consistently with other layouts */}
      <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo section - Matches MainLayout */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0" aria-hidden="true">
                <Coins className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                ComicCoin Faucet
              </span>
            </div>

            {/* Simple Logout button with improved accessibility */}
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-200 font-medium text-base flex items-center gap-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Logout from your account"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content with explicit landmark */}
      <main id="main-content" className="flex-1" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer - Styled consistently with other layouts */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-6" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Simplified footer for initialization layout */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-5 w-5 text-pink-300 mr-2" aria-hidden="true" />
              <span className="text-lg font-bold">ComicCoin Network</span>
            </div>
            <p className="text-white mb-2">
              © {currentYear} ComicCoin Network. All rights reserved.
            </p>
            <p className="text-sm text-white">
              Built with ❤️ by the ComicCoin community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Protect the initialization layout with auth HOC
const InitializationLayout = withAuth(InitializationLayoutContent);
export default InitializationLayout;
