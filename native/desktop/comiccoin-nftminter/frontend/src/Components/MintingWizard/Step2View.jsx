import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  Upload,
  AlertCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";

import {
  GetImageFilePathFromDialog,
  GetVideoFilePathFromDialog,
} from "../../../wailsjs/go/main/App";
import { nftState } from "../../AppState";
import FormTokenMetadataAttributesField from "./FormTokenMetadataAttributesField.jsx";

function MintingWizardStep2View() {
  // Global State
  const [nft, setNft] = useRecoilState(nftState);

  ////
  //// Component states.
  ////

  const [forceURL, setForceURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form fields
  const [name, setName] = useState(nft ? nft.name : "");
  const [description, setDescription] = useState(nft ? nft.description : "");
  const [image, setImage] = useState(nft ? nft.image : "");
  const [animation, setAnimation] = useState(nft ? nft.animation : "");
  const [youtubeURL, setYoutubeURL] = useState(nft ? nft.youtubeURL : "");
  const [externalURL, setExternalURL] = useState(nft ? nft.externalURL : "");
  const [attributes, setAttributes] = useState(nft ? nft.attributes : []);
  const [backgroundColor, setBackgroundColor] = useState(
    nft ? nft.backgroundColor : "#ffffff",
  );

  const handleContinue = (e) => {
    e.preventDefault();

    // Reset the errors.
    setErrors({});

    // Update the GUI to let user know that the operation is under way.
    setIsLoading(true);

    // STEP 1: Client side validation.
    let err = {};
    if (name === "") {
      err.name = "Name is required";
    }
    if (description === "") {
      err.description = "Description is required";
    }
    if (image === "") {
      err.image = "Image is required";
    }
    if (backgroundColor === "") {
      err.backgroundColor = "Background colour is required";
    }
    if (Object.keys(err).length > 0) {
      console.log("handleContinue | errors detected", err);
      setIsLoading(false);
      setErrors(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // STEP 2: Save state and redirect to next step.
    console.log("handleContinue: Saving NFT...", nft);
    let updatedNFT = { ...nft };
    updatedNFT.name = name;
    updatedNFT.description = description;
    updatedNFT.image = image;
    updatedNFT.animation = animation;
    updatedNFT.backgroundColor = backgroundColor;
    updatedNFT.attributes = attributes;
    updatedNFT.youtubeURL = youtubeURL;
    updatedNFT.externalURL = externalURL;
    setNft(updatedNFT);
    console.log("handleContinue: Done saving NFT:", updatedNFT);

    console.log("handleContinue: Will be redirecting shortly...");
    setIsLoading(false);
    setForceURL("/minting-wizard-step3");
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
                <div className="flex-1 h-px bg-purple-200"></div>
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Step 2</p>
                  <p className="text-sm text-gray-500">Upload Assets</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-1">
              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-200 text-gray-400 rounded-full">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Step 3</p>
                  <p className="text-sm text-gray-500">Review & Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-semibold text-red-800">
                Form Validation Error
              </h3>
              <div className="text-sm text-red-600 mt-1">
                {Object.entries(errors).map(([key, value]) => (
                  <p key={key}>• {value}</p>
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
                  <Upload
                    className="w-5 h-5 text-purple-600"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Upload NFT Assets
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Name *
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter NFT name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </label>

              {/* Description Field */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Description *
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`mt-1 block w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter NFT description"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </label>

              {/* Image Upload */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Image *
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className={`flex-grow px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.image
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Select image file"
                    disabled
                  />
                  <button
                    onClick={(e) =>
                      GetImageFilePathFromDialog().then((imageRes) => {
                        if (imageRes !== "") {
                          setImage(imageRes);
                        }
                      })
                    }
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    Browse
                  </button>
                </div>
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.image}
                  </p>
                )}
              </div>

              {/* Animation Upload */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Animation File (Optional)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={animation}
                    onChange={(e) => setAnimation(e.target.value)}
                    className={`flex-grow px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.animation
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Select animation file"
                    disabled
                  />
                  <button
                    onClick={(e) =>
                      GetVideoFilePathFromDialog().then((animationRes) => {
                        if (animationRes !== "") {
                          setAnimation(animationRes);
                        }
                      })
                    }
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                    Browse
                  </button>
                </div>
                {errors.animation && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.animation}
                  </p>
                )}
              </div>

              {/* YouTube URL */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  YouTube URL (Optional)
                </span>
                <input
                  type="url"
                  value={youtubeURL}
                  onChange={(e) => setYoutubeURL(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter YouTube URL"
                />
              </label>

              {/* External URL */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  External URL (Optional)
                </span>
                <input
                  type="url"
                  value={externalURL}
                  onChange={(e) => setExternalURL(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter external URL"
                />
              </label>

              {/* Background Color */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Background Color *
                </span>
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="mt-1 block w-full h-12 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </label>
            </div>

            <FormTokenMetadataAttributesField
              data={attributes}
              onDataChange={setAttributes}
            />

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setForceURL("/minting-wizard-step1")}
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className={`px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MintingWizardStep2View;
