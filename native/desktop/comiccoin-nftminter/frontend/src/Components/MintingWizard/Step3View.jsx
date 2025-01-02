import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  CheckCircle2,
  ChevronLeft,
  AlertTriangle,
  Pencil,
  Wallet,
  FileText
} from "lucide-react";

import { nftState } from "../../AppState";

function MintingWizardStep3View() {
  const [nft] = useRecoilState(nftState);
  const [forceURL, setForceURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Developers Note: By redirecting the user to a different page, that page will handle the submission logic.
    setForceURL("/minting-wizard-step3-submitting");

    setIsLoading(false);
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
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Step 1</p>
                  <p className="text-sm text-gray-500">Destination Wallet</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-1">
              <div className="flex items-center">
                <div className="flex-1 h-px bg-green-200"></div>
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Step 2</p>
                  <p className="text-sm text-gray-500">Upload Assets</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-1">
              <div className="flex items-center">
                <div className="flex-1 h-px bg-purple-200"></div>
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Step 3</p>
                  <p className="text-sm text-gray-500">Review & Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>This submission is permanent and cannot be undone</li>
                    <li>All content will be permanently stored on the ComicCoin blockchain</li>
                    <li>Image and Animation assets will be publicly available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="bg-white rounded-xl border-2 border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Wallet className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Destination Wallet</h2>
                </div>
                <button
                  onClick={() => setForceURL("/minting-wizard-step1")}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit Wallet
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-600 font-mono bg-gray-50 p-3 rounded-lg">
                {nft.walletAddress}
              </div>
            </div>
          </div>

          {/* NFT Details Section */}
          <div className="bg-white rounded-xl border-2 border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">NFT Details</h2>
                </div>
                <button
                  onClick={() => setForceURL("/minting-wizard-step2")}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit Details
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{nft.name}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{nft.description}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                 <dt className="text-sm font-medium text-gray-500">Image File</dt>
                 <dd className="text-sm text-gray-900 col-span-2 font-mono">
                   <div className="flex items-center">
                     <div className="flex-shrink-0 text-gray-400">.../{String(nft.image).split('/').slice(-1)}</div>
                     {/*}
                     <button
                       onClick={() => alert(nft.image)}
                       className="ml-2 text-xs text-purple-600 hover:text-purple-700"
                     >
                       View Full Path
                     </button>
                     */}
                   </div>
                 </dd>
               </div>
               <div className="px-6 py-4 grid grid-cols-3 gap-4">
                 <dt className="text-sm font-medium text-gray-500">Animation File</dt>
                 <dd className="text-sm text-gray-900 col-span-2 font-mono">
                   <div className="flex items-center">
                     <div className="flex-shrink-0 text-gray-400">.../{String(nft.animation).split('/').slice(-1)}</div>
                     {/*
                     <button
                       onClick={() => alert(nft.animation)}
                       className="ml-2 text-xs text-purple-600 hover:text-purple-700"
                     >
                       View Full Path
                     </button>
                     */}
                   </div>
                 </dd>
               </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">YouTube URL</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{nft.youtubeURL || '-'}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">External URL</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{nft.externalURL || '-'}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Background Color</dt>
                  <dd className="text-sm text-gray-900 col-span-2 flex items-center gap-2">
                    {nft.backgroundColor}
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: nft.backgroundColor }}
                    />
                  </dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Attributes</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    <div className="space-y-2">
                      {nft.attributes && nft.attributes.length > 0 ? nft.attributes.map((attr, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="font-medium">{attr.trait_type}:</span>
                          <span>{attr.value}</span>
                          {attr.display_type && (
                            <span className="text-gray-500">({attr.display_type})</span>
                          )}
                        </div>
                      )) : (
                        <span className="text-gray-500">No attributes</span>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-between">
              <button
                onClick={() => setForceURL("/minting-wizard-step2")}
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processing...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-sm text-gray-500 text-center">
            Upon successful submission, this NFT will be sent directly to your wallet.
          </div>
        </div>
      </main>
    </div>
  );
}

export default MintingWizardStep3View;
