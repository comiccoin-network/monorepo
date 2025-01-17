import React, { useState } from 'react';
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
  Download,
  Share2,
  File,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import { useNFTMetadata } from '../../../Hooks/useNFTMetadata';
import { convertIPFSToGatewayURL } from '../../../Services/NFTMetadataService';
import NavigationMenu from "../../User/NavigationMenu/View";
import FooterMenu from "../../User/FooterMenu/View";

const DownloadButton = ({ onClick, icon: Icon, label, variant = 'primary' }) => {
  const [downloadState, setDownloadState] = useState('idle'); // idle, loading, success, error

  const handleClick = async () => {
    setDownloadState('loading');
    try {
      await onClick();
      setDownloadState('success');
      setTimeout(() => setDownloadState('idle'), 2000);
    } catch (error) {
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 3000);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200";
    const variantStyles = {
      primary: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      tertiary: "bg-gray-100 text-gray-600 hover:bg-gray-200"
    };

    if (downloadState === 'loading') {
      return `${baseStyles} opacity-75 cursor-wait ${variantStyles[variant]}`;
    }
    if (downloadState === 'success') {
      return `${baseStyles} bg-green-50 text-green-600`;
    }
    if (downloadState === 'error') {
      return `${baseStyles} bg-red-50 text-red-600`;
    }
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  return (
    <button
      onClick={handleClick}
      disabled={downloadState === 'loading'}
      className={getButtonStyles()}
    >
      {downloadState === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {downloadState === 'success' && <CheckCircle2 className="w-4 h-4" />}
      {downloadState === 'error' && <XCircle className="w-4 h-4" />}
      {downloadState === 'idle' && <Icon className="w-4 h-4" />}
      {downloadState === 'loading' && "Downloading..."}
      {downloadState === 'success' && "Downloaded!"}
      {downloadState === 'error' && "Download Failed"}
      {downloadState === 'idle' && label}
    </button>
  );
};

const MediaTabs = ({ activeTab, onTabChange, metadata }) => {
  const tabs = [
    { id: 'image', icon: ImageIcon, label: 'Image', show: !!metadata?.image },
    { id: 'animation', icon: Play, label: 'Animation', show: !!metadata?.animation_url },
    { id: 'youtube', icon: Youtube, label: 'YouTube', show: !!metadata?.youtube_url }
  ].filter(tab => tab.show);

  if (tabs.length <= 1) return null;

  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
            activeTab === id
              ? 'bg-purple-100 text-purple-700 scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
};

const NFTDetailPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('image');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const tokenId = searchParams.get('token_id');
  const tokenMetadataUri = searchParams.get('token_metadata_uri');

  const { metadata, loading, error, rawAsset } = useNFTMetadata(tokenMetadataUri);

  const downloadImage = async () => {
    if (!metadata?.image) throw new Error('No image available');
    const response = await fetch(convertIPFSToGatewayURL(metadata.image));
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft_${tokenId}_image.${blob.type.split('/')[1] || 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAnimation = async () => {
    if (!metadata?.animation_url) throw new Error('No animation available');
    const response = await fetch(convertIPFSToGatewayURL(metadata.animation_url));
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft_${tokenId}_animation.${blob.type.split('/')[1] || 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMetadata = async () => {
    if (!metadata) throw new Error('No metadata available');

    // Prepare a clean metadata object
    const cleanMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      animation_url: metadata.animation_url,
      youtube_url: metadata.youtube_url,
      background_color: metadata.background_color,
      attributes: metadata.attributes
    };

    // Remove any undefined or null values
    Object.keys(cleanMetadata).forEach(key => {
      if (cleanMetadata[key] === undefined || cleanMetadata[key] === null) {
        delete cleanMetadata[key];
      }
    });

    // Create a formatted JSON string with proper indentation
    const jsonContent = JSON.stringify(cleanMetadata, null, 2);

    // Create a blob with the properly formatted JSON
    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft_${tokenId}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Extract YouTube video ID from URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <NavigationMenu />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-12 mb-16 md:mb-0">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            to="/nfts"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to NFTs
          </Link>

          <h1 className="text-4xl font-bold text-purple-800 mb-4">
            {metadata?.name || `NFT #${tokenId}`}
          </h1>
          {metadata?.description && (
            <p className="text-xl text-gray-600">{metadata.description}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Media Preview Card */}
         <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-purple-100 rounded-xl">
               <ImageIcon className="w-5 h-5 text-purple-600" />
             </div>
             <h2 className="text-xl font-bold text-gray-900">NFT Preview</h2>
             <div className="ml-auto flex gap-2">
               <button
                 className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                 title="Share NFT"
               >
                 <Share2 className="w-5 h-5" />
               </button>
             </div>
           </div>

            {/* Media Tabs */}
            <MediaTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              metadata={metadata}
            />

            {/* Media Display */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-6">
              {/* Loading overlay */}
              {isImageLoading && activeTab === 'image' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              )}

              {activeTab === 'image' && metadata?.image && (
                <img
                  src={convertIPFSToGatewayURL(metadata.image)}
                  alt={metadata.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setIsImageLoading(false)}
                  style={{ display: isImageLoading ? 'none' : 'block' }}
                />
              )}
              {activeTab === 'animation' && metadata?.animation_url && (
                <video
                  src={convertIPFSToGatewayURL(metadata.animation_url)}
                  controls
                  className="w-full h-full object-contain bg-black"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {activeTab === 'youtube' && metadata?.youtube_url && (
                <iframe
                  src={getYoutubeEmbedUrl(metadata.youtube_url)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Download Section */}
           <div className="bg-gray-50 rounded-xl p-4">
             <h3 className="text-sm font-medium text-gray-600 mb-3">Downloads</h3>
             <div className="flex flex-wrap gap-3">
               {metadata?.image && (
                 <DownloadButton
                   onClick={downloadImage}
                   icon={ImageIcon}
                   label="Download Image"
                   variant="primary"
                 />
               )}
               {metadata?.animation_url && (
                 <DownloadButton
                   onClick={downloadAnimation}
                   icon={Play}
                   label="Download Animation"
                   variant="secondary"
                 />
               )}
               <DownloadButton
                 onClick={downloadMetadata}
                 icon={File}
                 label="Download Metadata"
                 variant="tertiary"
               />
             </div>
            </div>
          </div>
          {/* NFT Details Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">NFT Details</h2>
            </div>

            {/* Token Details */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Token ID
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {tokenId}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Metadata URI
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 break-all">
                  {tokenMetadataUri}
                </div>
              </div>
            </div>

            {/* Attributes */}
            {metadata?.attributes && metadata.attributes.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {metadata.attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 rounded-lg p-4"
                    >
                      <h4 className="text-sm font-medium text-purple-600 mb-1">
                        {attr.trait_type}
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {attr.value.toString()}
                      </p>
                    </div>
                  ))}
                </div>
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

            {/* Background Color */}
            {metadata?.background_color && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Background Color
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border border-gray-200"
                    style={{ backgroundColor: `#${metadata.background_color}` }}
                  />
                  <span className="text-gray-900 font-mono">
                    #{metadata.background_color}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default NFTDetailPage;
