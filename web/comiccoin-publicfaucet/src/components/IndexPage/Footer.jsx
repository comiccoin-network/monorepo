// src/components/IndexPage/Footer.jsx
import { Link } from "react-router";
import {
  ExternalLink,
  Heart,
  Shield,
  Code,
  Github,
  Globe,
  Wallet,
  FileText,
  BookOpen,
  ArrowRight,
  Download,
  Smartphone,
} from "lucide-react";

const Footer = ({ isLoading, error, faucet, formatBalance }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Download App Section */}
        <div className="mb-12 py-8 px-6 bg-indigo-900/40 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">
                Get the ComicCoin Wallet
              </h2>
              <p className="text-purple-200 mb-6 max-w-md">
                Download our secure wallet app to manage your ComicCoins on the
                go. Available on iOS, Android, and as a web wallet.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://apps.apple.com/ca/app/comiccoin-wallet/id6741118881"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <div className="mr-3">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.86-3.1.43-1.1-.44-2.1-.48-3.26 0-1.46.62-2.2.44-3.1-.43C3.1 15.45 3.74 8.83 8.14 8.5c1.32.07 2.24.87 3.07.87.83 0 2.37-1.08 4-.92 1.53.13 2.72.77 3.47 1.97-3.12 1.95-2.6 5.93.33 7.16-.92 2.23-2.03 3.76-3.96 4.7zM12.9 7.34c-.76-1.27-.29-3.27 1.05-4.5 1.2 1.1 1.82 2.9 1.05 4.5-1.08.05-1.96-.27-2.1 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-xl font-semibold -mt-1">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.theshootingstarpress.comiccoinwallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <div className="mr-3">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="currentColor"
                    >
                      <path d="M17.9 5c.1.1.2.3.2.5v13c0 .2-.1.3-.2.5l-7.6-7 7.6-7zM4 18.1c-.1-.1-.1-.2-.1-.4V6.3c0-.1 0-.3.1-.4l7.7 6.1-7.7 6.1zM15.4 3.2l-9.8 5.6-2-1.6c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l2-1.6 9.8 5.6-9.8 5.6L4 13.8c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l2-1.6 9.4 5.4 9.4-5.4-9.8-5.6 9.8-5.6 9.4 5.4-9.4 5.4 9.8 5.6c.3.2.5.5.5.9 0 .3-.2.7-.5.9l-9.8 5.6L3.6 19c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l11.8-6.7 11.8 6.7c.3.2.5.5.5.9 0 .3-.2.7-.5.9l-11.8 6.7-11.8-6.7c-.3-.2-.5-.5-.5-.9 0-.3.2-.7.5-.9l11.8-6.7-11.8-6.7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-xl font-semibold -mt-1">
                      Google Play
                    </div>
                  </div>
                </a>
                <a
                  href="https://comiccoinwallet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  <span>Web Wallet</span>
                </a>
              </div>
            </div>
            {/* App Logo/Screenshot - replace the img src with your actual app icon */}
            <div className="flex-shrink-0">
              <div className="relative h-40 w-40 bg-purple-400 rounded-3xl overflow-hidden p-2 shadow-lg">
                <div className="absolute inset-0 bg-purple-300/50 backdrop-blur-sm"></div>
                <img
                  src="/apple-touch-icon.png"
                  alt="ComicCoin Wallet App"
                  className="h-full w-full object-contain relative z-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Sections */}
        <div className="flex flex-col md:flex-row md:space-x-24 mb-10">
          {/* About Section */}
          <div className="flex-1 mb-8 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-pink-300" />
              <h3 className="font-bold text-xl">ComicCoin Network</h3>
            </div>
            <p className="text-purple-200 pr-4">
              A community-driven blockchain platform designed for comic
              collectors and creators. We're building an accessible ecosystem
              that connects fans with their favorite comics while empowering
              artists and publishers through blockchain technology.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row sm:space-x-24">
            {/* Resources Column */}
            <div className="mb-8 sm:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-4 w-4 text-purple-300" />
                <h3 className="font-bold text-lg">Resources</h3>
              </div>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/comiccoin-network/monorepo"
                    className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                    <span>GitHub Repository</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://comiccoinnetwork.com"
                    className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                    <span>Project Website</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://comiccoinwallet.com"
                    className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Wallet className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                    <span>Official Wallet</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-purple-300" />
                <h3 className="font-bold text-lg">Legal</h3>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                    <span>Terms of Service</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                  >
                    <BookOpen className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                    <span>Privacy Policy</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Network Stats Section */}
        {!isLoading && !error && faucet && (
          <div className="border-t border-purple-600 pt-6 mb-8">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-x-16 md:gap-x-24 lg:gap-x-32">
                <div className="text-center">
                  <p className="text-sm font-medium mb-1 text-purple-300">
                    Active Users
                  </p>
                  <p className="text-xl font-bold text-white">
                    {faucet.users_count?.toLocaleString() || "0"}+
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1 text-purple-300">
                    Coins Distributed
                  </p>
                  <p className="text-xl font-bold text-white">
                    {formatBalance(faucet?.total_coins_distributed)}+
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium mb-1 text-purple-300">
                    Distribution Rate
                  </p>
                  <p className="text-xl font-bold text-white">
                    {faucet?.distribution_rate_per_day}/day
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copyright Section */}
        <div className="text-center pt-6 border-t border-purple-500/30">
          <p className="text-purple-200">
            © {currentYear} ComicCoin Network. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-purple-300">
            Built with ❤️ by the ComicCoin community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
