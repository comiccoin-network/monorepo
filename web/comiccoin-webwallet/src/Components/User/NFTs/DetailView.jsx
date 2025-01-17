// src/Components/NFT/Detail/View.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Info,
  Download
} from 'lucide-react';

import { useNFTMetadata } from '../../../Hooks/useNFTMetadata';
import NavigationMenu from "../../User/NavigationMenu/View";
import FooterMenu from "../../User/FooterMenu/View";

function NFTDetailPage() {
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get('token_id');
  const tokenMetadataUri = searchParams.get('token_metadata_uri');

  const { loading, error, metadata } = useNFTMetadata(tokenMetadataUri);

  // Function to parse and display JSON metadata
  const displayMetadata = () => {
    if (!metadata || !metadata.content) return null;

    try {
      const content = new TextDecoder().decode(metadata.content);
      const jsonContent = JSON.parse(content);
      return jsonContent;
    } catch (e) {
      console.error('Error parsing metadata:', e);
      return null;
    }
  };

  const parsedMetadata = displayMetadata();

  // Function to download metadata
  const handleDownload = () => {
    if (!metadata || !metadata.content) return;

    const blob = new Blob([metadata.content], { type: metadata.content_type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = metadata.filename || 'metadata.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            NFT #{tokenId}
          </h1>
          <p className="text-gray-600">
            View detailed information about this NFT
          </p>
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
            {/* Metadata File Info */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Metadata File</h2>
                <button
                  onClick={handleDownload}
                  className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download metadata"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Filename
                  </label>
                  <p className="text-gray-900">{metadata.filename}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Content Type
                  </label>
                  <p className="text-gray-900">{metadata.content_type}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Size
                  </label>
                  <p className="text-gray-900">{metadata.content_length} bytes</p>
                </div>
              </div>
            </div>

            {/* NFT Metadata Content */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Info className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">NFT Information</h2>
              </div>

              {parsedMetadata ? (
                <div className="space-y-4">
                  {Object.entries(parsedMetadata).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-gray-900">
                        {typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : value.toString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Unable to Parse Metadata
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    The metadata file could not be parsed as JSON
                  </p>
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
