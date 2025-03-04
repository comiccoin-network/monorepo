// src/components/AppFooter.jsx
import React from "react";
import { Link } from "react-router";
import { Github, FileText, Shield, HelpCircle } from "lucide-react";

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-3 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          {/* Copyright */}
          <div className="mb-2 md:mb-0 text-gray-500 text-xs">
            © {currentYear} ComicCoin Network. All rights reserved.
          </div>

          {/* Version */}
          <div className="text-gray-400 text-xs mb-2 md:mb-0 order-3 md:order-2">
            Version 1.0.0
          </div>

          {/* Links */}
          <div className="flex space-x-6 order-2 md:order-3 mb-2 md:mb-0">
            <Link
              to="/help"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-xs"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Help</span>
            </Link>

            <Link
              to="/terms"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-xs"
            >
              <FileText className="h-3 w-3" />
              <span>Terms</span>
            </Link>

            <Link
              to="/privacy"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-xs"
            >
              <Shield className="h-3 w-3" />
              <span>Privacy</span>
            </Link>

            <a
              href="https://github.com/comiccoin-network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-xs"
            >
              <Github className="h-3 w-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
