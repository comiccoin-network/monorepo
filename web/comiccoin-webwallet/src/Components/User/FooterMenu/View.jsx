// src/Components/User/FooterMenu/View.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Monitor,
  ArrowDownRight,
  Send,
  ArrowUpRight,
  Image,
  MoreHorizontal
} from 'lucide-react';

const FooterMenu = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const navigationItems = [
    { name: 'Desktop', icon: Home, path: '/dashboard' },
    { name: 'Receive', icon: ArrowDownRight, path: '/receive-coins' },
    { name: 'Send', icon: Send, path: '/send-coins' },
    { name: 'Trade', icon: ArrowUpRight, path: '/trade' },
    { name: 'NFTs', icon: Image, path: '/nfts' },
    { name: 'More', icon: MoreHorizontal, path: '/more' }
  ];

  const isActive = (path) => {
    // Handle exact matches and potential nested routes
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Mobile Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 pb-safe sm:hidden">
        <nav className="bg-white border-t border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between px-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex-1 flex flex-col items-center py-2 text-xs font-medium ${
                    isActive(item.path)
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive(item.path) ? 'text-purple-600' : 'text-gray-600'
                    }`}
                  />
                  <span className="mt-1 text-[10px]">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Desktop Footer */}
      <footer className="hidden sm:block bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© {currentYear} ComicCoin Network. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default FooterMenu;
