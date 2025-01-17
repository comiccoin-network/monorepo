// src/Components/User/NFTs/ListView.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
  Info,
  ArrowRight,
  ImageOff,
  Grid,
  List,
  ArrowUpRight,
  Clock,
  Tag
} from 'lucide-react';

import { useWallet } from '../../../Hooks/useWallet';
import { useNFTCollection } from '../../../Hooks/useNFTCollection';
import { convertIPFSToGatewayURL } from '../../../Services/NFTMetadataService';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";
import walletService from '../../../Services/WalletService';

// NFT Card Component
const NFTCard = ({ nft, currentWallet }) => {
  const lastTx = nft.transactions[0];
  const isReceived = lastTx.to.toLowerCase() === currentWallet.address.toLowerCase();
  const imageUrl = getNFTImageUrl(nft);
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      to={`/nft?token_id=${nft.tokenId}&token_metadata_uri=${lastTx.tokenMetadataURI}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-2 border-gray-100 hover:border-purple-200"
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden bg-purple-50">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-purple-200" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isReceived ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isReceived ? 'Received' : 'Sent'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {nft.metadata?.name || `NFT #${nft.tokenId || 'Unknown'}`}
        </h3>

        <div className="space-y-2">
          {/* Token ID */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Tag className="w-4 h-4" />
            <span className="truncate">{nft.tokenId}</span>
          </div>

          {/* Last Transaction Time */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(lastTx.timestamp).toLocaleDateString()}</span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-4 flex items-center justify-end">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 group-hover:text-purple-700">
            View Details
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// Helper function to get NFT image URL
const getNFTImageUrl = (nft) => {
  if (!nft) return null;

  if (nft.metadata?.image) {
    return convertIPFSToGatewayURL(nft.metadata.image);
  }

  if (nft.asset?.content) {
    try {
      const blob = new Blob([nft.asset.content], {
        type: nft.asset.content_type || 'image/png'
      });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
    }
  }

  return null;
};

const NFTListPage = () => {
  const {
    currentWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  const [forceURL, setForceURL] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const getWalletAddress = () => {
    if (!currentWallet) return "";
    return currentWallet.address;
  };

  const {
    nftCollection,
    loading: nftLoading,
    error: nftError,
    statistics
  } = useNFTCollection(getWalletAddress());

  useEffect(() => {
    let mounted = true;

    const checkWalletSession = async () => {
      try {
        if (!mounted) return;
        setIsLoading(true);

        if (serviceLoading) return;

        if (!currentWallet) {
          if (mounted) setForceURL("/login");
          return;
        }

        if (!walletService.checkSession()) {
          throw new Error("Session expired");
        }

        if (mounted) {
          setForceURL("");
          setWalletAddress(getWalletAddress());
        }
      } catch (error) {
        if (error.message === "Session expired" && mounted) {
          handleSessionExpired();
        } else if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) setIsLoading(false);
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
    setTimeout(() => setForceURL("/login"), 3000);
  };

  const handleSignOut = () => {
    logout();
    setForceURL("/login");
  };

  if (forceURL !== "" && !serviceLoading) {
    return <Navigate to={forceURL} />;
  }

  if (serviceLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <NavigationMenu onSignOut={handleSignOut} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">NFT Collection</h1>
          <p className="text-xl text-gray-600">View and manage your NFTs</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Collection Overview</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total NFTs</p>
                <p className="text-2xl font-bold text-gray-900">{statistics?.totalNftCount || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{statistics?.nftTransactionsCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ArrowUpRight className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <a
                href="https://cpscapsule.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ArrowUpRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-900">Get Your Comics Graded</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </a>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your NFTs</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {nftLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading NFTs...</span>
            </div>
          ) : nftCollection.length === 0 ? (
            <div className="text-center p-12">
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
            <div className="p-6">
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }`}>
                {nftCollection.map((nft) => (
                  <NFTCard
                    key={nft.tokenId}
                    nft={nft}
                    currentWallet={currentWallet}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default NFTListPage;
