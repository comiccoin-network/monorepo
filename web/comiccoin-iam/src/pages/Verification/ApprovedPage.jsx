// monorepo/web/comiccoin-iam/src/pages/Verification/ApprovedPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  CheckCircle,
  Award,
  Wallet,
  ArrowRight,
  User,
  Calendar,
  CheckSquare,
  Shield,
  Coins,
  Gift,
  FileText,
  Sparkles,
} from "lucide-react";

import Header from "../../components/IndexPage/Header";
import Footer from "../../components/IndexPage/Footer";
import { useAuth } from "../../hooks/useAuth";
import { useGetMe } from "../../hooks/useGetMe";

const VerificationApprovedPage = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const { user, refetch } = useGetMe();

  // Define verification status constants
  const VERIFICATION_STATUS = {
    UNVERIFIED: 1,
    SUBMITTED_FOR_REVIEW: 2,
    APPROVED: 3,
    REJECTED: 4,
  };

  useEffect(() => {
    console.log("APPROVED PAGE MOUNTED", {
      user,
      verificationStatus: user?.profile_verification_status,
      pathname: window.location.pathname,
      time: new Date().toISOString(),
    });

    return () => {
      console.log("APPROVED PAGE UNMOUNTED", {
        time: new Date().toISOString(),
      });
    };
  }, [user]);

  // Add this effect for a one-time forced update
  useEffect(() => {
    // Force refresh user data when the approved page loads
    console.log("🔄 Forcing user data refresh on VerificationApprovedPage");
    refetch().catch((err) =>
      console.error("Failed to refresh user data:", err),
    );

    // Also ensure localStorage is updated with verified status
    if (
      authUser &&
      updateUser &&
      authUser.profile_verification_status !== VERIFICATION_STATUS.APPROVED
    ) {
      console.log(
        "🔄 Explicitly updating user verification status in auth context",
      );
      const updatedUser = {
        ...authUser,
        profile_verification_status: VERIFICATION_STATUS.APPROVED,
      };
      updateUser(updatedUser);
    }
  }, [refetch, authUser, updateUser]);

  // Redirect if status is not approved
  useEffect(() => {
    if (user) {
      if (user.profile_verification_status === VERIFICATION_STATUS.REJECTED) {
        navigate("/verification/rejected");
      } else if (
        user.profile_verification_status ===
        VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW
      ) {
        navigate("/verification/pending");
      } else if (
        user.profile_verification_status === VERIFICATION_STATUS.UNVERIFIED
      ) {
        navigate("/verification");
      }
    }
  }, [user, navigate]);

  // Get approval time (use modified_at if available)
  const approvalTime = user?.modified_at || new Date().toISOString();
  const approvalDate = new Date(approvalTime);

  // Format dates in a user-friendly way
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Modified navigate to dashboard function with proper state synchronization
  const goToDashboard = async () => {
    try {
      // First ensure we have the latest user data
      console.log("🔄 Refreshing user data before navigating to dashboard");
      const freshData = await refetch();

      // Explicitly update auth context with approved status to ensure HOC sees correct status
      if (updateUser) {
        const updatedUser = {
          ...(freshData || user || authUser),
          profile_verification_status: VERIFICATION_STATUS.APPROVED,
        };
        console.log(
          "📌 Updating auth context before navigation:",
          updatedUser.profile_verification_status,
        );
        updateUser(updatedUser);
      }

      // Add a small delay to ensure state propagation
      setTimeout(() => {
        // Use replace instead of push to avoid history issues
        console.log("🚀 Navigating to dashboard");
        navigate("/dashboard", { replace: true });
      }, 50);
    } catch (err) {
      console.error("Failed to refresh user data before navigation:", err);
      // Navigate anyway as fallback
      navigate("/dashboard", { replace: true });
    }
  };

  // Benefits of verification
  const verificationBenefits = [
    "Access to claim ComicCoins daily from the faucet",
    "Ability to participate in exclusive comic drops and auctions",
    "Verified profile badge on all ComicCoin interactions",
    "Priority customer support for all your needs",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showButton={false} showBackButton={false} />

      <main id="main-content" className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-green-500">
            {/* Card Header */}
            <div className="px-6 py-8 sm:p-10 bg-gradient-to-r from-green-50 to-green-100 flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="h-24 w-24 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center">
                  <Sparkles
                    className="h-12 w-12 text-green-500"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  Verification Approved
                </h1>
                <p className="mt-2 text-lg text-gray-700">
                  Congratulations! Your profile has been successfully verified.
                </p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Fully Verified
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-10">
              {/* Approval Info */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-3">
                  <CheckSquare
                    className="mr-2 h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                  Verification Status
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Submitted on</p>
                      <p className="text-md font-medium text-gray-800">
                        {user?.created_at
                          ? formatDate(new Date(user.created_at))
                          : "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Approved on</p>
                      <p className="text-md font-medium text-gray-800">
                        {formatDate(approvalDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account type</p>
                      <p className="text-md font-medium text-gray-800">
                        {user?.role === 2
                          ? "Business/Retailer"
                          : "Individual Collector"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-md font-medium text-green-600 flex items-center">
                        <CheckCircle
                          className="mr-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                        Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award
                    className="mr-2 h-5 w-5 text-purple-500"
                    aria-hidden="true"
                  />
                  Your Verification Benefits
                </h2>

                <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                  <p className="text-sm text-gray-700 mb-4">
                    As a verified member, you now have access to the following
                    benefits:
                  </p>
                  <ul className="space-y-3">
                    {verificationBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle
                          className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* What's Next */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  What's Next
                </h2>

                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Wallet
                        className="h-5 w-5 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-md font-medium text-blue-800">
                        Start Using ComicCoin Network
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 space-y-3">
                        <p>
                          You're now ready to fully engage with the ComicCoin
                          Network ecosystem. Here's how to get started:
                        </p>
                        <p>
                          1. Visit your dashboard to check your current coin
                          balance and account status.
                        </p>
                        <p>
                          2. Claim your daily ComicCoins from the faucet to
                          build your balance.
                        </p>
                        <p>
                          3. Explore the marketplace for valuable comic
                          collectibles and exclusive drops.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Started Section */}
              <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Coins
                      className="h-5 w-5 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-green-800">
                      Ready to Get Started
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      Your account is now fully verified and ready to use. Head
                      to your dashboard to start exploring all features of the
                      ComicCoin Network.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={goToDashboard}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Go to Dashboard
                        <ArrowRight
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/help"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FileText
                className="mr-1.5 h-4 w-4 text-gray-500"
                aria-hidden="true"
              />
              Help Center
            </Link>
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

export default VerificationApprovedPage;
