// src/pages/More/Page.jsx
import React from "react";
import { useNavigate } from "react-router";
import { Settings, LogOut, Trash2, ArrowRight, Menu } from "lucide-react";

import UserTopNavigation from "../../../components/UserTopNavigation";
import UserFooter from "../../../components/UserFooter";
import { useAuth } from "../../../hooks/useAuth";

function MorePageContent() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Navigation handlers
  const handleNavigateToSettings = () => navigate("/settings");
  const handleNavigateToDeleteAccount = () => navigate("/delete-account");
  const handleLogout = () => logout();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <UserTopNavigation />

      <main
        id="main-content"
        className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl flex-grow"
      >
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-3">
              <Menu className="h-5 w-5 text-purple-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">
                More Options
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your account and access additional features
              </p>
            </div>
          </div>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Card */}
          <button
            onClick={handleNavigateToSettings}
            className="bg-white rounded-xl p-6 shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300 text-left w-full hover:border-purple-400"
            aria-label="Go to settings page"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full p-4 mb-4 transform transition-transform duration-300 hover:scale-110">
                <Settings
                  className="h-8 w-8 text-purple-600"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600 mb-4 flex-grow">
                Update your profile and account preferences
              </p>
              <div className="flex items-center text-purple-600 font-medium group">
                <span>Go to Settings</span>
                <ArrowRight
                  className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </div>
          </button>

          {/* Delete Account Card */}
          <button
            onClick={handleNavigateToDeleteAccount}
            className="bg-white rounded-xl p-6 shadow-md border border-red-100 hover:shadow-lg transition-all duration-300 text-left w-full hover:border-red-400"
            aria-label="Go to delete account page"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 rounded-full p-4 mb-4 transform transition-transform duration-300 hover:scale-110">
                <Trash2 className="h-8 w-8 text-red-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Delete Account
              </h2>
              <p className="text-gray-600 mb-4 flex-grow">
                Permanently delete your account and all associated data
              </p>
              <div className="flex items-center text-red-600 font-medium group">
                <span>Delete Account</span>
                <ArrowRight
                  className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </div>
          </button>

          {/* Logout Card */}
          <button
            onClick={handleLogout}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 text-left w-full hover:border-gray-400"
            aria-label="Logout from your account"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4 transform transition-transform duration-300 hover:scale-110">
                <LogOut className="h-8 w-8 text-gray-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Logout</h2>
              <p className="text-gray-600 mb-4 flex-grow">
                Sign out from your account
              </p>
              <div className="flex items-center text-gray-600 font-medium group">
                <span>Logout Now</span>
                <ArrowRight
                  className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </div>
            </div>
          </button>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}

// // Wrap the component with HOC to match pattern used in other pages
const UserMorePage = MorePageContent;
// export default MorePage;
export default UserMorePage;
