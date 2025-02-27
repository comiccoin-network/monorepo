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
      {/* Navigation bar */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <Coins className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                ComicCoin Faucet
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {/*
              <Link
                to="/"
                className="text-white hover:text-indigo-200 transition-colors px-2 py-1"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-indigo-200 transition-colors px-2 py-1"
              >
                About
              </Link>
              <Link
                to="/docs"
                className="text-white hover:text-indigo-200 transition-colors px-2 py-1"
              >
                Documentation
              </Link>
              {/*
              

              {/* Conditional button based on showBackButton prop */}
              {showBackButton ? (
                <Link
                  to="/"
                  className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm sm:text-base active:bg-purple-100 ml-2"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Back to Home</span>
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm sm:text-base active:bg-purple-100 ml-2"
                >
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Claim Coins</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-md"
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-purple-800 border-t border-purple-600 py-2 pb-4">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/docs"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-purple-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>

              {/* Conditional mobile button */}
              {showBackButton ? (
                <Link
                  to="/"
                  className="block mt-4 bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Home</span>
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  className="block mt-4 bg-white text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center gap-2 text-base w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Coins className="w-5 h-5" />
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
