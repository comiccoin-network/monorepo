import React from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  BookOpen,
  Github,
  ArrowRight,
  Wallet,
  Key,
  FileText,
  Shield,
  Globe,
  Code,
  ExternalLink,
  BookMarked,
  Heart,
  RefreshCw
} from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Project Resources */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-6 text-lg flex items-center justify-center md:justify-start gap-2">
              <Code className="h-5 w-5 text-purple-300" />
              <span>Project Resources</span>
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://github.com/comiccoin-network/monorepo"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <Github className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://comiccoinnetwork.com"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <Globe className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Project Website</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              {/*
              <li>
                <a
                  href="/docs"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <BookMarked className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Documentation</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            */}
          </ul>
          </div>

          {/* Account Section */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-6 text-lg flex items-center justify-center md:justify-start gap-2">
              <Wallet className="h-5 w-5 text-purple-300" />
              <span>Account</span>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/create-wallet"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <Key className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Create Wallet</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <Coins className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Access Wallet</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link
                  to="/recover"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Recover Wallet</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-6 text-lg flex items-center justify-center md:justify-start gap-2">
              <Shield className="h-5 w-5 text-purple-300" />
              <span>Legal</span>
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="/terms"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Terms of Service</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-3 group transition-colors duration-200"
                >
                  <BookOpen className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Privacy Policy</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center pt-6 border-t border-purple-500/30">
          <p className="flex items-center justify-center gap-2 text-purple-200">
            <Heart className="h-4 w-4 text-purple-300" />
            <span>© {currentYear} ComicCoin Network. All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
