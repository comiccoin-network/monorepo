// src/pages/VerificationLaunchpadPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  UserRound,
  Building2,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Info,
  User,
  Loader,
} from "lucide-react";

import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";
import { useAuth } from "../hooks/useAuth";
import { useGetMe } from "../hooks/useGetMe";
import { useVerifyProfile } from "../hooks/useVerifyProfile";

const VerificationLaunchpadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitVerification, isSubmitting } = useVerifyProfile();

  // Ensure we get the latest user data with the current verification status
  const { user: userData, isLoading: isUserLoading } = useGetMe({
    refetchOnMount: true,
    cacheTime: 0, // Disable caching to always get fresh data
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Define verification status constants
  const VERIFICATION_STATUS = {
    UNVERIFIED: 1, // The user's profile has not yet been submitted for verification
    SUBMITTED_FOR_REVIEW: 2, // The user's profile has been submitted and is awaiting review
    APPROVED: 3, // The user's profile has been approved
    REJECTED: 4, // The user's profile has been rejected
  };

  // Define user role constants
  const USER_ROLE = {
    CUSTOMER: 3,
    RETAILER: 2,
    ADMIN: 1,
  };

  // Update verification status and role when user data changes
  useEffect(() => {
    if (userData) {
      console.log("User data loaded:", userData);
      console.log("Verification status:", userData.profile_verification_status);

      setVerificationStatus(
        userData.profile_verification_status || VERIFICATION_STATUS.UNVERIFIED,
      );
      setUserRole(userData.role || USER_ROLE.CUSTOMER);
    }
  }, [userData]);

  // Handle redirections based on verification status
  useEffect(() => {
    console.log(
      "Checking verification status for redirection:",
      verificationStatus,
    );

    // Only redirect if verification status is determined and not UNVERIFIED
    if (
      verificationStatus &&
      verificationStatus !== VERIFICATION_STATUS.UNVERIFIED
    ) {
      console.log(
        "Redirecting based on verification status:",
        verificationStatus,
      );

      if (verificationStatus === VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW) {
        console.log("Redirecting to pending verification page");
        navigate("/verification/pending", { replace: true });
      } else if (verificationStatus === VERIFICATION_STATUS.REJECTED) {
        console.log("Redirecting to rejected verification page");
        navigate("/verification/rejected", { replace: true });
      } else if (verificationStatus === VERIFICATION_STATUS.APPROVED) {
        console.log("Redirecting to dashboard - already approved");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [verificationStatus, navigate, VERIFICATION_STATUS]);

  // Handle selection of verification path (individual or business)
  const handleVerificationSelection = async (selectedRole) => {
    if (isSubmitting) return; // Prevent multiple selections while processing

    // Check if we need to update user role in the profile
    if (user && user.role !== selectedRole) {
      try {
        console.log("Updating user role:", selectedRole);

        // Send a basic verification with just the role selection
        // The actual verification details will be collected on the next screens
        await submitVerification({
          user_role: selectedRole,
        });

        // Navigate to the appropriate verification form based on role
        if (selectedRole === USER_ROLE.CUSTOMER) {
          navigate("/verification/individual");
        } else if (selectedRole === USER_ROLE.RETAILER) {
          navigate("/verification/business");
        }
      } catch (error) {
        console.error("Failed to select verification type:", error);
        // Error will be handled by the hook
      }
    } else {
      // No role update needed, just navigate to the appropriate verification form
      if (selectedRole === USER_ROLE.CUSTOMER) {
        navigate("/verification/individual");
      } else if (selectedRole === USER_ROLE.RETAILER) {
        navigate("/verification/business");
      }
    }
  };

  // Display loading state while fetching user data
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showButton={false} showBackButton={true} />

        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading verification status...</p>
          </div>
        </main>

        <Footer
          isLoading={false}
          error={null}
          faucet={{}}
          formatBalance={(val) => val || "0"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showButton={false} showBackButton={true} />

      <main id="main-content" className="flex-grow">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Page Header */}
            <div className="px-6 py-4 bg-purple-600 text-white">
              <div className="flex items-center">
                <ShieldCheck
                  className="h-6 w-6 mr-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h1 className="text-xl font-medium">Profile Verification</h1>
                  <p className="text-sm text-purple-100 mt-0.5">
                    Verify your profile to access all features
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isSubmitting ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-700">
                  Processing your verification selection...
                </p>
              </div>
            ) : (
              <div className="p-6">
                {/* Information Box */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <div>
                      <h2 className="text-md font-medium text-blue-700">
                        Why verify your profile?
                      </h2>
                      <p className="mt-1 text-sm text-blue-600">
                        Profile verification helps us ensure the security of the
                        ComicCoin network and provides you with full access to
                        all features. Your information is kept secure and only
                        used for verification purposes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Choose Verification Type */}
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Choose your verification type
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Individual Verification Card */}
                  <div
                    onClick={() =>
                      handleVerificationSelection(USER_ROLE.CUSTOMER)
                    }
                    className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <UserRound
                          className="h-6 w-6 text-purple-600"
                          aria-hidden="true"
                        />
                      </div>
                      {user && user.role === USER_ROLE.CUSTOMER && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Current selection
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Individual Collector
                    </h3>
                    <p className="text-gray-600 mb-4">
                      For comic book fans and individual collectors looking to
                      grade and secure their collection.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Personal verification
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Individual accounts
                      </span>
                    </div>
                    <button className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-purple-300 text-sm text-purple-700 font-medium rounded-md hover:bg-purple-50">
                      Continue as Individual
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Business Verification Card */}
                  <div
                    onClick={() =>
                      handleVerificationSelection(USER_ROLE.RETAILER)
                    }
                    className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <Building2
                          className="h-6 w-6 text-purple-600"
                          aria-hidden="true"
                        />
                      </div>
                      {user && user.role === USER_ROLE.RETAILER && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Current selection
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Business / Retailer
                    </h3>
                    <p className="text-gray-600 mb-4">
                      For comic book shops, dealers, and businesses that handle
                      comic grading professionally.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Business verification
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Retailer benefits
                      </span>
                    </div>
                    <button className="w-full mt-2 flex items-center justify-center px-4 py-2 border border-purple-300 text-sm text-purple-700 font-medium rounded-md hover:bg-purple-50">
                      Continue as Business
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Verification Steps */}
                <div className="mt-8">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Verification Process
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-500 mr-3">
                        1
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Select your verification type
                        </h4>
                        <p className="text-sm text-gray-600">
                          Choose either individual collector or
                          business/retailer verification.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-500 mr-3">
                        2
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Complete verification form
                        </h4>
                        <p className="text-sm text-gray-600">
                          Fill out your personal or business information for
                          verification.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-500 mr-3">
                        3
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Wait for approval
                        </h4>
                        <p className="text-sm text-gray-600">
                          Our team will review your submission within 1-2
                          business days.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-500 mr-3">
                        4
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Access all features
                        </h4>
                        <p className="text-sm text-gray-600">
                          Once approved, you'll have full access to all
                          ComicCoin features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center">
                    <h3 className="text-md font-medium text-gray-900">
                      Need help?
                    </h3>
                    <Link
                      to="/help"
                      className="ml-3 text-sm text-purple-600 hover:text-purple-700"
                    >
                      View Help Center
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    If you have any questions about the verification process,
                    please visit our Help Center or contact our support team.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />
    </div>
  );
};

export default VerificationLaunchpadPage;
