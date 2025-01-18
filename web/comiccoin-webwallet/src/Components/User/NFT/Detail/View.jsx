// src/Components/User/NFTs/DetailView.jsx
import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Play,
  Youtube,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  File,
  Star,
  TrendingUp,
  SendHorizontal,
  Flame,
  Link as LinkIcon
} from 'lucide-react';

import { useNFTMetadata } from '../../../../Hooks/useNFTMetadata';
import { convertIPFSToGatewayURL } from '../../../../Services/NFTMetadataService';
import NavigationMenu from "../../../User/NavigationMenu/View";
import FooterMenu from "../../../User/FooterMenu/View";
import IPFSInfoModal from "./IPFSInfoModal";

// ShareButton component
const ShareButton = ({ tokenMetadataUri, metadata, tokenId }) => {
  const [shareState, setShareState] = useState('idle');

  const handleShare = async () => {
    if (!tokenMetadataUri) return;
    setShareState('copying');
    try {
      await navigator.clipboard.writeText(tokenMetadataUri);
      setShareState('success');
      setTimeout(() => setShareState('idle'), 2000);
    } catch (error) {
      setShareState('error');
      setTimeout(() => setShareState('idle'), 3000);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "p-2 rounded-lg transition-all duration-200 flex items-center gap-2";
    switch (shareState) {
      case 'copying': return `${baseStyles} bg-gray-100 text-gray-400 cursor-wait`;
      case 'success': return `${baseStyles} bg-green-50 text-green-600`;
      case 'error': return `${baseStyles} bg-red-50 text-red-600`;
      default: return `${baseStyles} text-gray-500 hover:text-gray-700 hover:bg-gray-100`;
    }
  };

  return (
    <button onClick={handleShare} disabled={shareState === 'copying'}
            className={getButtonStyles()} title="Copy Metadata URI to clipboard">
      {shareState === 'copying' && <Loader2 className="w-5 h-5 animate-spin" />}
      {shareState === 'success' && <CheckCircle2 className="w-5 h-5" />}
      {shareState === 'error' && <XCircle className="w-5 h-5" />}
      {shareState === 'idle' && <Copy className="w-5 h-5" />}
    </button>
  );
};

// DownloadButton component
const DownloadButton = ({ onClick, icon: Icon, label, variant = 'primary' }) => {
  const [downloadState, setDownloadState] = useState('idle');

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

    if (downloadState === 'loading') return `${baseStyles} opacity-75 cursor-wait ${variantStyles[variant]}`;
    if (downloadState === 'success') return `${baseStyles} bg-green-50 text-green-600`;
    if (downloadState === 'error') return `${baseStyles} bg-red-50 text-red-600`;
    return `${baseStyles} ${variantStyles[variant]}`;
  };

  return (
    <button onClick={handleClick} disabled={downloadState === 'loading'} className={getButtonStyles()}>
      {downloadState === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {downloadState === 'success' && <CheckCircle2 className="w-4 h-4" />}
      {downloadState === 'error' && <XCircle className="w-4 h-4" />}
      {downloadState === 'idle' && <Icon className="w-4 h-4" />}
      <span>
        {downloadState === 'loading' && "Downloading..."}
        {downloadState === 'success' && "Downloaded!"}
        {downloadState === 'error' && "Download Failed"}
        {downloadState === 'idle' && label}
      </span>
    </button>
  );
};

// MediaTabs component
const MediaTabs = ({ activeTab, onTabChange, metadata }) => {
  const tabs = [
    { id: 'image', icon: ImageIcon, label: 'Cover', show: !!metadata?.image },
    { id: 'animation', icon: Play, label: 'Animation', show: !!metadata?.animation_url },
    { id: 'youtube', icon: Youtube, label: 'Video', show: !!metadata?.youtube_url }
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

const ActionButtons = ({ tokenId, tokenMetadataUri }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-xl">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Actions</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/nft/transfer?token_id=${tokenId}&token_metadata_uri=${tokenMetadataUri}`)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <SendHorizontal className="w-5 h-5" />
          <span className="font-medium">Transfer</span>
        </button>

        <button
          onClick={() => navigate(`/nft/burn?token_id=${tokenId}&token_metadata_uri=${tokenMetadataUri}`)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
        >
          <Flame className="w-5 h-5" />
          <span className="font-medium">Burn</span>
        </button>
      </div>
    </div>
  );
};

// Main component
const NFTDetailPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('image');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const tokenId = searchParams.get('token_id');
  const tokenMetadataUri = searchParams.get('token_metadata_uri');

  const { metadata, loading, error } = useNFTMetadata(tokenMetadataUri);

  const downloadImage = async () => {
    if (!metadata?.image) throw new Error('No image available');
    const response = await fetch(convertIPFSToGatewayURL(metadata.image));
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comic_${tokenId}_image.${blob.type.split('/')[1] || 'png'}`;
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
    a.download = `comic_${tokenId}_animation.${blob.type.split('/')[1] || 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMetadata = async () => {
    if (!metadata) throw new Error('No metadata available');
    const cleanMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      animation_url: metadata.animation_url,
      youtube_url: metadata.youtube_url,
      background_color: metadata.background_color,
      attributes: metadata.attributes
    };
    Object.keys(cleanMetadata).forEach(key => {
      if (cleanMetadata[key] === undefined || cleanMetadata[key] === null) {
        delete cleanMetadata[key];
      }
    });
    const blob = new Blob([JSON.stringify(cleanMetadata, null, 2)], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comic_${tokenId}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <Link to="/nfts" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collection
        </Link>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Comic Preview Section */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-lg border-2 border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Comic Preview</h2>
                </div>
                <ShareButton tokenMetadataUri={tokenMetadataUri} metadata={metadata} tokenId={tokenId} />
              </div>

              <MediaTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                metadata={metadata}
              />

              <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 mb-6"
                   style={{ aspectRatio: '2/3' }}>
                {isImageLoading && activeTab === 'image' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                )}

                {activeTab === 'image' && metadata?.image && (
                  <img
                    src={convertIPFSToGatewayURL(metadata.image)}
                    alt={metadata.name}
                    className="w-full h-full object-contain"
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

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Downloads</h3>
                <div className="flex flex-wrap gap-3">
                  {metadata?.image && (
                    <DownloadButton
                      onClick={downloadImage}
                      icon={ImageIcon}
                      label="Download Cover"
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
                    label="Download Details"
                    variant="tertiary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comic Details Section */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title and Description Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {metadata?.name || `Comic #${tokenId}`}
              </h1>
              {metadata?.description && (
                <p className="text-gray-600 mb-4">{metadata.description}</p>
              )}

              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Token Details</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500">Token ID</label>
                      <div className="text-sm font-mono text-gray-900">{tokenId}</div>
                    </div>
                    <div>
                     <label className="text-xs text-gray-500">Metadata URI</label>
                     <div className="flex items-start gap-2">
                       <div className="text-sm font-mono text-gray-900 break-all flex-grow">{tokenMetadataUri}</div>
                       <IPFSInfoModal
                         tokenMetadataUri={tokenMetadataUri}
                         imageUri={metadata?.image}
                         animationUri={metadata?.animation_url}
                       />
                     </div>
                   </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Action Buttons Section */}
            <ActionButtons tokenId={tokenId} tokenMetadataUri={tokenMetadataUri} />

            {/* Attributes Card */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attributes</h2>
              </div>

              {metadata?.attributes && metadata.attributes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {metadata.attributes.map((attr, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-600 mb-1">
                        {attr.trait_type}
                      </h4>
                      <p className="text-lg font-semibold text-gray-900">
                        {attr.value.toString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No attributes available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FooterMenu />
    </div>
  );
};

export default NFTDetailPage;
