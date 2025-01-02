import React, { useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { Rocket, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { useRecoilState } from "recoil";
import { ShutdownApp } from "../../../wailsjs/go/main/App";

import { nftState, DEFAULT_NFT_STATE } from "../../AppState";

function LaunchpadView() {
  // Global State
  const [nft, setNft] = useRecoilState(nftState);

  const [forceURL, setForceURL] = React.useState("");

  const handleStart = () => {
    console.log("handleStart | Setting default nft state");

    // Reset the NFT to empty state.
    setNft(DEFAULT_NFT_STATE);

    console.log("handleStart | Will redirect...");

    // Redirect the user to the beginning of the NFT mintring wizard.
    setForceURL("/minting-wizard-step1");
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
        console.log("useEffect | nft:", nft);
        if (nft) {
            if (nft.walletAddress !== "") {
                console.log("useEffect | Will be redirecting shortly...");
                setForceURL("/minting-wizard-step3");
            }
        }
        window.scrollTo(0, 0); // Start the page at the top of the page.
    }

    return () => {
        mounted = false;
    };
  }, []);

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return (
    <div>
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero/Jumbotron Section */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl text-white p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Rocket className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">
                Welcome to NFT Minting Wizard
              </h1>
              <p className="text-lg opacity-90">
                Ready to create your NFT? This wizard will guide you through the
                process of minting your digital assets on the blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-xl border-2 border-gray-100 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Before You Begin
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important Notice:</p>
                  <p>
                    All NFT assets will be permanently published on the
                    blockchain and will be publicly visible. Please ensure
                    you've selected the correct assets before proceeding, as
                    this action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-gray-600">
                <p className="text-sm">During this process, you will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Select the destination wallet</li>
                  <li>Upload your NFT assets</li>
                  <li>Review your submission</li>
                  <li>Confirm and mint your NFT</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
            <div className="flex justify-end gap-4">
              <button
                onClick={() => ShutdownApp()}
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close App
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                Start Minting
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LaunchpadView;
