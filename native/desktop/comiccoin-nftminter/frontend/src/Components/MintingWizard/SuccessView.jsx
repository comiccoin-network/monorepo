import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Plus, X } from "lucide-react";

function MintingWizardSuccessView() {
  const navigate = useNavigate();
  const submissionTime = new Date().toLocaleString();

  const handleMintAnother = () => {
    navigate("/minting-wizard-step1");
  };

  const handleExit = () => {
    // TODO: Implement exit application logic
    console.log("Exit application");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-6">
        <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              NFT Successfully Minted!
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Your NFT has been successfully submitted to the ComicCoin blockchain
            </p>

            <div className="mt-4 text-xs text-gray-500">
              Submission Time: {submissionTime}
            </div>

            <div className="mt-6 py-4 px-4 bg-purple-50 rounded-lg text-sm text-purple-700">
              The NFT will appear in the destination wallet within 1-5 minutes from the submission time
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={handleMintAnother}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Mint Another NFT
            </button>

            <button
              onClick={handleExit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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
