import Link from "next/link";
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Project Links */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-4">Project Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/comiccoin-network/monorepo"
                  className="hover:text-purple-200 flex items-center justify-center md:justify-start gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://comiccoinnetwork.com"
                  className="hover:text-purple-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Project Website
                </a>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/register" className="hover:text-purple-200">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-purple-200">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-purple-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-purple-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-4 border-t border-purple-500">
          <p>
            © {new Date().getFullYear()} ComicCoin Faucet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
