// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/DetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  User,
  ArrowLeft,
  Edit2,
  Trash2,
  Loader,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
  User as UserIcon,
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
  Wallet,
  BookOpen,
  Copy,
  Eye,
  UserCheck,
  Share2,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  ExternalLink as ExternalLinkIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  useUser,
  USER_STATUS,
  USER_ROLE,
  PROFILE_VERIFICATION_STATUS,
} from "../../../hooks/useUser";
import {
  usePublicWalletList,
  usePublicWallet,
} from "../../../hooks/usePublicWallet";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchUserById, deleteUser, isLoading, error, reset } = useUser();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("information");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // States for wallets section
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [notification, setNotification] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showDeleteWalletConfirm, setShowDeleteWalletConfirm] = useState(false);

  // Get public wallets for this user
  const {
    wallets,
    isLoading: isLoadingWallets,
    error: walletError,
    refetch: refetchWallets,
  } = usePublicWalletList({ userId: id });

  const {
    deletePublicWallet,
    isLoading: isOperationLoading,
    WALLET_STATUS,
  } = usePublicWallet();

  // Simple notification function
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Fetch user details on component mount
  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        const userData = await fetchUserById(id);
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user details:", err);
        setGeneralError("Failed to load user details. Please try again.");
      }
    };

    loadUser();

    return () => {
      reset(); // Cleanup on unmount
    };
  }, [id, fetchUserById, reset]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      setGeneralError(error.message || "An error occurred");
    } else {
      setGeneralError("");
    }
  }, [error]);

  // Handle wallet errors
  useEffect(() => {
    if (walletError) {
      toast.error(
        `Error fetching wallets: ${walletError.message || "Unknown error"}`,
      );
    }
  }, [walletError]);

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      navigate("/admin/users");
    } catch (err) {
      console.error("Failed to delete user:", err);
      setGeneralError("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Wallet functionality
  const handleViewWallet = (address) => {
    window.open(`/directory/${address}`, "_blank");
  };

  const copyAddress = (address) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        showNotification("Address copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy address:", err);
      });
  };

  const handleShareWallet = (address) => {
    const publicUrl = `${window.location.origin}/directory/${address}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        showNotification("Public wallet link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  // Navigate to edit page
  const handleEdit = () => {
    navigate(`/admin/users/${id}/edit`);
  };

  // Navigate back to list
  const handleBackToList = () => {
    navigate("/admin/users");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get role label with icon
  const getRoleDisplay = (roleCode) => {
    switch (roleCode) {
      case USER_ROLE.ROOT:
        return {
          label: "Administrator",
          icon: <Shield className="h-5 w-5 mr-2 text-purple-600" />,
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
        };
      case USER_ROLE.COMPANY:
        return {
          label: "Business/Retailer",
          icon: <Building className="h-5 w-5 mr-2 text-blue-600" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      case USER_ROLE.INDIVIDUAL:
        return {
          label: "Individual",
          icon: <UserCircle className="h-5 w-5 mr-2 text-yellow-600" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      default:
        return {
          label: "Unknown",
          icon: <UserIcon className="h-5 w-5 mr-2 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  // Get status display info
  const getStatusDisplay = (statusCode) => {
    switch (statusCode) {
      case USER_STATUS.ACTIVE:
        return {
          label: "Active",
          icon: <CheckCircle className="h-5 w-5 mr-2 text-green-600" />,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          dotColor: "bg-green-500",
        };
      case USER_STATUS.LOCKED:
        return {
          label: "Locked",
          icon: <Shield className="h-5 w-5 mr-2 text-red-600" />,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          dotColor: "bg-red-500",
        };
      case USER_STATUS.ARCHIVED:
        return {
          label: "Archived",
          icon: <XCircle className="h-5 w-5 mr-2 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          dotColor: "bg-gray-400",
        };
      default:
        return {
          label: "Unknown",
          icon: <AlertCircle className="h-5 w-5 mr-2 text-gray-600" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          dotColor: "bg-gray-400",
        };
    }
  };

  // Get verification status display
  const getVerificationStatusDisplay = (statusCode) => {
    switch (statusCode) {
      case PROFILE_VERIFICATION_STATUS.APPROVED:
        return {
          label: "Verified",
          icon: <CheckCircle className="h-5 w-5 mr-2 text-green-600" />,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        };
      case PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
        return {
          label: "Under Review",
          icon: <Clock className="h-5 w-5 mr-2 text-blue-600" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      case PROFILE_VERIFICATION_STATUS.REJECTED:
        return {
          label: "Rejected",
          icon: <XCircle className="h-5 w-5 mr-2 text-red-600" />,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
        };
      case PROFILE_VERIFICATION_STATUS.UNVERIFIED:
      default:
        return {
          label: "Unverified",
          icon: <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
    }
  };

  // Get the wallet status label
  const getWalletStatusLabel = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return "Active";
      case WALLET_STATUS.ARCHIVED:
        return "Archived";
      case WALLET_STATUS.LOCKED:
        return "Locked";
      default:
        return "Unknown";
    }
  };

  // Get the wallet status class
  const getWalletStatusClass = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return "bg-green-100 text-green-800";
      case WALLET_STATUS.ARCHIVED:
        return "bg-gray-100 text-gray-600";
      case WALLET_STATUS.LOCKED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Get the wallet status dot class
  const getWalletStatusDotClass = (statusCode) => {
    switch (statusCode) {
      case WALLET_STATUS.ACTIVE:
        return "bg-green-500";
      case WALLET_STATUS.ARCHIVED:
        return "bg-gray-400";
      case WALLET_STATUS.LOCKED:
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Get formatted address
  const getFormattedAddress = (userData) => {
    if (!userData) return "N/A";

    const parts = [];
    if (userData.addressLine1) parts.push(userData.addressLine1);
    if (userData.addressLine2) parts.push(userData.addressLine2);

    const cityRegion = [];
    if (userData.city) cityRegion.push(userData.city);
    if (userData.region) cityRegion.push(userData.region);

    if (cityRegion.length > 0) parts.push(cityRegion.join(", "));
    if (userData.postalCode) parts.push(userData.postalCode);
    if (userData.country) parts.push(userData.country);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  // Pagination for wallets
  const indexOfLastWallet = currentPage * itemsPerPage;
  const indexOfFirstWallet = indexOfLastWallet - itemsPerPage;
  const currentWallets = wallets
    ? wallets.slice(indexOfFirstWallet, indexOfLastWallet)
    : [];
  const totalPages = wallets ? Math.ceil(wallets.length / itemsPerPage) : 0;

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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

      {/* Simple Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {notification}
        </div>
      )}

      <main
        id="main-content"
        className="flex-grow container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-purple-900">User Details</h1>
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600 hover:text-gray-800"
            aria-label="Return to user list"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to List
          </button>
        </div>

        {/* Error Display */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading user details...</p>
          </div>
        )}

        {/* User Details */}
        {!isLoading && user && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {/* Card Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-white/20 p-3 rounded-lg mr-4">
                    {user.isCompany ? (
                      <Building className="h-6 w-6" aria-hidden="true" />
                    ) : user.isRoot ? (
                      <Shield className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <User className="h-6 w-6" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.fullName}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-purple-100">{user.email}</span>

                      {/* Verification Badge */}
                      {user.isVerified ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Info className="h-3 w-3 mr-1" />
                          Unverified
                        </span>
                      )}

                      {/* User Role Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isRoot
                            ? "bg-purple-100 text-purple-800"
                            : user.isCompany
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.isRoot ? (
                          <Shield className="h-3 w-3 mr-1" />
                        ) : user.isCompany ? (
                          <Building className="h-3 w-3 mr-1" />
                        ) : (
                          <UserCircle className="h-3 w-3 mr-1" />
                        )}
                        {user.getRoleLabel()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    {user.status !== undefined && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          getStatusDisplay(user.status).bgColor
                        } ${getStatusDisplay(user.status).textColor}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-1.5 ${
                            getStatusDisplay(user.status).dotColor
                          }`}
                        ></span>
                        {getStatusDisplay(user.status).label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="p-6">
              {/* Description */}
              {user.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    About
                  </h3>
                  <p className="text-gray-700">{user.description}</p>
                </div>
              )}

              {/* Tabs for different sections */}
              <div className="border-b border-gray-200 mb-6">
                <div
                  className="flex flex-wrap overflow-x-auto"
                  aria-label="Tabs"
                >
                  <button
                    onClick={() => setActiveTab("information")}
                    className={`py-3 px-5 text-sm font-medium border-b-2 ${
                      activeTab === "information"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Information
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("location")}
                    className={`py-3 px-5 text-sm font-medium border-b-2 ${
                      activeTab === "location"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </span>
                  </button>

                  {user.isCompany && (
                    <button
                      onClick={() => setActiveTab("business")}
                      className={`py-3 px-5 text-sm font-medium border-b-2 ${
                        activeTab === "business"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Business
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab("wallets")}
                    className={`py-3 px-5 text-sm font-medium border-b-2 ${
                      activeTab === "wallets"
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Wallets
                    </span>
                  </button>
                </div>
              </div>

              {/* User Information Tab Content */}
              {activeTab === "information" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* User Information Section */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 text-purple-600 mr-2" />
                      User Information
                    </h3>

                    <div className="space-y-4">
                      {/* Email */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Email Address
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {user.email || "N/A"}
                            </p>
                            {user.wasEmailVerified && (
                              <span className="inline-flex items-center text-xs text-green-600 mt-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Email verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Phone Number
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {user.phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          {getRoleDisplay(user.role).icon}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              User Role
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {user.getRoleLabel()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {user.isRoot
                                ? "Administrator with full system access"
                                : user.isCompany
                                  ? "Business/retailer account with company features"
                                  : "Standard individual user account"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Status */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          {
                            getVerificationStatusDisplay(
                              user.profileVerificationStatus,
                            ).icon
                          }
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Verification Status
                            </h4>
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  getVerificationStatusDisplay(
                                    user.profileVerificationStatus,
                                  ).bgColor
                                } ${getVerificationStatusDisplay(user.profileVerificationStatus).textColor}`}
                              >
                                {user.getVerificationStatusLabel()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Website URL (if available) */}
                      {user.websiteURL && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start">
                            <Globe className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Website
                              </h4>
                              <a
                                href={
                                  user.websiteURL.startsWith("http")
                                    ? user.websiteURL
                                    : `https://${user.websiteURL}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 text-blue-600 hover:text-blue-800 break-all inline-flex items-center"
                              >
                                {user.websiteURL}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Wallet Address (if available) */}
                      {user.walletAddress && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start">
                            <Wallet className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Wallet Address
                              </h4>
                              <p className="mt-1 text-gray-900 font-mono break-all">
                                {user.walletAddress}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Chain ID: {user.chainId || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comic Book Store (for Company users) */}
                      {user.isCompany && user.comicBookStoreName && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start">
                            <BookOpen className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Comic Book Store
                              </h4>
                              <p className="mt-1 text-gray-900 font-medium">
                                {user.comicBookStoreName}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact & Location Section */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                      Contact & Location
                    </h3>

                    <div className="space-y-4">
                      {/* Full Address */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Home className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Address
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {getFormattedAddress(user)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timezone */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Timezone
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {user.timezone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Created Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Created
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {formatDate(user.createdAt)}
                            </p>
                            {user.createdByName && (
                              <p className="text-xs text-gray-500 mt-1">
                                by {user.createdByName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Last Modified */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Last Modified
                            </h4>
                            <p className="mt-1 text-gray-900">
                              {formatDate(user.modifiedAt)}
                            </p>
                            {user.modifiedByName && (
                              <p className="text-xs text-gray-500 mt-1">
                                by {user.modifiedByName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Preferences */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Preferences
                            </h4>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center">
                                <span
                                  className={`h-2 w-2 rounded-full ${user.agreePromotions ? "bg-green-500" : "bg-gray-300"} mr-2`}
                                ></span>
                                <span className="text-sm text-gray-700">
                                  {user.agreePromotions
                                    ? "Agreed to"
                                    : "Declined"}{" "}
                                  promotional communications
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span
                                  className={`h-2 w-2 rounded-full ${user.agreeToTrackingAcrossThirdPartyAppsAndServices ? "bg-green-500" : "bg-gray-300"} mr-2`}
                                ></span>
                                <span className="text-sm text-gray-700">
                                  {user.agreeToTrackingAcrossThirdPartyAppsAndServices
                                    ? "Agreed to"
                                    : "Declined"}{" "}
                                  tracking across apps and services
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span
                                  className={`h-2 w-2 rounded-full ${user.agreeTermsOfService ? "bg-green-500" : "bg-gray-300"} mr-2`}
                                ></span>
                                <span className="text-sm text-gray-700">
                                  {user.agreeTermsOfService
                                    ? "Agreed to"
                                    : "Has not agreed to"}{" "}
                                  terms of service
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Tab Content */}
              {activeTab === "location" && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Address Information Card */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                      Address Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Full Address
                        </h4>
                        <p className="text-gray-800">
                          {getFormattedAddress(user)}
                        </p>
                      </div>

                      {user.addressLine1 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Address Details
                          </h4>
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            <div className="sm:col-span-2">
                              <dt className="text-xs text-gray-500">
                                Address Line 1
                              </dt>
                              <dd className="text-gray-800">
                                {user.addressLine1}
                              </dd>
                            </div>

                            {user.addressLine2 && (
                              <div className="sm:col-span-2">
                                <dt className="text-xs text-gray-500">
                                  Address Line 2
                                </dt>
                                <dd className="text-gray-800">
                                  {user.addressLine2}
                                </dd>
                              </div>
                            )}

                            <div>
                              <dt className="text-xs text-gray-500">City</dt>
                              <dd className="text-gray-800">
                                {user.city || "N/A"}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-xs text-gray-500">
                                State/Region
                              </dt>
                              <dd className="text-gray-800">
                                {user.region || "N/A"}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-xs text-gray-500">
                                Postal/ZIP Code
                              </dt>
                              <dd className="text-gray-800">
                                {user.postalCode || "N/A"}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-xs text-gray-500">Country</dt>
                              <dd className="text-gray-800">
                                {user.country || "N/A"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  {user.addressLine1 && user.city && user.country && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Location Map
                      </h3>
                      <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                          <p>Map view would be displayed here</p>
                          <p className="text-sm">{getFormattedAddress(user)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Business Tab Content */}
              {activeTab === "business" && user.isCompany && (
                <div className="grid grid-cols-1 gap-6">
                  {/* Business Details Card */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="h-5 w-5 text-purple-600 mr-2" />
                      Business Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Basic Information
                        </h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-xs text-gray-500">
                              Business Type
                            </dt>
                            <dd className="text-gray-800 font-medium flex items-center">
                              <Building className="h-4 w-4 text-blue-600 mr-1" />
                              Retailer/Company
                            </dd>
                          </div>

                          <div>
                            <dt className="text-xs text-gray-500">
                              Comic Book Store Name
                            </dt>
                            <dd className="text-gray-800 font-medium">
                              {user.comicBookStoreName || "N/A"}
                            </dd>
                          </div>

                          {user.websiteURL && (
                            <div>
                              <dt className="text-xs text-gray-500">
                                Business Website
                              </dt>
                              <dd>
                                <a
                                  href={
                                    user.websiteURL.startsWith("http")
                                      ? user.websiteURL
                                      : `https://${user.websiteURL}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                >
                                  {user.websiteURL}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Business Address
                        </h4>
                        <p className="text-gray-800">
                          {getFormattedAddress(user)}
                        </p>
                      </div>
                    </div>

                    {user.description && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Business Description
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-800">{user.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wallets Tab Content */}
              {activeTab === "wallets" && (
                <div>
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                        User's Public Wallets
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage public wallets associated with {user.firstName}'s
                        account
                      </p>
                    </div>

                    <div className="mt-3 sm:mt-0 flex items-center">
                      {/* View Mode Toggle */}
                      <div className="mr-4 flex border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-1 ${viewMode === "grid" ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                          aria-label="Grid view"
                          title="Grid view"
                        >
                          <Grid className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-1 ${viewMode === "list" ? "bg-purple-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                          aria-label="List view"
                          title="List view"
                        >
                          <List className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Create New Wallet Link (opens in new window) */}
                      <a
                        href={`/admin/users/${id}/add-wallet`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Wallet
                      </a>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isLoadingWallets && (
                    <div className="text-center py-8 bg-white rounded-lg shadow-md">
                      <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-3" />
                      <p className="text-gray-600">Loading wallets...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {walletError && !isLoadingWallets && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>
                          Error loading wallets:{" "}
                          {walletError.message || "An unknown error occurred"}
                        </span>
                      </div>
                      <button
                        onClick={() => refetchWallets()}
                        className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Grid View */}
                  {!isLoadingWallets && !walletError && viewMode === "grid" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {currentWallets && currentWallets.length > 0 ? (
                        currentWallets.map((wallet) => (
                          <div
                            key={wallet.address}
                            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            {/* Card Header with Status */}
                            <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                              <h4 className="font-medium text-gray-800 truncate">
                                {wallet.name}
                              </h4>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWalletStatusClass(wallet.status)}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full mr-1.5 ${getWalletStatusDotClass(wallet.status)}`}
                                ></span>
                                {getWalletStatusLabel(wallet.status)}
                              </span>
                            </div>

                            {/* Card Body with QR Code and Info */}
                            <div className="p-4">
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* QR Code */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                  <div className="p-2 bg-white rounded-lg border border-gray-200 mb-2">
                                    <QRCodeSVG
                                      value={wallet.address}
                                      size={100}
                                      level="H"
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500 text-center">
                                    Scan to view
                                  </div>
                                </div>

                                {/* Wallet Details */}
                                <div className="flex-grow space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Address
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                        {formatAddress(wallet.address)}
                                      </code>
                                      <button
                                        onClick={() =>
                                          copyAddress(wallet.address)
                                        }
                                        className="p-1 text-gray-500 hover:text-purple-600"
                                        aria-label="Copy address"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {wallet.description && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">
                                        Description
                                      </p>
                                      <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                                        {wallet.description}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex gap-4 mt-2">
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Total Views
                                      </p>
                                      <div className="flex items-center gap-1 text-blue-600">
                                        <Eye className="h-4 w-4" />
                                        <span className="font-medium">
                                          {wallet.viewCount || 0}
                                        </span>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Unique Views
                                      </p>
                                      <div className="flex items-center gap-1 text-amber-600">
                                        <UserCheck className="h-4 w-4" />
                                        <span className="font-medium">
                                          {wallet.uniqueViewCount || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex mt-4 pt-3 border-t border-gray-100 justify-between">
                                <div className="flex gap-2">
                                  <Link
                                    to={`/admin/users/${user.id}/wallet/${wallet.address}/edit`}
                                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    aria-label="Edit wallet"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleShareWallet(wallet.address)
                                    }
                                    className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                                    aria-label="Share wallet"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </button>
                                  <Link
                                    to={`/admin/users/${user.id}/wallet/${wallet.address}/delete`}
                                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                    aria-label="Delete wallet"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Link>
                                </div>
                                <button
                                  onClick={() =>
                                    handleViewWallet(wallet.address)
                                  }
                                  className="text-xs inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
                                >
                                  View Details
                                  <ExternalLinkIcon className="ml-1 h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
                          <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No Wallets Found
                          </h3>
                          <p className="text-gray-600 mb-4">
                            This user doesn't have any public wallets yet.
                          </p>
                          <a
                            href={`/admin/wallets/add?userId=${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Their First Wallet
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* List View */}
                  {!isLoadingWallets && !walletError && viewMode === "list" && (
                    <div className="space-y-4 mb-8">
                      {currentWallets && currentWallets.length > 0 ? (
                        currentWallets.map((wallet) => (
                          <div
                            key={wallet.address}
                            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row">
                              {/* Left Side Color Bar */}
                              <div
                                className={`md:w-1 w-full h-1 md:h-auto ${
                                  wallet.status === WALLET_STATUS.ACTIVE
                                    ? "bg-green-500"
                                    : wallet.status === WALLET_STATUS.ARCHIVED
                                      ? "bg-gray-400"
                                      : "bg-red-500"
                                }`}
                              ></div>

                              <div className="flex-grow p-4">
                                {/* Header with name and status */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium text-gray-800 flex items-center">
                                      {wallet.name}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono mr-2">
                                        {formatAddress(wallet.address)}
                                      </code>
                                      <button
                                        onClick={() =>
                                          copyAddress(wallet.address)
                                        }
                                        className="p-1 text-gray-500 hover:text-purple-600"
                                        aria-label="Copy address"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 md:mt-0">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getWalletStatusClass(wallet.status)}`}
                                    >
                                      <span
                                        className={`h-2 w-2 rounded-full mr-1 ${getWalletStatusDotClass(wallet.status)}`}
                                      ></span>
                                      {getWalletStatusLabel(wallet.status)}
                                    </span>
                                  </div>
                                </div>

                                {/* Description */}
                                {wallet.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                    {wallet.description}
                                  </p>
                                )}

                                {/* Stats and Actions */}
                                <div className="flex flex-wrap justify-between items-center pt-2 border-t border-gray-100">
                                  <div className="flex gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Created
                                      </p>
                                      <div className="text-sm">
                                        {formatDate(wallet.createdAt)}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Views
                                      </p>
                                      <div className="flex items-center gap-1 text-blue-600">
                                        <Eye className="h-3 w-3" />
                                        <span className="font-medium text-sm">
                                          {wallet.viewCount || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <button
                                      onClick={() =>
                                        handleEditWallet(wallet.address)
                                      }
                                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      aria-label="Edit wallet"
                                      title="Edit wallet"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleShareWallet(wallet.address)
                                      }
                                      className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                                      aria-label="Share wallet"
                                      title="Share wallet"
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </button>
                                    <Link
                                      to={`/admin/users/${user.id}/wallet/${wallet.address}/delete`}
                                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                      aria-label="Delete wallet"
                                      title="Delete wallet"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Link>
                                    <button
                                      onClick={() =>
                                        handleViewWallet(wallet.address)
                                      }
                                      className="text-xs inline-flex items-center ml-2 px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-colors"
                                    >
                                      View
                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                          <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No Wallets Found
                          </h3>
                          <p className="text-gray-600 mb-4">
                            This user doesn't have any public wallets yet.
                          </p>
                          <a
                            href={`/admin/wallets/add?userId=${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Their First Wallet
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {!isLoadingWallets &&
                    !walletError &&
                    wallets &&
                    wallets.length > itemsPerPage && (
                      <div className="flex justify-center mt-6">
                        <nav
                          className="flex items-center space-x-1"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-md ${
                              currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((number) => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === number
                                  ? "bg-purple-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                              aria-current={
                                currentPage === number ? "page" : undefined
                              }
                            >
                              {number}
                            </button>
                          ))}

                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-md ${
                              currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            aria-label="Next page"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    )}

                  {/* Delete Wallet Confirmation Modal */}
                  {showDeleteWalletConfirm && selectedWallet && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scaleIn">
                        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                          Delete Wallet
                        </h3>
                        <p className="text-gray-600 mb-6 text-center">
                          Are you sure you want to delete{" "}
                          <span className="font-semibold">
                            {selectedWallet?.name}
                          </span>
                          ? This action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-3">
                          <button
                            onClick={handleCancelDeleteWallet}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
                            disabled={isOperationLoading}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleConfirmDeleteWallet}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center font-medium"
                            disabled={isOperationLoading}
                          >
                            {isOperationLoading ? (
                              <>
                                <Loader className="h-4 w-4 animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Wallet
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
              <div>{/* Additional action buttons could go here */}</div>

              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center bg-blue-50 border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit User
                </button>

                {!user.isRoot && ( // Prevent deleting root users
                  <button
                    onClick={handleDeleteClick}
                    className="inline-flex items-center justify-center bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No User Found */}
        {!isLoading && !user && !generalError && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find a user with the ID: {id}
            </p>
            <button
              onClick={handleBackToList}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to User List
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the user{" "}
                <span className="font-semibold">{user?.fullName}</span>? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AdminFooter />

      {/* Animations for modals */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserDetailsPage;
