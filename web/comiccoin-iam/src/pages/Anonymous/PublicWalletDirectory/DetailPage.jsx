// src/pages/Anonymous/PublicWalletDirectory/DetailPage.jsx
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Building,
  User,
  MapPin,
  Mail,
  Globe,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  Tag,
  EyeIcon,
  Wallet,
  BadgeCheck,
  Copy,
  ExternalLink,
  Share2,
  ChevronRight,
  CreditCard,
  AlertTriangle,
  Shield,
} from "lucide-react";

import {
  useSinglePublicWalletFromDirectory,
  usePublicWalletDirectory,
  WALLET_TYPE,
} from "../../../hooks/usePublicWalletDirectory";
import Header from "../../../components/IndexPage/Header";
import Footer from "../../../components/IndexPage/Footer";

const PublicWalletDirectoryDetailPage = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);

  // Use our hook to fetch the wallet details
  const {
    data: wallet,
    isLoading,
    error,
    refetch,
  } = useSinglePublicWalletFromDirectory(address);

  // Track wallet view
  const { trackWalletView } = usePublicWalletDirectory();

  // Track wallet view when the component mounts
  useEffect(() => {
    if (address) {
      trackWalletView(address)
        .then((success) => {
          if (success) {
            console.log("Successfully tracked wallet view");
          }
        })
        .catch((err) => {
          console.error("Error tracking wallet view:", err);
        });
    }
  }, [address, trackWalletView]);

  // Copy wallet address to clipboard
  const copyAddressToClipboard = () => {
    if (!wallet?.address) return;

    navigator.clipboard
      .writeText(wallet.address)
      .then(() => {
        setCopySuccess(true);
        // Reset copy success status after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  // Function to determine if the entity is a retailer or individual
  const isRetailer = (wallet) => {
    return wallet?.type === WALLET_TYPE.COMPANY;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <Header showBackButton={true} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-gray-700">
              Loading wallet details...
            </h3>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <Header showBackButton={true} />
        <main className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Error Loading Wallet Details
              </h3>
              <p className="text-gray-600 mb-6">
                {error.message ||
                  "Failed to load wallet information. Please try again later."}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/directory")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Directory
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        <Header showBackButton={true} />
        <main className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Wallet Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The wallet address you're looking for doesn't exist in our
                directory or has been removed.
              </p>
              <button
                onClick={() => navigate("/directory")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Directory
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine if this is a retailer or individual
  const entityType = isRetailer(wallet) ? "retailer" : "individual";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <Header showBackButton={true} />

      <main className="flex-grow">
        {/* Hero section with breadcrumb */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm mb-2">
              <Link to="/" className="hover:text-indigo-200 transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <Link
                to="/directory"
                className="hover:text-indigo-200 transition-colors"
              >
                Directory
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-indigo-200">
                {wallet.name || "Wallet Details"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {wallet.name}
                </h1>
                <p className="text-indigo-200 flex items-center mt-1">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="font-mono">{wallet.formattedAddress}</span>
                  <button
                    onClick={copyAddressToClipboard}
                    className="ml-2 p-1 hover:bg-indigo-500 rounded-full focus:outline-none"
                    aria-label="Copy wallet address"
                  >
                    {copySuccess ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {wallet.isVerified && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    Verified
                  </div>
                )}
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                    entityType === "retailer"
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {entityType === "retailer" ? (
                    <>
                      <Building className="h-4 w-4 mr-1" />
                      Business
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-1" />
                      Individual
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header stripe */}
            <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-500"></div>

            {/* Main content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left column */}
                <div className="md:w-2/3">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      About
                    </h2>
                    <p className="text-gray-700">
                      {wallet.description || "No description provided."}
                    </p>
                  </div>

                  {/* Contact & Location Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        {wallet.websiteURL && (
                          <div className="flex items-center text-gray-700">
                            <Globe className="h-5 w-5 text-gray-400 mr-3" />
                            <a
                              href={
                                wallet.websiteURL.startsWith("http")
                                  ? wallet.websiteURL
                                  : `https://${wallet.websiteURL}`
                              }
                              className="text-indigo-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {wallet.websiteURL}
                              <ExternalLink className="h-3.5 w-3.5 inline-block ml-1" />
                            </a>
                          </div>
                        )}

                        {wallet.phone && (
                          <div className="flex items-center text-gray-700">
                            <Phone className="h-5 w-5 text-gray-400 mr-3" />
                            <a
                              href={`tel:${wallet.phone}`}
                              className="hover:text-indigo-600"
                            >
                              {wallet.phone}
                            </a>
                          </div>
                        )}

                        {/* Add email if available in your model */}
                        {wallet.email && (
                          <div className="flex items-center text-gray-700">
                            <Mail className="h-5 w-5 text-gray-400 mr-3" />
                            <a
                              href={`mailto:${wallet.email}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {wallet.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Location
                      </h3>
                      <div className="space-y-3">
                        {wallet.city && (
                          <div className="flex items-start text-gray-700">
                            <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                              {wallet.addressLine1 && (
                                <div>{wallet.addressLine1}</div>
                              )}
                              {wallet.addressLine2 && (
                                <div>{wallet.addressLine2}</div>
                              )}
                              <div>
                                {[wallet.city, wallet.region, wallet.postalCode]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                              {wallet.country && <div>{wallet.country}</div>}
                            </div>
                          </div>
                        )}

                        {wallet.timezone && (
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-5 w-5 text-gray-400 mr-3" />
                            <span>Timezone: {wallet.timezone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(wallet.tags ||
                    wallet.specialties ||
                    wallet.acceptedPayments) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        {entityType === "retailer"
                          ? "Business Details"
                          : "Specialties"}
                      </h3>

                      {/* Tags or Specialties */}
                      {(wallet.tags || wallet.specialties) && (
                        <div className="flex items-start mb-4">
                          <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div className="flex flex-wrap gap-2">
                            {(wallet.tags || wallet.specialties || []).map(
                              (tag, index) => (
                                <span
                                  key={index}
                                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                                >
                                  {tag}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Accepted Payment Methods */}
                      {wallet.acceptedPayments && (
                        <div className="flex items-start">
                          <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                          <div className="flex flex-wrap gap-2">
                            {wallet.acceptedPayments.map((method, index) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                              >
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Blockchain Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Wallet Address</p>
                      <div className="flex items-center mt-1">
                        <p className="font-mono text-gray-800 break-all">
                          {wallet.address}
                        </p>
                        <button
                          onClick={copyAddressToClipboard}
                          className="ml-2 p-1 hover:bg-gray-200 rounded-full focus:outline-none"
                          aria-label="Copy wallet address"
                        >
                          {copySuccess ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {wallet.chainId && (
                      <div>
                        <p className="text-sm text-gray-500">Chain ID</p>
                        <p className="font-mono text-gray-800">
                          {wallet.chainId}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">
                        Verification Status
                      </p>
                      {wallet.isVerified ? (
                        <div className="flex items-center text-green-700">
                          <Shield className="h-5 w-5 mr-2" />
                          <div>
                            <p className="font-medium">Verified</p>
                            {wallet.verifiedOn && (
                              <p className="text-xs text-gray-500">
                                Verified on{" "}
                                {new Date(
                                  wallet.verifiedOn,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-amber-700">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <p className="font-medium">Not Verified</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">
                        Registration Details
                      </p>

                      <div className="space-y-2">
                        {wallet.createdAt && (
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span>
                              Registered on{" "}
                              {new Date(wallet.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {wallet.viewCount && (
                          <div className="flex items-center text-gray-700">
                            <EyeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{wallet.viewCount} profile views</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Share Button */}
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          navigator.clipboard
                            .writeText(window.location.href)
                            .then(() => alert("Link copied to clipboard"))
                            .catch((err) =>
                              console.error("Failed to copy:", err),
                            );
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                        Share Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={() => navigate("/directory")}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </button>

            <div className="flex gap-3">
              <button
                onClick={copyAddressToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy Address
              </button>
              {wallet.websiteURL && (
                <a
                  href={
                    wallet.websiteURL.startsWith("http")
                      ? wallet.websiteURL
                      : `https://${wallet.websiteURL}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicWalletDirectoryDetailPage;
