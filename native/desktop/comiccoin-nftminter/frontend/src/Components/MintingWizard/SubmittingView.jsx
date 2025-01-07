import {useState, useEffect, useRef} from 'react';
import { Loader2 } from "lucide-react";
import { useRecoilState } from "recoil";
import { Navigate } from "react-router-dom";

import { nftState, nftSubmissionErrorResponseState, nftSubmissionSuccessResponseState } from "../../AppState";
import { CreateToken } from "../../../wailsjs/go/main/App";

function MintingWizardSubmittingView() {
  const hasExecutedRef = useRef(false);
  const [nft] = useRecoilState(nftState);
  const [nftSubmissionErrorResponse, setNftSubmissionErrorResponse] = useRecoilState(nftSubmissionErrorResponseState);
  const [nftSubmissionSuccessResponse, setNftSubmissionSuccessResponse] = useRecoilState(nftSubmissionSuccessResponseState);
  const [forceURL, setForceURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const executeSubmission = async () => {
      // Check if we've already executed
      if (hasExecutedRef.current || isLoading) {
        console.log("Submission already executed or loading, skipping");
        return;
      }

      // Mark as executed immediately
      hasExecutedRef.current = true;
      setIsLoading(true);

      console.log("Executing submission | nft:", nft);
      const attributesJSONString = JSON.stringify(nft.attributes);

      try {
        const resp = await CreateToken(
          nft.walletAddress,
          nft.name,
          nft.description,
          nft.image,
          nft.animation,
          nft.youtubeURL,
          nft.externalURL,
          attributesJSONString,
          nft.backgroundColor
        );

        console.log("CreateToken | Success response:", resp);
        setNftSubmissionSuccessResponse(resp);
        setForceURL("/minting-wizard-step3-success");
      } catch (errorJsonString) {
        console.log("CreateToken | Error response:", errorJsonString);
        let err = {};
        try {
          const errorObject = JSON.parse(errorJsonString);
          if (errorObject.name) err.name = errorObject.name;
          if (errorObject.description) err.description = errorObject.description;
          if (errorObject.image) err.image = errorObject.image;
          if (errorObject.animation) err.animation = errorObject.animation;
          if (errorObject.background_color) err.backgroundColor = errorObject.background_color;
        } catch (e) {
          console.log("Error parsing error response:", e);
          err.message = errorJsonString;
        }

        setErrors(err);
        setNftSubmissionErrorResponse(err);
        setForceURL("/minting-wizard-step3-error");
      } finally {
        setIsLoading(false);
      }
    };

    executeSubmission();
  }, []); // Empty dependency array means this effect runs once on mount

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

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
