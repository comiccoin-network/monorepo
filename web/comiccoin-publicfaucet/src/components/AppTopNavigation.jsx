// src/components/AppTopNavigation.jsx
import React from "react";
import { Link, useLocation } from "react-router";
import { Coins, LogOut, Settings, ClipboardList, Home } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const AppTopNavigation = () => {
  const location = useLocation();
  const { logout } = useAuth();

  // Determine active tab based on current path
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/dashboard") return true;
    return location.pathname === path;
  };

  return (
    <header className="bg-purple-700 text-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center py-2">
          {/* Logo and Brand */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-white" aria-hidden="true" />
            <span className="text-base font-bold">ComicCoin Faucet</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex items-center">
              <Link
                to="/dashboard"
                className={`px-2 py-1 rounded-md text-sm font-medium hover:bg-purple-600 ${
                  isActive("/dashboard") || isActive("/") ? "bg-purple-800" : ""
                }`}
              >
                <span className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Dashboard
                </span>
              </Link>

              <Link
                to="/transactions"
                className={`px-2 py-1 rounded-md text-sm font-medium hover:bg-purple-600 ${
                  isActive("/transactions") ? "bg-purple-800" : ""
                }`}
              >
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  Transactions
                </span>
              </Link>

              <Link
                to="/settings"
                className={`px-2 py-1 rounded-md text-sm font-medium hover:bg-purple-600 ${
                  isActive("/settings") ? "bg-purple-800" : ""
                }`}
              >
                <span className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Settings
                </span>
              </Link>

              {/* Claim Button */}
              <Link
                onClick={logout}
                className="ml-2 bg-white text-purple-700 hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </nav>
          </div>

          {/* Mobile Menu Button - simplified for this example */}
          <div className="md:hidden flex items-center">
            <Link
              to="/claim-coins"
              className="bg-white text-purple-700 hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"
            >
              <Coins className="h-4 w-4" />
              Claim Coins
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppTopNavigation;
