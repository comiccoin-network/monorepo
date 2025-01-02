import {useState, useEffect} from 'react';
import { Loader2 } from "lucide-react";
import { useRecoilState } from "recoil";


import { nftState } from "../../AppState";
import { CreateToken } from "../../../wailsjs/go/main/App";

function MintingWizardSubmittingView() {
  // --- Global State ---
  const [nft] = useRecoilState(nftState);

  // --- GUI States ---
  const [forceURL, setForceURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onExecuteSubmissionInBackground = () => {
      // Defensive Code: Do not submit if already submitted.
      if (isLoading) {
          console.log("onSubmit | Already submitting, exiting func.");
          return;
      }

      // Reset the errors.
      setErrors({});

      // Update the GUI to let user know that the operation is under way.
      setIsLoading(true);

      const attributesJSONString = JSON.stringify(nft.attributes);

      // Submit the `dataDirectory` value to our backend.
      CreateToken(nft.name, nft.description, nft.image, nft.animation, nft.youtubeURL, nft.externalURL, attributesJSONString, nft.backgroundColor).then( (resp) => {
          console.log("onExecuteSubmissionInBackground | Success response | result:", resp);
          setForceURL("/minting-wizard-step3-success");
      }).catch((errorJsonString)=>{
          console.log("onExecuteSubmissionInBackground | Error response | errRes:", errorJsonString);
          let err = {};
          try {
              const errorObject = JSON.parse(errorJsonString);
              if (errorObject.name != "") {
                  err.name = errorObject.name;
              }
              if (errorObject.description != "") {
                  err.description = errorObject.description;
              }
              if (errorObject.image != "") {
                  err.image = errorObject.image;
              }
              if (errorObject.animation != "") {
                  err.animation = errorObject.animation;
              }
              if (errorObject.background_color != "") {
                  err.backgroundColor = errorObject.background_color;
              }
          } catch (e) {
              console.log("onExecuteSubmissionInBackground | CreateToken:err:", e);
              err.message = errorJsonString;
          } finally {
              setErrors(err);
              window.scrollTo(0, 0); // Start the page at the top of the page.
          }
      }).finally(() => {
          // this will be executed after then or catch has been executed
          console.log("onExecuteSubmissionInBackground | promise has been resolved or rejected");

          // Update the GUI to let user know that the operation is completed.
          setIsLoading(false);
      });
  }

  useEffect(() => {
    let mounted = true;

    if (mounted) {
        onExecuteSubmissionInBackground()
        window.scrollTo(0, 0); // Start the page at the top of the page.
    }

    return () => {
        mounted = false;
    };
  }, []);

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
