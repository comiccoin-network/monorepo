import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  Wallet,
  AlertCircle,
  XCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { nftState } from "../../AppState";

function MintingWizardStep1View() {
  // Global State
  const [nft, setNft] = useRecoilState(nftState);

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState(
    nft ? nft.walletAddress : "",
  );
  const [error, setError] = useState("");
  const [showErrorBox, setShowErrorBox] = useState(false);

  const isValidEthereumAddress = (address) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleContinue = (e) => {
  e.preventDefault();

  const trimmedAddress = walletAddress.trim();
  if (!trimmedAddress) {
    setError("Wallet address is required");
    setShowErrorBox(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (!isValidEthereumAddress(trimmedAddress)) {
    setError("Invalid Ethereum address format");
    setShowErrorBox(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  console.log("handleContinue: Saving NFT...");
  let updatedNFT = { ...nft };
  updatedNFT.walletAddress = trimmedAddress;
  setNft(updatedNFT);
  console.log("handleContinue: Done saving NFT.");
  setForceURL("/minting-wizard-step2");
};

  const handleAbandonMint = () => {
    setShowAbandonModal(true);
  };

  const confirmAbandon = () => {
    setForceURL("/launchpad");
  };

  const handleInputChange = (e) => {
    setWalletAddress(e.target.value);
    if (error) {
      setError("");
      setShowErrorBox(false);
    }
  };

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return (
    <div>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Step 1</p>
                  <p className="text-sm text-gray-500">Destination Wallet</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-1">
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-200 text-gray-400 rounded-full">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Step 2</p>
                  <p className="text-sm text-gray-500">Upload Assets</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-1">
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-200 text-gray-400 rounded-full">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Step 3</p>
                  <p className="text-sm text-gray-500">Review & Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showErrorBox && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">
                Form Validation Error
              </h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border-2 border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Wallet
                    className="w-5 h-5 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Select Destination Wallet
                </h2>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Please enter the ComicCoin wallet address where the minted NFT
              will be sent. This must be a valid ComicCoin wallet address
              provided by the customer.
            </p>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Wallet Address
                  </span>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      error ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="Enter the destination wallet address"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                </label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>
                    Make sure the provided wallet address is a valid ComicCoin
                    wallet. NFTs can only be minted to ComicCoin wallets. Other
                    wallet types are not supported and will cause the minting
                    process to fail.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={handleAbandonMint}
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Abandon Mint
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                Save & Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Abandon Modal */}
        {showAbandonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Abandon Minting Process?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to abandon the minting process? All
                  progress will be lost and you'll need to start over.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAbandonModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAbandon}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Abandon Mint
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MintingWizardStep1View;
