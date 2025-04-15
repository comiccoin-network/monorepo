// src/components/AdminTopNavigation.jsx
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
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const AdminTopNavigation = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPath = location.pathname;

  // Improved active tab detection logic
  const isActive = (path) => {
    // If we're checking for dashboard, only match exact path
    if (path === "/admin/dashboard") {
      return currentPath === "/admin/dashboard";
    }

    // For other sections, check if the current path starts with the given path
    // But ensure we're not accidentally matching a different section that starts with the same characters
    if (path === "/admin/users") {
      return currentPath.startsWith("/admin/users");
    }

    if (path === "/admin/public-wallets") {
      return currentPath.startsWith("/admin/public-wallets");
    }

    if (path === "/admin/more") {
      return currentPath.startsWith("/admin/more");
    }

    // Default case - exact match
    return currentPath === path;
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when a navigation happens
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3"
            onClick={closeMenu}
          >
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
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/dashboard")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Dashboard
                </span>
              </Link>

              <Link
                to="/admin/users"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/users")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </span>
              </Link>

              {/* Wallet Management Link */}
              <Link
                to="/admin/public-wallets"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/public-wallets")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Management
                </span>
              </Link>

              <Link
                to="/admin/more"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/admin/more")
                    ? "bg-purple-800 text-white"
                    : "text-purple-100 hover:bg-purple-600 hover:text-white"
                }`}
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
              to="/admin/dashboard"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/admin/dashboard")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={closeMenu}
            >
              <span className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Dashboard
              </span>
            </Link>

            <Link
              to="/admin/users"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/admin/users")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={closeMenu}
            >
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </span>
            </Link>

            {/* Mobile Wallet Management Link */}
            <Link
              to="/admin/public-wallets"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/admin/public-wallets")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={closeMenu}
            >
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Management
              </span>
            </Link>

            <Link
              to="/admin/more"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive("/admin/more")
                  ? "bg-purple-700 text-white"
                  : "text-purple-100 hover:bg-purple-700 hover:text-white"
              }`}
              onClick={closeMenu}
            >
              <span className="flex items-center gap-2">
                <Ellipsis className="h-5 w-5" />
                More
              </span>
            </Link>

            <button
              onClick={() => {
                closeMenu();
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

export default AdminTopNavigation;
