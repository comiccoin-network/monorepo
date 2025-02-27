import { FC } from "react";
import { Link } from "react-router";
import {
  Shield,
  Github,
  Globe,
  Wallet,
  ExternalLink,
  Code,
  FileText,
  BookOpen,
  ArrowRight,
  Heart,
} from "lucide-react";

// Make this interface match what the parent component will pass
interface FaucetData {
  balance?: string;
  daily_coins_reward?: number;
  users_count?: number;
  total_coins_distributed?: string;
  total_coins_distributed_today?: number;
  total_transactions_today?: number;
  distribution_rate_per_day?: number;
}

interface FooterProps {
  isLoading: boolean;
  error: Error | null;
  faucet: FaucetData | null; // Changed from FaucetData | undefined to FaucetData | null
}

const Footer: FC<FooterProps> = ({ isLoading, error, faucet }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-300" />
              <span>ComicCoin Network</span>
            </h3>
            <p className="text-purple-200 mb-4 max-w-md">
              A community-driven blockchain platform designed for comic collectors and creators.
              We're building an accessible ecosystem that connects fans with their favorite comics
              while empowering artists and publishers through blockchain technology.
            </p>
            <div className="flex space-x-4 mt-4">
              {/*
              <a
                href="https://twitter.com/comiccoin"
                className="text-white hover:text-purple-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://discord.gg/comiccoin"
                className="text-white hover:text-purple-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914a.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
              <a
                href="https://github.com/comiccoin-network"
                className="text-white hover:text-purple-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
              */}
            </div>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-300" />
              <span>Resources</span>
            </h3>
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

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-300" />
              <span>Legal</span>
            </h3>
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
              <li>
                <Link
                  to="/contact"
                  className="hover:text-purple-200 flex items-center gap-2 group transition-colors duration-200"
                >
                  <FileText className="h-4 w-4 text-purple-300 group-hover:text-purple-200" />
                  <span>Contact Us</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Network Stats Section */}
        {!isLoading && !error && faucet && (
          <div className="border-t border-purple-600 pt-6 mb-6">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Network Status</p>
              <p className="text-xl font-bold text-purple-300">
                {faucet.users_count?.toLocaleString() || "0"}+ Active Users
              </p>
            </div>
          </div>
        )}

        {/* Copyright Section */}
        <div className="text-center pt-6 border-t border-purple-500/30">
          <p className="flex items-center justify-center gap-2 text-purple-200">
            <span>
              © {currentYear} ComicCoin Network. All rights reserved.
            </span>
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
