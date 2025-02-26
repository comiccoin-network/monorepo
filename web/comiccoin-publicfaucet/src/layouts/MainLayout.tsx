// src/layouts/MainLayout.tsx
// src/layouts/MainLayout.tsx
import React, { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";
import { Menu, X, ChevronDown, User } from "lucide-react";

const MainLayoutContent: React.FC = () => {
  const { user, logout } = useMe();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
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
              </div>
            </div>

            {/* User profile dropdown */}
            <div className="relative flex items-center">
              {/* Profile dropdown button */}
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                onClick={toggleProfileDropdown}
              >
                <span className="hidden sm:inline-block text-sm text-gray-700">
                  {user?.name}
                </span>
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {user?.name?.charAt(0) || <User className="h-5 w-5" />}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 absolute -bottom-2 -right-2" />
                </div>
              </div>

              {/* Profile dropdown menu */}
              {profileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 top-full">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">
                    Signed in as<br/>
                    <span className="font-medium text-gray-900">{user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigateTo("/user/transactions");
                      setProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Transactions
                  </button>
                  <button
                    onClick={() => {
                      navigateTo("/user/settings");
                      setProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="ml-4 md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
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

      {/* Backdrop for profile dropdown - closes when clicked outside */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setProfileDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

// Protect the entire layout with auth HOC
const MainLayout = withAuth(MainLayoutContent);
export default MainLayout;
