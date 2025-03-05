// src/components/AppFooter.jsx
import React from "react";
import { Link } from "react-router";
import { Github, FileText, Shield, HelpCircle, Heart } from "lucide-react";

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 mt-auto bg-white border-t border-purple-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="mb-4 md:mb-0 text-gray-600 text-sm">
            <div className="flex items-center justify-center md:justify-start gap-1 mb-1">
              <Heart className="h-4 w-4 text-purple-500" />
              <span>
                © {currentYear} ComicCoin Network. All rights reserved.
              </span>
            </div>
          </div>

          {/* Version */}
          <div className="text-gray-500 text-xs mb-4 md:mb-0 order-3 md:order-2">
            Version 1.0.0
          </div>

          {/* Links */}
          <div className="flex space-x-6 order-2 md:order-3 mb-2 md:mb-0">
            <Link
              to="/terms"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-sm transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Terms</span>
            </Link>

            <Link
              to="/privacy"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-sm transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </Link>

            <a
              href="https://github.com/comiccoin-network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-sm transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
