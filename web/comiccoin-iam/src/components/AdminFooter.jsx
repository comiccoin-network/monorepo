// monorepo/web/comiccoin-iam/src/components/AdminFooter.jsx
import React from "react";
import { Link, useLocation } from "react-router";
import {
  Github,
  FileText,
  Shield,
  HelpCircle,
  Coins,
  ExternalLink,
  ArrowRight,
  Wallet,
} from "lucide-react";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Get the current path to use as a referrer
  const currentPath = location.pathname;

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Logo and Copyright */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-3">
              <Coins
                className="h-6 w-6 text-purple-300 mr-2"
                aria-hidden="true"
              />
              <div className="font-bold text-lg">ComicCoin Network</div>
            </div>
            <p className="text-purple-200 text-sm">
              The trusted platform for secure digital identity management and
              wallet verification in the ComicCoin ecosystem.
            </p>
            <div className="text-purple-200 text-xs mt-4">
              © {currentYear} All rights reserved
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="text-purple-200 hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/public-wallets"
                  className="text-purple-200 hover:text-white text-sm transition-colors"
                >
                  Public Wallets
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-purple-200 hover:text-white text-sm transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200 mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/terms?referrer=${encodeURIComponent(currentPath)}`}
                  className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>Terms</span>
                  <ArrowRight
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </Link>
              </li>
              <li>
                <Link
                  to={`/privacy?referrer=${encodeURIComponent(currentPath)}`}
                  className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
                >
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  <span>Privacy</span>
                  <ArrowRight
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </Link>
              </li>
              <li>
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
              </li>
              <li>
                <a
                  href="https://github.com/comiccoin-network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-200 hover:text-white flex items-center gap-1.5 group transition-colors text-sm"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>GitHub</span>
                  <ExternalLink
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-purple-600 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-purple-300">
          <div>Version 1.1.0</div>
          <div>
            <a
              href="#main-content"
              className="text-purple-300 hover:text-white transition-colors"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
