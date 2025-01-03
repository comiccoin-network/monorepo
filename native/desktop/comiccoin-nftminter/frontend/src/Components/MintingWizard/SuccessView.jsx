import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { CheckCircle2, Plus, X } from "lucide-react";

import { nftState, nftSubmissionErrorResponseState, nftSubmissionSuccessResponseState, DEFAULT_NFT_STATE } from "../../AppState";
import {
    ShutdownApp,
} from "../../../wailsjs/go/main/App";

function MintingWizardSuccessView() {
    // --- Global State ---
    const [nft, setNft] = useRecoilState(nftState);
    const [nftSubmissionErrorResponse, setNftSubmissionErrorResponse] = useRecoilState(nftSubmissionErrorResponseState);
    const [nftSubmissionSuccessResponse, setNftSubmissionSuccessResponse] = useRecoilState(nftSubmissionSuccessResponseState);

    // For debugging purposes:
    console.log("nft:", nft);
    console.log("nftSubmissionErrorResponse:", nftSubmissionErrorResponse);
    console.log("nftSubmissionSuccessResponse:", nftSubmissionSuccessResponse);

     // --- GUI States ---
     const [forceURL, setForceURL] = useState("");
  const submissionTime = new Date().toLocaleString();

  const handleMintAnother = () => {
      setNftSubmissionErrorResponse(DEFAULT_NFT_STATE);
      setNftSubmissionSuccessResponse(DEFAULT_NFT_STATE);

      console.log("handleMintAnother | Redirecting shortly...");
      setForceURL("/launchpad");
  };

  const handleExit = () => {
    setNftSubmissionErrorResponse(DEFAULT_NFT_STATE);
    setNftSubmissionSuccessResponse(DEFAULT_NFT_STATE);

    console.log("Exiting application...");
    ShutdownApp();
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
          window.scrollTo(0, 0); // Start the page at the top of the page.

          console.log("useEffect | Current nft", nft);
          console.log("useEffect | Clearing nft");

          // Reset the NFT to empty state.
          setNft(DEFAULT_NFT_STATE);
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return (
      <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-lg mx-auto px-6">
      <div className="bg-white rounded-xl border-2 border-gray-100 shadow-sm">
        <div className="p-8">
          <div className="w-14 h-14 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            NFT Successfully Minted!
          </h2>

          <p className="mt-3 text-gray-600">
            Your NFT has been successfully submitted to the ComicCoin blockchain
          </p>

          <div className="mt-2 text-sm text-gray-500">
            Submission Time: {submissionTime}
          </div>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-800">Token #</dt>
                  <dd className="text-gray-600">{nftSubmissionSuccessResponse.token_id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-800">Timestamp</dt>
                  <dd className="text-gray-600">{nftSubmissionSuccessResponse.timestamp}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-800">Metadata URI</dt>
                  <dd className="text-gray-600 truncate max-w-[240px]">{nftSubmissionSuccessResponse.metadata_uri}</dd>
                </div>
              </dl>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-700">
              The NFT will appear in the destination wallet within 1-5 minutes from the submission time
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 flex gap-4">
          <button
            onClick={handleMintAnother}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Mint Another NFT
          </button>

          <button
            onClick={handleExit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
            Exit Application
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

export default MintingWizardSuccessView;
