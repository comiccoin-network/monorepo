import { FC, useState } from "react";
import { Link } from "react-router";
import { Coins, Menu, X, ArrowLeft } from "lucide-react";

interface HeaderProps {
  showBackButton?: boolean;
}

const Header: FC<HeaderProps> = ({ showBackButton = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0" aria-hidden="true">
                <Coins className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                ComicCoin Faucet
              </span>
            </div>

            {/* Desktop Navigation Links with enhanced accessibility */}
            <div className="hidden md:flex items-center space-x-6">
              {/*
              <Link
                to="/"
                className="text-white hover:text-indigo-200 transition-colors px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                aria-current={location.pathname === "/" ? "page" : undefined}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-indigo-200 transition-colors px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                aria-current={location.pathname === "/about" ? "page" : undefined}
              >
                About
              </Link>
              <Link
                to="/docs"
                className="text-white hover:text-indigo-200 transition-colors px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                aria-current={location.pathname === "/docs" ? "page" : undefined}
              >
                Documentation
              </Link>
              */}

              {/* Conditional button with improved accessibility */}
              {showBackButton ? (
                <Link
                  to="/"
                  className="bg-white text-purple-700 px-5 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base active:bg-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                  aria-label="Go back to home page"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Back to Home</span>
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  className="bg-white text-purple-700 px-5 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base active:bg-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                  aria-label="Start claiming ComicCoins"
                >
                  <Coins className="w-5 h-5" aria-hidden="true" />
                  <span>Claim Coins</span>
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
                <span className="sr-only">{isMenuOpen ? "Close main menu" : "Open main menu"}</span>
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
              {/*
              <Link
                to="/"
                className="block w-full px-4 py-3 rounded-md text-base font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-white flex items-center"
                onClick={() => setIsMenuOpen(false)}
                aria-current={location.pathname === "/" ? "page" : undefined}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block w-full px-4 py-3 rounded-md text-base font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-white flex items-center"
                onClick={() => setIsMenuOpen(false)}
                aria-current={location.pathname === "/about" ? "page" : undefined}
              >
                About
              </Link>
              <Link
                to="/docs"
                className="block w-full px-4 py-3 rounded-md text-base font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-white flex items-center"
                onClick={() => setIsMenuOpen(false)}
                aria-current={location.pathname === "/docs" ? "page" : undefined}
              >
                Documentation
              </Link>
              */}

              {/* Conditional mobile button with improved accessibility */}
              {showBackButton ? (
                <Link
                  to="/"
                  className="block mt-4 bg-white text-purple-700 px-4 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Go back to home page"
                >
                  <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  <span>Back to Home</span>
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  className="block mt-4 bg-white text-purple-700 px-4 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Start claiming ComicCoins"
                >
                  <Coins className="w-5 h-5" aria-hidden="true" />
                  <span>Claim Coins</span>
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
