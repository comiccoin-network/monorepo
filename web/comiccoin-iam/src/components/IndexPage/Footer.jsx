// monorepo/web/comiccoin-iam/src/components/IndexPage/Footer.jsx
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
} from "lucide-react";

const Footer = ({ isLoading, error, faucet, formatBalance }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
