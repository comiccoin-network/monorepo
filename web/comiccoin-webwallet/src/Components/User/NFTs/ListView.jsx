import React, { useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Info,
  ArrowRight,
  ImageOff
} from 'lucide-react';
import { useWallet } from '../../../Hooks/useWallet';
import { useWalletTransactions } from '../../../Hooks/useWalletTransactions';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

const NFTListPage = () => {
    const {
      currentWallet,
      wallets,
      loadWallet,
      logout,
      loading: serviceLoading,
      error: serviceError
    } = useWallet();

    // Get the wallet address using the current HDNodeWallet format
   const getWalletAddress = () => {
     if (!currentWallet) return "";
     // HDNodeWallet stores the address in the address property
     return currentWallet.address;
   };

   const {
       transactions,
       loading: txLoading,
       error: txError,
       getNftTransactions,
       statistics
   } = useWalletTransactions(getWalletAddress());

   useEffect(() => {
       console.log('NFTListPage: useEffect running');
       console.log('Current wallet:', currentWallet);

       if (currentWallet?.address) {
           console.log('Fetching NFT transactions for address:', currentWallet.address);
           getNftTransactions();
       }
   }, [currentWallet, getNftTransactions]);  // Add proper dependencies


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

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 mb-16 md:mb-0">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">NFT Collection</h1>
          <p className="text-xl text-gray-600">View and manage your NFTs</p>
        </div>

        {/* Error Message */}
        {txError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error Loading NFTs</h3>
                <p className="text-sm text-red-600">{txError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-xl">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Collection Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total NFTs Owned</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.totalNftCount || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.nftTransactionsCount || 0}</p>
            </div>
          </div>
        </div>

        {/* NFT List */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your NFTs</h2>
              </div>

              {!txLoading && (
                <a
                  href="https://cpscapsule.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <span>Get Your Comics Graded</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading NFTs...</span>
            </div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ImageOff className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Found</h3>
              <p className="text-gray-500 mb-6">Submit your comic book for professional grading and get a corresponding NFT</p>
              <a
                href="https://cpscapsule.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Visit NFT Minting Service
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => {
                const isReceived = tx.to.toLowerCase() === currentWallet.address.toLowerCase();
                return (
                  <div key={tx.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-6">
                      {/* NFT Preview (placeholder) */}
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-purple-300" />
                      </div>

                      {/* NFT Details */}
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">NFT #{tx.tokenId || 'Unknown'}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isReceived ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isReceived ? 'Received' : 'Sent'}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Transaction: {tx.id.slice(0, 8)}...{tx.id.slice(-6)}</p>
                          <p>
                            {isReceived ? 'From: ' : 'To: '}
                            {isReceived ? tx.from.slice(0, 8) : tx.to.slice(0, 8)}...
                            {isReceived ? tx.from.slice(-6) : tx.to.slice(-6)}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">About ComicCoin NFTs</h3>
                  <p className="text-blue-800">
                    ComicCoin NFTs represent professionally graded and encapsulated comic books. Each NFT is a digital certificate of authenticity that corresponds to a physical comic book that has been evaluated, graded, and secured in a protective capsule by our authorized grading service.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Grading Process</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                      <span>Professional Evaluation: Submit your comic book to be assessed by expert graders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                      <span>Protective Encapsulation: Your comic is sealed in a special protective cover for preservation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                      <span>Digital Certificate: Receive an NFT that certifies the grade and authenticity of your comic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                      <span>Blockchain Security: Your comic's grade and ownership are permanently recorded on the blockchain</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <p className="text-blue-800">
                    Get your comics professionally graded at{' '}
                    <a
                      href="https://cpscapsule.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                    >
                      cpscapsule.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {' '}to receive your NFT certificate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default NFTListPage;
