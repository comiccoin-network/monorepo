// src/components/UserTopNavigation.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Globe,
  LogOut,
  Ellipsis,
  ClipboardList,
  Home,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const UserTopNavigation = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine active tab based on current path
  const isActive = (path) => {
    // For the dashboard, still require exact match
    if (path === "/dashboard") return location.pathname === "/dashboard";

    // For public wallets section, check if the current path starts with /public-wallets
    if (path === "/public-wallets")
      return location.pathname.startsWith("/public-wallets");

    // For transactions section, check if the current path starts with /transactions
    if (path === "/transactions")
      return location.pathname.startsWith("/transactions");

    // For the more section
    if (path === "/more") return location.pathname.startsWith("/more");

    // Default case, exact match
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <Globe
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white"
              aria-hidden="true"
            />
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              ComicCoin Digital Identity
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex items-center space-x-2">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
                aria-current={isActive("/dashboard") ? "page" : undefined}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Dashboard
                </span>
              </Link>

              <Link
                to="/public-wallets"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/public-wallets")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
                aria-current={isActive("/public-wallets") ? "page" : undefined}
              >
                <span className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Public Wallets
                </span>
              </Link>

              <Link
                to="/more"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/more")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
                aria-current={isActive("/more") ? "page" : undefined}
              >
                <span className="flex items-center gap-2">
                  <Ellipsis className="h-5 w-5" />
                  More
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="ml-2 bg-white text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-purple-100 hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={
                isMobileMenuOpen ? "Close main menu" : "Open main menu"
              }
            >
              <span className="sr-only">
                {isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              </span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden bg-purple-800 border-t border-purple-700"
          id="mobile-menu"
        >
          <div className="py-2 space-y-1 px-4">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/dashboard")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Dashboard
              </span>
            </Link>

            <Link
              to="/public-wallets"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/public-wallets")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Public Wallets
              </span>
            </Link>

            <Link
              to="/more"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/more")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Ellipsis className="h-5 w-5" />
                More
              </span>
            </Link>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-100 hover:bg-red-600 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default UserTopNavigation;
