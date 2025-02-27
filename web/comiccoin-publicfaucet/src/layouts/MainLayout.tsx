import React, { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useMe } from "../hooks/useMe";
import { withAuth } from "../hocs/withAuth";
import {
  Menu,
  X,
  Home,
  FileText,
  Settings,
  LogOut,
  Heart,
  Coins,
  Shield,
  Github,
  Globe,
  Wallet,
  ExternalLink,
  Code,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router";
import { useGetFaucet } from "../hooks/useGetFaucet";

const MainLayoutContent: React.FC = () => {
  const { logout } = useMe();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get faucet data for the footer
  const { faucet, isLoading, error } = useGetFaucet({
    chainId: 1,
    enabled: true,
    refreshInterval: 60000,
  });

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

      {/* Header - Redesigned with purple gradient and better accessibility */}
      <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo section - Removed white circle background */}
            <div className="flex items-center">
              <div className="flex-shrink-0" aria-hidden="true">
                <Coins className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
              <h1 className="ml-3 text-xl sm:text-2xl lg:text-3xl font-bold text-white">ComicCoin Faucet</h1>
            </div>

            {/* Desktop navigation - enhanced accessibility */}
            <nav className="hidden md:block" aria-label="Main Navigation">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateTo("/user/dashboard")}
                  className={`px-4 py-3 rounded-lg text-base font-medium flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white ${
                    isActive('/user/dashboard')
                      ? 'bg-indigo-600 text-white'
                      : 'text-white hover:bg-indigo-600'
                  }`}
                  aria-current={isActive('/user/dashboard') ? 'page' : undefined}
                >
                  <Home className="w-5 h-5" aria-hidden="true" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => navigateTo("/user/transactions")}
                  className={`px-4 py-3 rounded-lg text-base font-medium flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white ${
                    isActive('/user/transactions')
                      ? 'bg-indigo-600 text-white'
                      : 'text-white hover:bg-indigo-600'
                  }`}
                  aria-current={isActive('/user/transactions') ? 'page' : undefined}
                >
                  <FileText className="w-5 h-5" aria-hidden="true" />
                  <span>Transactions</span>
                </button>
                <button
                  onClick={() => navigateTo("/user/settings")}
                  className={`px-4 py-3 rounded-lg text-base font-medium flex items-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white ${
                    isActive('/user/settings')
                      ? 'bg-indigo-600 text-white'
                      : 'text-white hover:bg-indigo-600'
                  }`}
                  aria-current={isActive('/user/settings') ? 'page' : undefined}
                >
                  <Settings className="w-5 h-5" aria-hidden="true" />
                  <span>Settings</span>
                </button>

                {/* Enhanced logout button with improved accessibility */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-lg text-base font-medium flex items-center space-x-2 bg-white text-purple-700 hover:bg-purple-50 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-purple-500"
                  aria-label="Logout from your account"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>

            {/* Mobile section - menu button with improved accessibility */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-3 rounded-md text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state - improved accessibility */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-indigo-800 border-t border-indigo-700" id="mobile-menu" aria-label="Mobile Navigation">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => navigateTo("/user/dashboard")}
                className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-white ${
                  isActive('/user/dashboard')
                    ? 'bg-indigo-600 text-white'
                    : 'text-white hover:bg-indigo-600'
                }`}
                aria-current={isActive('/user/dashboard') ? 'page' : undefined}
              >
                <Home className="w-5 h-5 mr-3" aria-hidden="true" />
                Dashboard
              </button>
              <button
                onClick={() => navigateTo("/user/transactions")}
                className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-white ${
                  isActive('/user/transactions')
                    ? 'bg-indigo-600 text-white'
                    : 'text-white hover:bg-indigo-600'
                }`}
                aria-current={isActive('/user/transactions') ? 'page' : undefined}
              >
                <FileText className="w-5 h-5 mr-3" aria-hidden="true" />
                Transactions
              </button>
              <button
                onClick={() => navigateTo("/user/settings")}
                className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-white ${
                  isActive('/user/settings')
                    ? 'bg-indigo-600 text-white'
                    : 'text-white hover:bg-indigo-600'
                }`}
                aria-current={isActive('/user/settings') ? 'page' : undefined}
              >
                <Settings className="w-5 h-5 mr-3" aria-hidden="true" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-md text-base font-medium flex items-center bg-white text-purple-700 mt-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Logout from your account"
              >
                <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main content with explicit landmark */}
      <main id="main-content" className="flex-1" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Enhanced Footer - Matching FaucetPage styling with improved accessibility */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-12 pb-6" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About Section */}
            <div className="lg:col-span-2">
              <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-300" aria-hidden="true" />
                <span>ComicCoin Network</span>
              </h2>
              <p className="text-white mb-4 max-w-md">
                A community-driven blockchain platform designed for comic collectors and creators.
                We're building an accessible ecosystem that connects fans with their favorite comics
                while empowering artists and publishers through blockchain technology.
              </p>
            </div>

            {/* Resources Links */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-white" aria-hidden="true" />
                <span>Resources</span>
              </h2>
              <ul className="space-y-3" aria-label="Resource links">
                <li>
                  <a
                    href="https://github.com/comiccoin-network/monorepo"
                    className="text-white hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5 text-white group-hover:text-purple-200" aria-hidden="true" />
                    <span>GitHub Repository</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://comiccoinnetwork.com"
                    className="text-white hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-5 w-5 text-white group-hover:text-purple-200" aria-hidden="true" />
                    <span>Project Website</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://comiccoinwallet.com"
                    className="text-white hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Wallet className="h-5 w-5 text-white group-hover:text-purple-200" aria-hidden="true" />
                    <span>Official Wallet</span>
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-white" aria-hidden="true" />
                <span>Legal</span>
              </h2>
              <ul className="space-y-3" aria-label="Legal links">
                <li>
                  <Link
                    to="/terms"
                    className="text-white hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md"
                  >
                    <FileText className="h-5 w-5 text-white group-hover:text-purple-200" aria-hidden="true" />
                    <span>Terms of Service</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-white hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md"
                  >
                    <BookOpen className="h-5 w-5 text-white group-hover:text-purple-200" aria-hidden="true" />
                    <span>Privacy Policy</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-white hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded-md"
                  >
                    <FileText className="h-5 w-5 text-white group-hover:text-purple-200" aria-hidden="true" />
                    <span>Contact Us</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Network Stats Section */}
          {!isLoading && !error && faucet && (
            <div className="border-t border-purple-600 pt-6 mb-6">
              <div className="text-center">
                <p className="text-lg font-medium mb-2 text-white">Network Status</p>
                <p className="text-xl font-bold text-white">
                  {faucet.users_count?.toLocaleString() || "0"}+ Active Users
                </p>
              </div>
            </div>
          )}

          {/* Copyright Section */}
          <div className="text-center pt-6 border-t border-purple-500/30">
            <p className="flex items-center justify-center gap-2 text-white">
              <span>
                © {currentYear} ComicCoin Network. All rights reserved.
              </span>
            </p>
            <p className="mt-2 text-base text-white">
              Built with ❤️ by the ComicCoin community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Protect the entire layout with auth HOC
const MainLayout = withAuth(MainLayoutContent);
export default MainLayout;
