import {useState, useEffect} from 'react';
import { Link, Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { WalletMinimal, KeyRound, Info, ChevronRight, AlertCircle, XCircle } from 'lucide-react';

import {
    GetNFTStorageAddressFromPreferences,
    GetNFTStorageAPIKeyFromPreferences,
    SaveNFTStoreConfigVariables,
    ShutdownApp
} from "../../../wailsjs/go/main/App";
// import { currentOpenWalletAtAddressState } from "../../AppState";


function SetupNFTStorageView() {
    // // Global State
    // const [currentOpenWalletAtAddress, setCurrentOpenWalletAtAddress] = useRecoilState(currentOpenWalletAtAddressState);

    ////
    //// Component states.
    ////

    // const [dataDirectory] = useState("");
    const [forceURL, setForceURL] = useState("");
    const [errors, setErrors] = useState({});
    const [showErrorBox, setShowErrorBox] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        remoteAddress: 'https://comiccoinnftstorage.com',
        apiKey: '',
    });


    ////
    //// Event handling.
    ////

    // const validateForm = () => {
    //     const newErrors = {};
    //
    //     if (!formData.label.trim()) {
    //         newErrors.label = 'Wallet label is required';
    //     }
    //
    //     if (!formData.password) {
    //       newErrors.password = 'Password is required';
    //     } else if (formData.password.length < 12) {
    //       newErrors.password = 'Password must be at least 12 characters long';
    //     }
    //
    //     if (!formData.repeatPassword) {
    //       newErrors.repeatPassword = 'Please repeat your password';
    //     } else if (formData.password !== formData.repeatPassword) {
    //       newErrors.repeatPassword = 'Passwords do not match';
    //     }
    //
    //     setErrors(newErrors);
    //     setShowErrorBox(Object.keys(newErrors).length > 0);
    //     return Object.keys(newErrors).length === 0;
    // };
    //
    //
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        // Update the GUI to let user know that the operation is under way.
        setIsLoading(true);

          SaveNFTStoreConfigVariables(formData.apiKey, formData.remoteAddress).then(()=>{
              console.log("SaveNFTStoreConfigVariables: Success");
              setForceURL("/setup-authority");
          }).catch((errorJsonString)=>{
              console.log("SaveNFTStoreConfigVariables: errRes", errorJsonString);
              const errorObject = JSON.parse(errorJsonString);
              let err = {};
              if (errorObject.nftStoreAPIKey != "") {
                  err.apiKey = errorObject.nftStoreAPIKey;
              }
              if (errorObject.nftStoreRemoteAddress != "") {
                  err.remoteAddress = errorObject.nftStoreRemoteAddress;
              }
              setErrors(err);
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }).finally(() => {
              // this will be executed after then or catch has been executed
              console.log("SaveNFTStoreConfigVariables promise has been resolved or rejected");

              // Update the GUI to let user know that the operation is completed.
              setIsLoading(false);
          });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }));
          setShowErrorBox(false);
        }
    };


    ////
    //// Misc.
    ////

    useEffect(() => {
      let mounted = true;

      if (mounted) {
            window.scrollTo(0, 0); // Start the page at the top of the page.
      }

      return () => {
        mounted = false;
      };
    }, []);

    ////
    //// Component rendering.
    ////

    if (forceURL !== "") {
      console.log("Redirected to URL:", forceURL);
      return <Navigate to={forceURL} />;
    }

    return (
    <div>
      <main className="max-w-2xl mx-auto px-6 py-12">
        {showErrorBox && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">Form Validation Error</h3>
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
                <div className="p-2 bg-purple-100 rounded-xl">
                  <KeyRound className="w-5 h-5 text-purple-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Setup your NFT Storage</h2>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Next you will need to configure how to connect to the <b>NFT Store</b>.<br />
              ComicCoin Registry requires the following fields to be filled out.
            </p>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Remote Address</span>
                  <input
                    type="text"
                    name="remoteAddress"
                    value={formData.remoteAddress}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.remoteAddress ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter a name for your wallet"
                  />
                  {errors.remoteAddress && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.remoteAddress}
                    </p>
                  )}
                </label>


                <label className="block">
                  <span className="text-sm font-medium text-gray-700">API Key</span>
                  <input
                    type="text"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.apiKey ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter a name for your wallet"
                  />
                  {errors.apiKey && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.apiKey}
                    </p>
                  )}
                </label>
              </div>

             {/*
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Write down your password and keep it safe. If you lose your password,
                  you will not be able to access your wallet and your funds will be lost forever.
                </p>
              </div>
              */}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={(e)=>{
                    ShutdownApp();
                }}
              >
                Cancel & Close App
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                Save & Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SetupNFTStorageView
