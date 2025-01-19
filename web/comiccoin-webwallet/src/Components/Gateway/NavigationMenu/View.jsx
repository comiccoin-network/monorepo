// src/Components/User/NavigationMenu/View.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet,
  Send,
  ArrowDownRight,
  ArrowUpRight,
  Image as ImageIcon,
  MoreHorizontal,
  Menu,
  X,
  LogOut,
  Home,
  Globe,
  Monitor,
  ArrowRight,
  Coins
} from 'lucide-react';

const NavigationMenu = (props) => {
  // Developers Note:
  // This needs to always be above any GUI rendering, or else react.js will error.
  const location = useLocation();

  //
  // LANDPAGE
  //
  if (location.pathname === "/") {
      return (
        <>
        {/* Platform Selection Banner */}
        <div className="bg-purple-900 text-white py-4 px-4" role="banner">
          <div className="max-w-6xl mx-auto flex flex-col space-y-2 sm:space-y-0 sm:flex-row items-center justify-between text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Globe aria-hidden="true" className="h-5 w-5" />
              <span className="text-sm sm:text-base">You're using the <strong>Web Wallet</strong></span>
            </div>
            <Link
              to="/download-native-wallet"
              className="text-purple-200 hover:text-white flex items-center gap-1 text-sm whitespace-nowrap"
            >
              <Monitor className="h-4 w-4" />
              <span>Desktop Wallet</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Wallet className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-xl sm:text-2xl font-bold">
                  ComicCoin Web Wallet
                </span>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <Link
                  to="/create-wallet"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-center"
                >
                  Create Wallet
                </Link>
                <Link
                  to="/login"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white hover:bg-purple-50 text-purple-700 font-bold text-center"
                >
                  Access Wallet
                </Link>
              </div>
            </div>
          </div>
        </nav>
        </>
      );
  }

//
     // NON-LANDPAGE
     //
     if (location.pathname !== "/") {
      return (
         <>
         {/* Platform Selection Banner */}
         {location.pathname === "/" ?
          <div className="bg-purple-900 text-white py-4 px-4" role="banner">
           <div className="max-w-6xl mx-auto flex flex-col space-y-2 sm:space-y-0 sm:flex-row items-center justify-between text-center sm:text-left">
             <div className="flex items-center gap-2">
               <Globe aria-hidden="true" className="h-5 w-5" />
               <span className="text-sm sm:text-base">You're using the <strong>Web Wallet</strong></span>
             </div>
             <Link
               to="/download-native-wallet"
               className="text-purple-200 hover:text-white flex items-center gap-1 text-sm whitespace-nowrap"
             >
               <Monitor className="h-4 w-4" />
               <span>Desktop Wallet</span>
               <ArrowRight className="h-4 w-4" />
             </Link>
           </div>
         </div>:
         <div className="bg-purple-900 text-white py-4 px-4" role="banner">
          <div className="max-w-6xl mx-auto flex flex-col space-y-2 sm:space-y-0 sm:flex-row items-center justify-between text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Monitor aria-hidden="true" className="h-5 w-5" />
              <span className="text-sm sm:text-base">You're viewing the <strong>Native Wallet Download</strong> page</span>
            </div>
            <Link
              to="/"
              className="text-purple-200 hover:text-white flex items-center gap-1 text-sm whitespace-nowrap"
            >
              <Globe className="h-4 w-4" />
              <span>Web Wallet</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
         }

         {/* Navigation */}
         <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
           <div className="max-w-6xl mx-auto px-4 py-4">
             <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
               <div className="flex items-center space-x-2">
                 <Wallet className="h-6 w-6 sm:h-8 sm:w-8" />
                 <span className="text-xl sm:text-2xl font-bold">
                   ComicCoin Web Wallet
                 </span>
               </div>
               <div className="flex space-x-4">
                 <Link to="/help" className="text-white hover:text-purple-200 px-3 py-2">Help</Link>
                 <Link to="/" className="text-white hover:text-purple-200 px-3 py-2">Home</Link>
               </div>
             </div>
           </div>
         </nav>
         </>
      );
    }

  return (
      <>tesT</>
  );
};

export default NavigationMenu;
