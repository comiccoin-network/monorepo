// monorepo/web/comiccoin-iam/src/components/IndexPage/Header.jsx
// src/components/IndexPage/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router";
import {
  Globe,
  Menu,
  X,
  ArrowRight,
  PlayCircle,
  ArrowLeft,
} from "lucide-react";

const Header = ({ showBackButton = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative z-10">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Navigation bar with improved accessibility */}
      <nav
        className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5">
            {/* Logo and Brand - Enhanced size and contrast */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex-shrink-0" aria-hidden="true">
                <Globe className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                ComicCoin Digital Identity
              </span>
            </Link>

            {/* Desktop Navigation Link */}
            <div className="hidden md:flex items-center">
              {showBackButton ? (
                /* Back to Home Button */
                <Link
                  to="/"
                  className="bg-white text-purple-700 px-5 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base active:bg-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                  aria-label="Go back to home page"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Back to Home</span>
                </Link>
              ) : (
                /* Get Started Button */
                <Link
                  to="/get-started"
                  className="bg-white text-purple-700 px-5 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base active:bg-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                  aria-label="Get started with ComicCoin Digital Identity"
                >
                  <PlayCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              )}
            </div>

            {/* Mobile menu button with improved accessibility */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-3 rounded-md text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-white"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
              >
                <span className="sr-only">
                  {isMenuOpen ? "Close main menu" : "Open main menu"}
                </span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu with improved accessibility */}
        {isMenuOpen && (
          <div
            className="md:hidden bg-purple-800 border-t border-purple-600 py-2 pb-4"
            id="mobile-menu"
            aria-label="Mobile Navigation"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {showBackButton ? (
                /* Back to Home Button for Mobile */
                <Link
                  to="/"
                  className="block mt-2 bg-white text-purple-700 px-4 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Go back to home page"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Back to Home</span>
                </Link>
              ) : (
                /* Get Started Button for Mobile */
                <Link
                  to="/get-started"
                  className="block mt-2 bg-white text-purple-700 px-4 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Get started with ComicCoin Digital Identity"
                >
                  <PlayCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
