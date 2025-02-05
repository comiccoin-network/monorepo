import React, { useState, useEffect } from 'react';
import { Link, Navigate } from "react-router-dom";
import {
  Tickets,
} from 'lucide-react';
import { useRecoilState } from "recoil";

import { GetNonFungibleTokensByOwnerAddress } from "../../../wailsjs/go/main/App";
import { currentOpenWalletAtAddressState } from "../../AppState";
import useSyncStatus from "../../Hooks/syncstatus";

function ListTokensView() {
  // Global State
  const [currentOpenWalletAtAddress] = useRecoilState(currentOpenWalletAtAddressState);
  const isSyncing = useSyncStatus();

  // Component states
  const [isLoading, setIsLoading] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [tokens, setTokens] = useState([]);
  const [wasSyncing, setWasSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Handle token click navigation
  const handleTokenClick = (tokID) => {
    console.log("tokID->", tokID);
    setForceURL("/token/" + tokID);
  };

  // Main data fetching function
  const fetchTokensData = async () => {
    if (!currentOpenWalletAtAddress) return;

    console.log("📊 Fetching NFT tokens data...");
    setIsLoading(true);
    setError(null);

    try {
      const nftoksRes = await GetNonFungibleTokensByOwnerAddress(currentOpenWalletAtAddress);
      console.log("GetNonFungibleTokensByOwnerAddress: Response:", nftoksRes);
      setTokens(nftoksRes);
    } catch (error) {
      console.error("❌ Failed to fetch NFT tokens:", error);
      setError(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle sync status changes
  useEffect(() => {
    if (wasSyncing && !isSyncing) {
      console.log("🔄 Sync completed, refreshing tokens data");
      fetchTokensData();
    }
    setWasSyncing(isSyncing);
  }, [isSyncing, wasSyncing]);

  // Initial data fetch when component mounts
  useEffect(() => {
    if (!isSyncing) {
      window.scrollTo(0, 0);
      fetchTokensData();
    }
  }, [currentOpenWalletAtAddress]);

  // Handle navigation redirect
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  // Show loading state
  if (isLoading || isSyncing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 mb-24">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-red-800 font-medium">Error loading tokens</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state if no tokens
  if (tokens.length === 0) {
    return (
      <div>
        <main className="max-w-2xl mx-auto px-6 py-12 mb-24">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Tickets className="w-5 h-5 text-purple-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Tokens</h2>
                </div>
              </div>
            </div>

            <div className="py-16 px-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Tickets className="w-8 h-8 text-purple-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tokens Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Start your journey by sending or receiving ComicCoins or NFTs.
                  Your tokens will appear here once you have some.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show tokens grid
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My NFT Collection</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <div
            key={token.token_id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => handleTokenClick(token.token_id)}
          >
            <div className="p-4">
              <div className="aspect-square relative mb-4">
                <img
                  src={token.metadata.image}
                  alt={token.metadata.name}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{token.metadata.name}</h2>
                <p className="text-sm text-gray-500">Token ID: {token.token_id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListTokensView;
