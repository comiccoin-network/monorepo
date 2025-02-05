// src/Components/More/Tokens/BurnView.jsx
import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { toLower } from "lodash";
import { AlertCircle, Info, Trash2, ArrowLeft, Loader2 } from "lucide-react";

import {
  GetNonFungibleToken,
  BurnToken,
} from "../../../wailsjs/go/main/App";
import { currentOpenWalletAtAddressState } from "../../AppState";

/**
 * TokenBurnView component allows users to burn a specific non-fungible token (NFT).
 * It handles user input for wallet password, validates the form, and sends a burn request to the backend.
 * The component fetches NFT details, displays relevant information, and provides options to cancel or proceed with the burn operation.
 * Error handling and visual feedback are integrated to improve user experience.
 */
function TokenBurnView() {
  ////
  //// URL Parameters.
  ////

  const { tokenID } = useParams();

  ////
  //// Global State
  ////

  const [currentOpenWalletAtAddress] = useRecoilState(
    currentOpenWalletAtAddressState,
  );

  ////
  //// Component states.
  ////

  const [isLoading, setIsLoading] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [token, setToken] = useState([]);
  const [errors, setErrors] = useState({});
  const [showError, setShowError] = useState(false);
  const [showErrorBox, setShowErrorBox] = useState(false);
  const [formData, setFormData] = useState({
    walletPassword: "",
  });
  const currentBalance = 105.0;

  ////
  //// Event handling.
  ////

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required to authorize transaction";
    }

    setErrors(newErrors);
    setShowErrorBox(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setShowErrorBox(false);
    }
  };

  /**
   * Handles the form submission for burning a token.
   * Validates the form data, then sends a burn request to the backend.
   * Updates the UI to reflect loading and success/failure states.
   */
   const handleSubmit = (e) => {
     e.preventDefault();
     if (validateForm()) {
       // Form is valid, proceed with submission
       console.log("Form submitted:", formData);

       // Update the GUI to let user know that the operation is under way.
       setIsLoading(true);
       setErrors({}); // Clear any previous errors
       setShowErrorBox(false);

       BurnToken(parseInt(tokenID), currentOpenWalletAtAddress, formData.password)
         .then(() => {
            console.log("TokenBurnView: Success");
            setForceURL("/token/" + tokenID + "/burn-success");
         })
         .catch((errorRes) => {
           console.log("GetNonFungibleToken: errorRes:", errorRes);
           // Set the error message from the API
           setErrors({ api: errorRes.toString() });
           setShowErrorBox(true);
           // Show error message
           setShowError(true);
           // Auto-hide error after 5 seconds
           setTimeout(() => setShowError(false), 5000);
         })
         .finally(() => {
           // Update the GUI to let user know that the operation is completed.
           setIsLoading(false);
         });
     } else {
       // Show error message for form validation
       setShowError(true);
       // Auto-hide error after 5 seconds
       setTimeout(() => setShowError(false), 5000);
     }
   };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      // Update the GUI to let user know that the operation is under way.
      setIsLoading(true);

      GetNonFungibleToken(parseInt(tokenID))
        .then((nftokRes) => {
          console.log("GetNonFungibleToken: nftokRes:", nftokRes);
          setToken(nftokRes);
        })
        .catch((errorRes) => {
          console.log("GetNonFungibleToken: errorRes:", errorRes);
        })
        .finally((errorRes) => {
          // Update the GUI to let user know that the operation is completed.
          setIsLoading(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, [currentOpenWalletAtAddress]);

  ////
  //// Component rendering.
  ////

  if (forceURL !== "") {
    console.log("URL redirecting to:", forceURL);
    return <Navigate to={forceURL} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">
            Processing request
          </h2>
          <p className="text-sm text-gray-600">Please wait while we process the token request...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-2xl mx-auto px-6 py-12 mb-24">
        {showErrorBox && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">
                Unable to Burn Token
              </h3>
              <div className="text-sm text-red-600 mt-1 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border-2 border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Burn Token</h2>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Transfer NFT to burn address. Please fill in all required fields.
            </p>
          </div>

          <div className="p-6 space-y-8">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>
                  All transactions are final and cannot be undone. Please verify
                  all details before burning.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Wallet Password <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter your wallet password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Your wallet is encrypted and stored locally. The password is
                    required to authorize this transaction.
                  </span>
                </p>
              </label>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p>
                    A network fee of 1 ComicCoin is required to support the
                    blockchain infrastructure and ensure secure transaction
                    processing.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button
                onClick={() => setForceURL("/token/" + tokenID)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                Burn Token
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TokenBurnView;
