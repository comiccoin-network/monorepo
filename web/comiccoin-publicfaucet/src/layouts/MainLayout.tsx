import React, { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";
import { Menu, X } from "lucide-react";

const MainLayoutContent: React.FC = () => {
  const { logout } = useMe();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Direct navigation function
  const navigateTo = useCallback((path: string) => {
    // Force page reload with the new URL
    window.location.href = path;
    // Close the mobile menu after navigation
    setMobileMenuOpen(false);
  }, []);

  // Custom logout handler
  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/get-started";
  }, [logout]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo section */}
            <div className="flex items-center">
              <img src="/appicon-1024x1024.svg" alt="ComicCoin" className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">ComicCoin Faucet</h1>
            </div>

            {/* Desktop navigation - shown on medium screens and up */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateTo("/user/dashboard")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/user/dashboard')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigateTo("/user/transactions")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/user/transactions')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => navigateTo("/user/settings")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/user/settings')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </button>

                {/* Simple logout button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile section - menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => navigateTo("/user/dashboard")}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/user/dashboard')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateTo("/user/transactions")}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/user/transactions')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => navigateTo("/user/settings")}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/user/settings')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
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

// Protect the entire layout with auth HOC
const MainLayout = withAuth(MainLayoutContent);
export default MainLayout;
