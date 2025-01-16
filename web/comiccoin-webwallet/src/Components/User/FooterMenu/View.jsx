import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
  Mail,
  Heart,
  Shield,
  HelpCircle,
  FileText,
  Book,
  Users
} from 'lucide-react';

const FooterMenu = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Security', href: '/security' },
      { name: 'Roadmap', href: '/roadmap' },
      { name: 'Pricing', href: '/pricing' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Status', href: '/status' },
      { name: 'Contact', href: '/contact' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Licenses', href: '/licenses' }
    ],
    community: [
      { name: 'Blog', href: '/blog' },
      { name: 'Forum', href: '/forum' },
      { name: 'Discord', href: '/discord' },
      { name: 'GitHub', href: '/github' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/comiccoin' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/comiccoin' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/comiccoin' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/comiccoin' }
  ];

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="text-gray-300 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${social.name}`}
            >
              <social.icon className="w-6 h-6" />
            </a>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-600 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-sm">Protected by</span>
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">SSL Security</span>
            </div>

            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm">
                © {currentYear} ComicCoin Web Wallet. All rights reserved.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm">Made with</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm">by ComicCoin Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterMenu;
