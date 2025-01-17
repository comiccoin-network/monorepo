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
  ImageOff
} from 'lucide-react';
import { useWallet } from '../../../Hooks/useWallet';
import { useNFTCollection } from '../../../Hooks/useNFTCollection';
import { convertIPFSToGatewayURL } from '../../../Services/NFTMetadataService';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";
import walletService from '../../../Services/WalletService';

const NFTListPage = () => {
  const {
    currentWallet,
    logout,
    loading: serviceLoading,
    error: serviceError
  } = useWallet();

  // State management
  const [forceURL, setForceURL] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the wallet address
  const getWalletAddress = () => {
    if (!currentWallet) return "";
    return currentWallet.address;
  };

  // Use our new NFT Collection hook instead of just transactions
  const {
    nftCollection,
    loading: nftLoading,
    error: nftError,
    statistics
  } = useNFTCollection(getWalletAddress());

  // Session checking effect
  useEffect(() => {
    let mounted = true;

    const checkWalletSession = async () => {
      try {
        if (!mounted) return;
        setIsLoading(true);

        if (serviceLoading) {
          return;
        }

        if (!currentWallet) {
          if (mounted) {
            setForceURL("/login");
          }
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
        console.error('NFTListPage: Session check error:', error);
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

  // Create blob URL for NFT image
  const getNFTImageUrl = (nft) => {
    if (!nft) return null;

    if (nft.asset?.content) {
      try {
        // If we have cached asset content, create a blob URL
        const blob = new Blob([nft.asset.content], {
          type: nft.asset.content_type || 'image/png'
        });
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error creating blob URL:', error);
      }
    }

    if (nft.metadata?.image) {
      // Use the existing helper function to convert IPFS URL
      return convertIPFSToGatewayURL(nft.metadata.image);
    }

    return null;
  };

  // console.log("Debugging: nftCollection --->", nftCollection);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <NavigationMenu onSignOut={handleSignOut} />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 mb-16 md:mb-0">
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

        {nftError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error Loading NFTs</h3>
                <p className="text-sm text-red-600">{nftError}</p>
              </div>
            </div>
          </div>
        )}

        {isSessionExpired && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
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
              <p className="text-sm text-gray-600">Total NFT Transactions</p>
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

              <a
                href="https://cpscapsule.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span>Get Your Comics Graded</span>
                <ExternalLink className="w-4 h-4" />
              </a>
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
            <div className="divide-y divide-gray-100">
              {nftCollection.map((nft) => {
                const lastTx = nft.transactions[0]; // Get most recent transaction
                const isReceived = lastTx.to.toLowerCase() === currentWallet.address.toLowerCase();
                const imageUrl = getNFTImageUrl(nft);

                return (
                  <Link
                    key={nft.tokenId}
                    to={`/nft?token_id=${nft.tokenId}&token_metadata_uri=${lastTx.tokenMetadataURI}`}
                    className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-purple-300" />
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {nft.metadata?.name || `NFT #${nft.tokenId || 'Unknown'}`}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isReceived ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isReceived ? 'Received' : 'Sent'}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Token ID: {nft.tokenId}</p>
                          {nft.metadata?.description && (
                            <p className="truncate max-w-md">{nft.metadata.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default NFTListPage;
