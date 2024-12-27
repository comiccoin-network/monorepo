import {useState, useEffect} from 'react';
import { Link, Navigate } from "react-router-dom";
import { Stamp } from 'lucide-react';

import {
    GetPreferences
} from "../../../wailsjs/go/main/App";


function InitializeView() {
    ////
    //// Component states.
    ////

    const [dataDirectory] = useState("");
    const [forceURL, setForceURL] = useState("");

    ////
    //// Event handling.
    ////

    ////
    //// Misc.
    ////

    useEffect(() => {
      let mounted = true;

      if (mounted) {
            window.scrollTo(0, 0); // Start the page at the top of the page.
            GetPreferences().then( (preferencesResult) => {
                console.log("preferencesResult:", preferencesResult);
                if (preferencesResult.data_directory === "") {
                    setForceURL("/pick-data-directory")
                } else if (preferencesResult.nft_storage_address === "" || preferencesResult.nft_storage_api_key === "") {
                    setForceURL("/setup-nft-storage")
                } else if (preferencesResult.authority_address === "" || preferencesResult.authority_api_key === "") {
                    setForceURL("/setup-authority")
                }
            })
      }

      return () => {
        mounted = false;
      };
    }, []);

    ////
    //// Component rendering.
    ////

    if (forceURL !== "") {
      return <Navigate to={forceURL} />;
    }

    return (
        <div>
          <main className="flex-grow flex items-center justify-center max-w-2xl mx-auto py-12">
            <div className="text-center space-y-8 px-6 py-12">
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">Initializing NFT Minter</h2>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Please wait while we start up. This may take a few moments.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </main>
        </div>
    );
}

export default InitializeView
