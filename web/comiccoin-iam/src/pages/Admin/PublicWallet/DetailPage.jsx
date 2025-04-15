// web/comiccoin-iam/src/pages/Admin/PublicWallet/DetailPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Wallet,
  ArrowLeft,
  Edit,
  Trash2,
  Loader,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  Shield,
  Building,
  Globe,
  MapPin,
  Home,
  Hash,
  CheckCircle,
  XCircle,
  Info,
  UserCircle,
  ExternalLink,
  Copy,
  Eye,
  Share2,
  RefreshCw,
  QrCode,
  FileText,
  Link as LinkIcon,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  usePublicWallet,
  WALLET_STATUS,
  WALLET_TYPE,
} from "../../../hooks/usePublicWallet";

const AdminPublicWalletDetailPage = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const statusRef = useRef(null);

  // Use the publicWallet hook to fetch wallet data
  const {
    fetchWalletByAddress,
    isLoading: isWalletLoading,
    error: walletError,
    reset,
  } = usePublicWallet();

  // Component state
  const [wallet, setWallet] = useState(null);
  const [generalError, setGeneralError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Status message state
  const [statusMessage, setStatusMessage] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });

  // Reset state on component mount
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss status messages after 5 seconds
  useEffect(() => {
    let timer;

    if (statusMessage.type) {
      timer = setTimeout(() => {
        setStatusMessage({ type: null, message: "" });
      }, 5000);
    }

    // Cleanup timer to prevent memory leaks
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [statusMessage]);

  // Fetch wallet data on component mount
  useEffect(() => {
    const loadWalletData = async () => {
      if (!address) {
        console.error("No address provided in URL parameters");
        setGeneralError("Wallet address is required");
        return;
      }

      try {
        console.log("Fetching wallet data for address:", address);
        const walletData = await fetchWalletByAddress(address);
        console.log("Wallet data received:", walletData);

        if (walletData) {
          setWallet(walletData);
        } else {
          console.warn("No wallet data found");
          setGeneralError("Wallet not found");
        }
      } catch (err) {
        console.error("Failed to load wallet:", err);
        setGeneralError("Failed to load wallet details. Please try again.");
      }
    };

    loadWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Get wallet status display info
  const getWalletStatusDisplay = (status) => {
    switch (status) {
      case WALLET_STATUS.ACTIVE:
        return {
          label: "Active",
          icon: <CheckCircle className="h-5 w-5 mr-2 text-green-600" />,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          dotColor: "bg-green-500",
        };
      case WALLET_STATUS.ARCHIVED:
        return {
          label: "Archived",
          icon: <XCircle className="h-5 w-5 mr-2 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          dotColor: "bg-gray-400",
        };
      case WALLET_STATUS.LOCKED:
        return {
          label: "Locked",
          icon: <AlertCircle className="h-5 w-5 mr-2 text-red-600" />,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          dotColor: "bg-red-500",
        };
      default:
        return {
          label: "Unknown",
          icon: <Info className="h-5 w-5 mr-2 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          dotColor: "bg-gray-400",
        };
    }
  };

  // Get wallet type display info
  const getWalletTypeDisplay = (type) => {
    switch (type) {
      case WALLET_TYPE.COMPANY:
        return {
          label: "Business/Retailer",
          icon: <Building className="h-5 w-5 mr-2 text-blue-600" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      case WALLET_TYPE.INDIVIDUAL:
        return {
          label: "Individual",
          icon: <User className="h-5 w-5 mr-2 text-yellow-600" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      default:
        return {
          label: "Unknown",
          icon: <Info className="h-5 w-5 mr-2 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  // Get verification status display
  const getVerificationStatusDisplay = (isVerified) => {
    return isVerified
      ? {
          label: "Verified",
          icon: <CheckCircle className="h-5 w-5 mr-2 text-green-600" />,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        }
      : {
          label: "Unverified",
          icon: <XCircle className="h-5 w-5 mr-2 text-orange-600" />,
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
        };
  };

  // Handle refresh wallet data
  const handleRefreshData = async () => {
    if (!address) return;

    setIsRefreshing(true);
    try {
      const walletData = await fetchWalletByAddress(address);
      if (walletData) {
        setWallet(walletData);
        setStatusMessage({
          type: "success",
          message: "Wallet data refreshed successfully",
        });
      }
    } catch (err) {
      console.error("Failed to refresh wallet:", err);
      setStatusMessage({
        type: "error",
        message: "Failed to refresh wallet data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (!wallet?.address) return;

    navigator.clipboard
      .writeText(wallet.address)
      .then(() => {
        setStatusMessage({
          type: "success",
          message: "Address copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
        setStatusMessage({
          type: "error",
          message: "Failed to copy address to clipboard",
        });
      });
  };

  // Share wallet link
  const shareWallet = () => {
    if (!wallet?.address) return;

    const walletUrl = `${window.location.origin}/directory/${wallet.address}`;
    navigator.clipboard
      .writeText(walletUrl)
      .then(() => {
        setStatusMessage({
          type: "success",
          message: "Wallet URL copied to clipboard!",
        });
      })
      .catch((err) => {
        console.error("Failed to copy wallet URL:", err);
        setStatusMessage({
          type: "error",
          message: "Failed to copy wallet URL to clipboard",
        });
      });
  };

  // Navigate to list view
  const handleBackToList = () => {
    navigate("/admin/public-wallets");
  };

  // Navigate to edit page
  const handleEditWallet = () => {
    navigate(`/admin/public-wallets/${address}/edit`);
  };

  // Navigate to delete page
  const handleDeleteWallet = () => {
    navigate(`/admin/public-wallets/${address}/delete`);
  };

  // View wallet in directory (public view)
  const handleViewInDirectory = () => {
    window.open(`/directory/${address}`, "_blank");
  };

  // Check if wallet has additional location information
  const hasLocationInfo =
    wallet &&
    (wallet.country ||
      wallet.region ||
      wallet.city ||
      wallet.postalCode ||
      wallet.addressLine1 ||
      wallet.addressLine2);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AdminTopNavigation />

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-5xl"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToList}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors"
              aria-label="Back to wallet list"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-900">
                Wallet Details
              </h1>
              {!isWalletLoading && wallet && (
                <p className="text-gray-600">
                  {wallet.name || "Unnamed Wallet"}
                </p>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="px-3 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-1"
              aria-label="Refresh wallet data"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.type && (
          <div
            ref={statusRef}
            className={`
              mb-6 p-4 rounded-lg flex items-center justify-between
              ${statusMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}
              animate-fadeIn
            `}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center space-x-3">
              {statusMessage.type === "success" ? (
                <CheckCircle
                  className="h-5 w-5 text-green-500 flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="h-5 w-5 text-red-500 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <p className="font-medium text-sm">{statusMessage.message}</p>
            </div>
            <button
              onClick={() => setStatusMessage({ type: null, message: "" })}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Dismiss message"
            >
              <XCircle className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isWalletLoading && (
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading wallet details...</p>
          </div>
        )}

        {/* Error State */}
        {generalError && !isWalletLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{generalError}</p>
            </div>
            <button
              onClick={handleBackToList}
              className="mt-4 bg-white text-red-700 border border-red-300 rounded-lg px-4 py-2 hover:bg-red-50 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Wallet List
            </button>
          </div>
        )}

        {/* Wallet Data */}
        {!isWalletLoading && wallet && (
          <>
            {/* Wallet Header Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-white/20 p-3 rounded-lg mr-4">
                      {wallet.type === WALLET_TYPE.COMPANY ? (
                        <Building className="h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Wallet className="h-6 w-6" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{wallet.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <code className="text-indigo-200 font-mono text-sm bg-indigo-900/30 px-2 py-0.5 rounded">
                          {wallet.address}
                        </code>
                        <button
                          onClick={copyAddress}
                          className="text-purple-200 hover:text-white bg-purple-700/50 p-1 rounded"
                          title="Copy Address"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        {/* Verification Badge */}
                        {wallet.isVerified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Info className="h-3 w-3 mr-1" />
                            Unverified
                          </span>
                        )}

                        {/* Wallet Type Badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            wallet.type === WALLET_TYPE.COMPANY
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {wallet.type === WALLET_TYPE.COMPANY ? (
                            <Building className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {getWalletTypeDisplay(wallet.type).label}
                        </span>

                        {/* Chain Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Hash className="h-3 w-3 mr-1" />
                          Chain {wallet.chainId || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      {wallet.status !== undefined && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            getWalletStatusDisplay(wallet.status).bgColor
                          } ${getWalletStatusDisplay(wallet.status).textColor}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-1.5 ${
                              getWalletStatusDisplay(wallet.status).dotColor
                            }`}
                          ></span>
                          {getWalletStatusDisplay(wallet.status).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats and Actions */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 md:mb-0">
                    {/* View Count */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Views</div>
                      <div className="flex items-center text-lg font-semibold text-gray-800">
                        <Eye className="h-4 w-4 text-purple-600 mr-1" />
                        {wallet.viewCount || 0}
                      </div>
                    </div>

                    {/* Unique View Count */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">
                        Unique Views
                      </div>
                      <div className="flex items-center text-lg font-semibold text-gray-800">
                        <User className="h-4 w-4 text-purple-600 mr-1" />
                        {wallet.uniqueViewCount || 0}
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Created</div>
                      <div className="flex items-center text-sm font-medium text-gray-800">
                        <Calendar className="h-4 w-4 text-purple-600 mr-1" />
                        {formatDate(wallet.createdAt).split(",")[0]}
                      </div>
                    </div>

                    {/* Last Modified */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">
                        Last Updated
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-800">
                        <Clock className="h-4 w-4 text-purple-600 mr-1" />
                        {formatDate(wallet.modifiedAt).split(",")[0]}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleViewInDirectory}
                      className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Public</span>
                    </button>
                    <button
                      onClick={shareWallet}
                      className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={handleEditWallet}
                      className="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDeleteWallet}
                      className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="border-b border-gray-200 px-4">
                <nav
                  className="-mb-px flex space-x-6 overflow-x-auto"
                  aria-label="Tabs"
                >
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "overview"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "details"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Details
                  </button>
                  {hasLocationInfo && (
                    <button
                      onClick={() => setActiveTab("location")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === "location"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Location
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === "activity"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Activity
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab Content */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* QR Code and Basic Info */}
                    <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 w-full max-w-[200px]">
                        <QRCodeSVG
                          value={wallet.address}
                          size={200}
                          level="H"
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        Scan this QR code to view the wallet
                      </p>

                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Status:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              getWalletStatusDisplay(wallet.status).bgColor
                            } ${getWalletStatusDisplay(wallet.status).textColor}`}
                          >
                            {getWalletStatusDisplay(wallet.status).label}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Type:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              getWalletTypeDisplay(wallet.type).bgColor
                            } ${getWalletTypeDisplay(wallet.type).textColor}`}
                          >
                            {getWalletTypeDisplay(wallet.type).label}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Verification:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              getVerificationStatusDisplay(wallet.isVerified)
                                .bgColor
                            } ${getVerificationStatusDisplay(wallet.isVerified).textColor}`}
                          >
                            {
                              getVerificationStatusDisplay(wallet.isVerified)
                                .label
                            }
                          </span>
                        </div>

                        {wallet.verifiedOn && wallet.isVerified && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Verified On:
                            </span>
                            <span className="text-sm text-gray-700">
                              {formatDate(wallet.verifiedOn).split(",")[0]}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">
                            Chain ID:
                          </span>
                          <span className="text-sm text-gray-700">
                            {wallet.chainId || 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description and Stats */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Wallet Information
                      </h3>

                      {wallet.description ? (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Description
                          </h4>
                          <p className="text-gray-600">{wallet.description}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center text-gray-500 italic">
                          No description provided
                        </div>
                      )}

                      {wallet.websiteURL && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Website
                          </h4>
                          <a
                            href={
                              wallet.websiteURL.startsWith("http")
                                ? wallet.websiteURL
                                : `https://${wallet.websiteURL}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            {wallet.websiteURL}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Creation Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                Created By:
                              </span>
                              <span className="text-sm text-gray-700">
                                {wallet.createdByName || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                Created At:
                              </span>
                              <span className="text-sm text-gray-700">
                                {formatDate(wallet.createdAt)}
                              </span>
                            </div>
                            {wallet.createdFromIPAddress && (
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">
                                  Created From IP:
                                </span>
                                <span className="text-sm text-gray-700">
                                  {wallet.createdFromIPAddress}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Modification Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                Last Modified By:
                              </span>
                              <span className="text-sm text-gray-700">
                                {wallet.modifiedByName || "Unknown"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                Last Modified At:
                              </span>
                              <span className="text-sm text-gray-700">
                                {formatDate(wallet.modifiedAt)}
                              </span>
                            </div>
                            {wallet.modifiedFromIPAddress && (
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">
                                  Modified From IP:
                                </span>
                                <span className="text-sm text-gray-700">
                                  {wallet.modifiedFromIPAddress}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Tab Content */}
                {activeTab === "details" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Technical Details
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Wallet Address
                      </h4>
                      <div className="flex items-center mb-2">
                        <code className="font-mono text-sm bg-white p-2 rounded border border-gray-200 mr-2 flex-grow break-all">
                          {wallet.address}
                        </code>
                        <button
                          onClick={copyAddress}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Copy Address"
                        >
                          <Copy className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        This is the unique blockchain address for this wallet on
                        the ComicCoin network
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Wallet Configuration
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Chain ID
                            </div>
                            <div className="flex items-center">
                              <Hash className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">
                                {wallet.chainId || 1} (ComicCoin Mainnet)
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Wallet Type
                            </div>
                            <div className="flex items-center">
                              {wallet.type === WALLET_TYPE.COMPANY ? (
                                <Building className="h-4 w-4 text-blue-600 mr-2" />
                              ) : (
                                <User className="h-4 w-4 text-yellow-600 mr-2" />
                              )}
                              <span className="text-sm text-gray-700">
                                {getWalletTypeDisplay(wallet.type).label}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Status
                            </div>
                            <div className="flex items-center">
                              {getWalletStatusDisplay(wallet.status).icon}
                              <span className="text-sm text-gray-700">
                                {getWalletStatusDisplay(wallet.status).label}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Verification Status
                            </div>
                            <div className="flex items-center">
                              {
                                getVerificationStatusDisplay(wallet.isVerified)
                                  .icon
                              }
                              <span className="text-sm text-gray-700">
                                {
                                  getVerificationStatusDisplay(
                                    wallet.isVerified,
                                  ).label
                                }
                              </span>
                              {wallet.verifiedOn && wallet.isVerified && (
                                <span className="text-xs text-gray-500 ml-2">
                                  on{" "}
                                  {formatDate(wallet.verifiedOn).split(",")[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Metadata
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Wallet Name
                            </div>
                            <div className="text-sm text-gray-700">
                              {wallet.name || "Unnamed Wallet"}
                            </div>
                          </div>

                          {wallet.websiteURL && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Website URL
                              </div>
                              <div className="text-sm text-gray-700 break-all">
                                <a
                                  href={
                                    wallet.websiteURL.startsWith("http")
                                      ? wallet.websiteURL
                                      : `https://${wallet.websiteURL}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  {wallet.websiteURL}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Wallet ID
                            </div>
                            <div className="text-sm text-gray-700">
                              {wallet.id || "N/A"}
                            </div>
                          </div>

                          {wallet.thumbnailS3Key && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Thumbnail Key
                              </div>
                              <div className="text-sm text-gray-700 truncate">
                                {wallet.thumbnailS3Key}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {wallet.description && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Wallet Description
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {wallet.description}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Location Tab Content */}
                {activeTab === "location" && hasLocationInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Location Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Address Details
                        </h4>

                        <div className="space-y-4">
                          {wallet.addressLine1 && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Address Line 1
                              </div>
                              <div className="flex items-center">
                                <Home className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">
                                  {wallet.addressLine1}
                                </span>
                              </div>
                            </div>
                          )}

                          {wallet.addressLine2 && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Address Line 2
                              </div>
                              <div className="flex items-center">
                                <Home className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">
                                  {wallet.addressLine2}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            {wallet.city && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  City
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {wallet.city}
                                  </span>
                                </div>
                              </div>
                            )}

                            {wallet.region && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Region/State
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {wallet.region}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {wallet.postalCode && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Postal Code
                                </div>
                                <div className="flex items-center">
                                  <Hash className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {wallet.postalCode}
                                  </span>
                                </div>
                              </div>
                            )}

                            {wallet.country && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Country
                                </div>
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {wallet.country}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center items-center">
                        <div className="bg-gray-200 w-full h-48 rounded-lg flex items-center justify-center mb-3">
                          <MapPin className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-gray-500 block">
                            Map preview would display here
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Location map preview based on address information
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab Content */}
                {activeTab === "activity" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Wallet Activity
                      </h3>
                      <span className="text-sm text-gray-500">
                        Last 30 days
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        View Statistics
                      </h4>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            Total Views
                          </div>
                          <div className="text-xl font-semibold text-purple-700 flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-purple-500" />
                            {wallet.viewCount || 0}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            Unique Views
                          </div>
                          <div className="text-xl font-semibold text-purple-700 flex items-center">
                            <User className="h-4 w-4 mr-1 text-purple-500" />
                            {wallet.uniqueViewCount || 0}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            View Rate
                          </div>
                          <div className="text-xl font-semibold text-purple-700">
                            {wallet.viewCount && wallet.uniqueViewCount
                              ? (
                                  wallet.viewCount /
                                  (wallet.uniqueViewCount || 1)
                                ).toFixed(1)
                              : "0"}
                            <span className="text-xs text-gray-500 ml-1">
                              per visitor
                            </span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">
                            Last Viewed
                          </div>
                          <div className="text-sm font-medium text-purple-700">
                            <Clock className="h-4 w-4 inline mr-1 text-purple-500" />
                            {wallet.lastViewedAt
                              ? formatDate(wallet.lastViewedAt).split(",")[0]
                              : "Never"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Recent Activity
                      </h4>

                      {/* You would implement actual activity history here */}
                      <div className="space-y-4">
                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Eye className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              Wallet viewed
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(wallet.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Edit className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              Wallet details updated
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(wallet.modifiedAt)}
                            </div>
                          </div>
                        </div>

                        {wallet.isVerified && wallet.verifiedOn && (
                          <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                              <CheckCircle className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                Wallet verified
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(wallet.verifiedOn)}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-center py-2">
                          <p className="text-sm text-gray-500">
                            Activity history is limited to recent events
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="flex justify-between items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
              <div className="text-sm text-gray-600">
                <p>
                  Viewing wallet details for address:{" "}
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {wallet.formattedAddress}
                  </code>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/public-wallets/${address}/edit`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit Wallet
                </Link>
                <Link
                  to="/admin/public-wallets"
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to List
                </Link>
              </div>
            </div>
          </>
        )}

        {/* No Wallet Found */}
        {!isWalletLoading && !wallet && !generalError && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Wallet Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find a wallet with the address: {address}
            </p>
            <button
              onClick={handleBackToList}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Wallet List
            </button>
          </div>
        )}
      </main>

      <AdminFooter />

      {/* Animation styles */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPublicWalletDetailPage;
