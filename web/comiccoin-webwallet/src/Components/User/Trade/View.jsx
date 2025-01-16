import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Loader2,
  ArrowLeftRight,
  AlertCircle,
  Rocket
} from 'lucide-react';
import { useWallet } from '../../../Hooks/useWallet';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const TradePage = () => {
  const {
    currentWallet,
    loading: serviceLoading
  } = useWallet();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  if (!currentWallet) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavigationMenu />

      <main className="flex-grow max-w-3xl mx-auto px-4 py-12 mb-16 md:mb-0">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Trade</h1>
          <p className="text-xl text-gray-600">Exchange ComicCoins and NFTs</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ArrowLeftRight className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Trading Platform</h2>
            </div>
          </div>

          <div className="p-12 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-4 rounded-full mb-6">
              <Rocket className="w-12 h-12 text-purple-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trading Coming Soon!
            </h3>

            <p className="text-gray-600 max-w-md mb-8">
              We're working hard to bring you a seamless trading experience. Soon you'll be able to trade ComicCoins and NFTs right from your wallet.
            </p>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 max-w-md">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800 text-left">
                  <p className="font-semibold mb-1">Want to get notified?</p>
                  <p>Join our mailing list to be the first to know when trading goes live. Stay tuned for updates!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Upcoming Features</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Direct coin-to-coin trading
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  NFT marketplace integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Advanced trading tools and charts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Real-time coin and NFT listing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default TradePage;
