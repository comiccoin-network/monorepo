// src/components/AppFooter.jsx
import React from "react";
import { Link } from "react-router";
import {
  Github,
  FileText,
  Shield,
  HelpCircle,
  Coins,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Main content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="mb-4 md:mb-0 flex items-center">
            <Coins
              className="h-5 w-5 text-purple-300 mr-2"
              aria-hidden="true"
            />
            <div>
              <div className="font-bold">ComicCoin Network</div>
              <div className="text-purple-200 text-xs">
                © {currentYear} All rights reserved
              </div>
            </div>
          </div>

          {/* Version info (only on medium screens and up) */}
          <div className="hidden md:block text-purple-200 text-xs">
            Version 1.0.0
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/help"
              className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span>Help</span>
              <ArrowRight
                className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/terms"
              className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>Terms</span>
              <ArrowRight
                className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/privacy"
              className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Privacy</span>
              <ArrowRight
                className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </Link>

            <a
              href="https://github.com/comiccoin-network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink
                className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Mobile version info (only on small screens) */}
        <div className="md:hidden text-center mt-3 text-purple-200 text-xs">
          Version 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
