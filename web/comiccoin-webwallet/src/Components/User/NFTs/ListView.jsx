// src/Components/User/NFTs/ListView.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Loader2, ImageIcon, ExternalLink, AlertCircle,
  ArrowUpRight, ImageOff, Clock, Search,
  Tag, Coins, CheckCircle
} from 'lucide-react';
import { useWallet } from '../../../Hooks/useWallet';
import { useNFTCollection } from '../../../Hooks/useNFTCollection';
import { convertIPFSToGatewayURL } from '../../../Services/NFTMetadataService';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";
import walletService from '../../../Services/WalletService';

// Comic Book NFT Card
const NFTCard = ({ nft, currentWallet }) => {
  const lastTx = nft.transactions[0];
  const isReceived = lastTx.to.toLowerCase() === currentWallet.address.toLowerCase();
  const [imageError, setImageError] = useState(false);
  const imageUrl = getNFTImageUrl(nft);

  return (
    <div className="group">
      <Link
        to={`/nft?token_id=${nft.tokenId}&token_metadata_uri=${lastTx.tokenMetadataURI}`}
        className="block bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl border-2 border-purple-100 hover:border-purple-300"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-purple-50 to-white">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={nft.metadata?.name || `Comic NFT #${nft.tokenId}`}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-24 h-24 text-purple-200" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isReceived
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {isReceived ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  In Collection
                </span>
              ) : 'Transferred'}
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5" />
                  <span className="text-base font-medium">#{nft.tokenId}</span>
                </div>
                <p className="text-base line-clamp-3 opacity-90">
                  {nft.metadata?.description || 'A unique comic book NFT'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            {nft.metadata?.name || `Comic #${nft.tokenId}`}
          </h3>

          <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(lastTx.timestamp).toLocaleDateString()}</span>
            {nft.metadata?.attributes?.grade && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  Grade: {nft.metadata.attributes.grade}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

// Search Bar
const SearchBar = ({ onSearch }) => (
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search your comic collection..."
      className="w-full pl-10 pr-4 py-3 bg-white border rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5D37AF] focus:border-transparent"
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
);

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
      return null;
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
  const [searchTerm, setSearchTerm] = useState("");

  const handleSignOut = () => {
    logout();
    setForceURL("/login");
  };

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

  // Filter NFTs based on search
  const filteredNFTs = (nftCollection || []).filter(nft => {
    return !searchTerm ||
      nft.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.tokenId.toString().includes(searchTerm);
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
          setError(null);
          setForceURL("");
          setWalletAddress(getWalletAddress());
        }
      } catch (error) {
        if (error.message === "Session expired" && mounted) {
          setIsSessionExpired(true);
          logout();
          setError("Your session has expired. Please sign in again.");
          setTimeout(() => setForceURL("/login"), 3000);
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
  }, [currentWallet, serviceLoading, logout]);

  if (forceURL !== "" && !serviceLoading) {
    return <Navigate to={forceURL} />;
  }

  if (serviceLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex items-center justify-center flex-grow">
          <div className="bg-white p-8 rounded-xl shadow-lg flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#5D37AF]" />
            <div>
              <h3 className="font-bold text-gray-900">Loading Your Collection</h3>
              <p className="text-gray-500">Please wait while we fetch your NFTs...</p>
            </div>
          </div>
        </div>
        <FooterMenu />
      </div>
    );
  }

  return (
   <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
     <NavigationMenu onSignOut={handleSignOut} />

     <div className="flex-grow flex flex-col items-center px-6 sm:px-8 lg:px-12 py-12">
       {/* Header */}
       <div className="w-full max-w-[1200px]">
         <h1 className="text-4xl font-bold text-[#5D37AF] mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
           My NFT Collection
         </h1>
         <p className="text-gray-600">
           Manage and showcase your digital comic book collectibles
         </p>
       </div>

       {/* Search */}
        {(searchTerm || filteredNFTs.length !== 0) && <div className="w-full max-w-[1200px] mt-8">
          <SearchBar onSearch={setSearchTerm} />
        </div>}

        {/* NFT Container */}
       <div className="w-full max-w-[1200px] mt-8 bg-white rounded-xl">
         <div className="flex items-center justify-between p-6 border-b border-gray-100">
           <div className="flex items-center gap-3">
             <ImageIcon className="w-6 h-6 text-[#5D37AF]" />
             <h2 className="text-xl font-semibold">Your Comics</h2>
             <span className="text-sm text-gray-500">({filteredNFTs.length} total)</span>
           </div>

           <a
             href="https://cpscapsule.com"
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center gap-2 px-6 py-3 bg-[#5D37AF] text-white rounded-lg hover:bg-[#4D2D8F] transition-colors"
           >
             Grade New Comics
             <ExternalLink className="w-4 h-4" />
           </a>
         </div>

         <div className="p-6">
           {nftLoading ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-[#5D37AF]" />
               <span className="ml-3 text-gray-600">Loading your comics...</span>
             </div>
           ) : filteredNFTs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16">
               <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                 <ImageOff className="w-10 h-10 text-[#5D37AF]" />
               </div>
               <h3 className="text-xl font-medium text-gray-900 mb-3">
                 No Comics Found
               </h3>
               <p className="text-gray-500 mb-8 text-center max-w-md">
                 {searchTerm ? "Try adjusting your search" : "Start your collection by getting your comics professionally graded"}
               </p>
               <a
                 href="https://cpscapsule.com"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-8 py-4 bg-[#5D37AF] text-white rounded-lg hover:bg-[#4D2D8F] transition-colors"
               >
                 Submit Comics for Grading
                 <ArrowUpRight className="w-5 h-5" />
               </a>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
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
     </div>

     <FooterMenu />
   </div>
  );
};

export default NFTListPage;
