// src/pages/UserManagement/DetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
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
} from "lucide-react";
import { toast } from "react-toastify";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import {
  useUser,
  USER_STATUS,
  USER_ROLE,
  PROFILE_VERIFICATION_STATUS,
} from "../../../hooks/useUser";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchUserById, deleteUser, isLoading, error, reset } = useUser();

  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
        className="flex-grow container mx-auto px-4 py-8 max-w-4xl"
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
                <div className="flex space-x-8" aria-label="Tabs">
                  <div className="border-b-2 border-purple-500 py-2 px-1">
                    <span className="text-sm font-medium text-purple-600">
                      Information
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Sections */}
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
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
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
    </div>
  );
};

export default UserDetailsPage;
