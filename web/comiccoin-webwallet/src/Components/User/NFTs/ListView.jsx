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
  LayoutGrid,
  Clock,
  Tag,
  Filter,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';

import { useWallet } from '../../../Hooks/useWallet';
import { useNFTCollection } from '../../../Hooks/useNFTCollection';
import { convertIPFSToGatewayURL } from '../../../Services/NFTMetadataService';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";
import walletService from '../../../Services/WalletService';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = "purple" }) => {
  const colors = {
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600"
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

// NFT Card Component
const NFTCard = ({ nft, currentWallet }) => {
  const lastTx = nft.transactions[0];
  const isReceived = lastTx.to.toLowerCase() === currentWallet.address.toLowerCase();
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const imageUrl = getNFTImageUrl(nft);

  return (
    <div className="group">
      <Link
        to={`/nft?token_id=${nft.tokenId}&token_metadata_uri=${lastTx.tokenMetadataURI}`}
        className="block bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-200"
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isReceived
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isReceived ? 'Received' : 'Sent'}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2">
              <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                View Details
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {nft.metadata?.name || `NFT #${nft.tokenId || 'Unknown'}`}
          </h3>

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span className="truncate">#{nft.tokenId}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(lastTx.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          {nft.metadata?.description && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {nft.metadata.description}
            </p>
          )}
        </div>
      </Link>
    </div>
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

// Search and Filter Bar
const SearchBar = ({ onSearch }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search NFTs..."
      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-purple-100 text-purple-700'
        : 'bg-white text-gray-600 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, received, sent

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

  // Filter NFTs based on search and filter
  const filteredNFTs = nftCollection.filter(nft => {
    const matchesSearch = !searchTerm ||
      nft.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.tokenId.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;

    const lastTx = nft.transactions[0];
    const isReceived = lastTx.to.toLowerCase() === currentWallet.address.toLowerCase();

    return activeFilter === "received" ? isReceived : !isReceived;
  });

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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total NFTs"
            value={statistics?.totalNftCount || 0}
            icon={ImageIcon}
            color="purple"
          />
          <StatsCard
            title="Received NFTs"
            value={statistics?.receivedNftCount || 0}
            icon={ArrowUpRight}
            color="green"
          />
          <StatsCard
            title="Total Transactions"
            value={statistics?.nftTransactionsCount || 0}
            icon={Clock}
            color="blue"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-grow">
              <SearchBar onSearch={setSearchTerm} />
            </div>
            <div className="flex items-center gap-2">
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              >
                All NFTs
              </FilterButton>
              <FilterButton
                active={activeFilter === "received"}
                onClick={() => setActiveFilter("received")}
              >
                Received
              </FilterButton>
              <FilterButton
                active={activeFilter === "sent"}
                onClick={() => setActiveFilter("sent")}
              >
                Sent
              </FilterButton>
            </div>
          </div>
        </div>

        {/* NFT List Container - Shared container for all states */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100">
          {/* Header - Always visible */}
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

          {/* Content Area - Same padding for all states */}
          <div className="p-6">
            {nftLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Loading NFTs...</span>
              </div>
            ) : filteredNFTs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageOff className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || activeFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Submit your comic book for professional grading and get a corresponding NFT"}
                </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNFTs.map((nft) => (
                  <NFTCard
                    key={nft.tokenId}
                    nft={nft}
                    currentWallet={currentWallet}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-24 right-6">
          <a
            href="https://cpscapsule.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          >
            Get Your Comics Graded
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
}

export default NFTListPage;
