// src/Components/NFT/Detail/View.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Youtube,
  Play,
  Download
} from 'lucide-react';

import { useNFTMetadata } from '../../../Hooks/useNFTMetadata';
import { convertIPFSToGatewayURL } from '../../../Services/NFTMetadataService';
import NavigationMenu from "../../User/NavigationMenu/View";
import FooterMenu from "../../User/FooterMenu/View";

function NFTDetailPage() {
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get('token_id');
  const tokenMetadataUri = searchParams.get('token_metadata_uri');

  const { loading, error, metadata, rawAsset } = useNFTMetadata(tokenMetadataUri);

  // Function to handle metadata download
  const handleDownload = () => {
    if (!rawAsset || !rawAsset.content) return;

    const blob = new Blob([rawAsset.content], { type: rawAsset.content_type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = rawAsset.filename || 'metadata.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  console.log("Debugging: metadata --->", metadata);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <NavigationMenu />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        {/* Back button and Header */}
        <div className="mb-8">
          <Link
            to="/nfts"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to NFTs
          </Link>

          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            {metadata?.name || `NFT #${tokenId}`}
          </h1>
          {metadata?.description && (
            <p className="text-gray-600">{metadata.description}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading NFT metadata...</span>
          </div>
        )}

        {/* Content */}
        {!loading && metadata && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NFT Preview */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">NFT Preview</h2>
              </div>

              <div className="space-y-4">
                {/* Main Image */}
                {metadata.image && (
                  <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={convertIPFSToGatewayURL(metadata.image)}
                      alt={metadata.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Animation/Video Links */}
                <div className="flex flex-col gap-2">
                  {metadata.animation_url && (
                    <a
                      href={convertIPFSToGatewayURL(metadata.animation_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
                    >
                      <Play className="w-4 h-4" />
                      View Animation
                    </a>
                  )}

                  {metadata.youtube_url && (
                    <a
                      href={metadata.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Youtube className="w-4 h-4" />
                      Watch on YouTube
                    </a>
                  )}

                  {metadata.external_url && (
                    <a
                      href={metadata.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View External Link
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* NFT Attributes */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attributes</h2>
                <button
                  onClick={handleDownload}
                  className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download metadata"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              {metadata.attributes && metadata.attributes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {metadata.attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 rounded-lg p-4"
                    >
                      <h3 className="text-sm font-medium text-purple-600 mb-1">
                        {attr.trait_type}
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {attr.value.toString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No Attributes
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This NFT has no attributes defined
                  </p>
                </div>
              )}

              {/* Background Color Preview */}
              {metadata.background_color && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Background Color
                  </h3>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-200"
                      style={{ backgroundColor: `#${metadata.background_color}` }}
                    />
                    <span className="text-gray-900">#{metadata.background_color}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <FooterMenu />
    </div>
  );
}

export default NFTDetailPage;
