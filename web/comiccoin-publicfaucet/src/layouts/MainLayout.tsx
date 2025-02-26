// src/layouts/MainLayout.tsx
import React, { useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";

const MainLayoutContent: React.FC = () => {
  const { user, logout } = useMe();
  const location = useLocation();
  const navigate = useNavigate();

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Direct navigation function
  const navigateTo = useCallback((path: string) => {
    // Force page reload with the new URL
    window.location.href = path;
  }, []);

  // Custom logout handler
  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/get-started";
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/logo.svg" alt="ComicCoin" className="h-8" />
            <h1 className="text-xl font-bold">ComicCoin Faucet</h1>
          </div>

          {/* User profile display */}
          <div className="relative">
            <div className="flex items-center space-x-2 cursor-pointer">
              <span>{user?.name}</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar navigation */}
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <div className="bg-white p-4 rounded shadow">
              <nav className="space-y-2">
                {/* Plain buttons that trigger direct navigation */}
                <button
                  onClick={() => navigateTo("/user/dashboard")}
                  className={`block w-full text-left px-4 py-2 rounded ${
                    isActive('/user/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigateTo("/user/settings")}
                  className={`block w-full text-left px-4 py-2 rounded ${
                    isActive('/user/settings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 rounded hover:bg-red-100 text-red-600"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 md:ml-6">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ComicCoin Network. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// Protect the entire layout with auth HOC
const MainLayout = withAuth(MainLayoutContent);
export default MainLayout;
