import React from "react";
import { Loader2 } from "lucide-react";

function MintingWizardSubmittingView() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">
          Submitting to ComicCoin Blockchain
        </h2>
        <p className="text-sm text-gray-600">Please wait while we process your NFT...</p>
      </div>
    </div>
  );
}

export default MintingWizardSubmittingView;
