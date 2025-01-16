// src/Components/User/More/View.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ClipboardList,
  Key,
  Droplets,
  ExternalLink,
  AlertCircle,
  Loader2,
  KeyRound,
  Network,
  BarChart3
} from 'lucide-react';

import { useWallet } from '../../../Hooks/useWallet';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";
import walletService from '../../../Services/WalletService';

const MorePage = () => {
  const {
    currentWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  // State for session management
  const [forceURL, setForceURL] = useState("");
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const menuItems = [
    {
      title: "Transactions",
      description: "View your complete transaction history",
      icon: ClipboardList,
      link: "/transactions",
      isExternal: false
    },

    // TODO: UNCOMMENT WHEN READY
    // {
    //   title: "Recovery Key",
    //   description: "View and backup your wallet recovery key",
    //   icon: Key,
    //   link: "/recovery-key",
    //   isExternal: false
    // },

    // TODO: UNCOMMENT WHEN READY
    // {
    //   title: "Password Change",
    //   description: "Update your wallet password",
    //   icon: KeyRound,
    //   link: "/change-password",
    //   isExternal: false
    // },

    // TODO: UNCOMMENT WHEN READY
    // {
    //   title: "Network Settings",
    //   description: "Configure blockchain network settings",
    //   icon: Network,
    //   link: "/network-settings",
    //   isExternal: false
    // },

    // TODO: UNCOMMENT WHEN READY
    // {
    //   title: "Block Explorer",
    //   description: "View detailed blockchain transactions",
    //   icon: BarChart3,
    //   link: "https://explorer.comiccoin.com",
    //   isExternal: true
    // },

    {
      title: "ComicCoin Faucet",
      description: "Get free test coins for development",
      icon: Droplets,
      link: "https://comiccoinfaucet.com",
      isExternal: true
    }
  ];

  // Session checking effect
  useEffect(() => {
    console.log('MorePage: Initial useEffect running');
    let mounted = true;

    const checkWalletSession = async () => {
      console.log('MorePage: checkWalletSession starting');
      try {
        if (!mounted) return;
        setIsLoading(true);

        if (serviceLoading) {
          console.log('MorePage: Service still loading, waiting...');
          return;
        }

        if (!currentWallet) {
          console.log('MorePage: No current wallet found, redirecting to login');
          if (mounted) {
            setForceURL("/login");
          }
          return;
        }

        // Check session using the wallet service
        if (!walletService.checkSession()) {
          throw new Error("Session expired");
        }

        if (mounted) {
          setForceURL("");
        }

      } catch (error) {
        console.error('MorePage: Session check error:', error);
        if (error.message === "Session expired" && mounted) {
          handleSessionExpired();
        } else if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkWalletSession();
    const sessionCheckInterval = setInterval(checkWalletSession, 60000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [currentWallet, serviceLoading]);

  const handleSessionExpired = () => {
    setIsSessionExpired(true);
    logout();
    setError("Your session has expired. Please sign in again.");
    setTimeout(() => {
      setForceURL("/login");
    }, 3000);
  };

  const handleSignOut = () => {
    logout();
    setForceURL("/login");
  };

  const MenuCard = ({ item }) => {
    const Icon = item.icon;
    const CardContent = () => (
      <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-colors group">
        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            {item.isExternal && <ExternalLink className="w-4 h-4 text-gray-400" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        </div>
      </div>
    );

    return item.isExternal ? (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <CardContent />
      </a>
    ) : (
      <Link to={item.link} className="block">
        <CardContent />
      </Link>
    );
  };

  if (forceURL !== "" && !serviceLoading) {
    console.log('MorePage: Navigating to:', forceURL);
    return <Navigate to={forceURL} />;
  }

  if (serviceLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <NavigationMenu onSignOut={handleSignOut} />

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">More Options</h1>
          <p className="text-xl text-gray-600">Access additional features and settings</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <MenuCard key={index} item={item} />
          ))}
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default MorePage;
