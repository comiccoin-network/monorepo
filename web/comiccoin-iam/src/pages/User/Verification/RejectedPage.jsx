// monorepo/web/comiccoin-iam/src/pages/User/Verification/RejectedPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Mail,
  RefreshCw,
  LogOut,
  Info,
  ShieldX,
  AlertOctagon,
  FileQuestion,
} from "lucide-react";

import Header from "../../../components/IndexPage/Header";
import Footer from "../../../components/IndexPage/Footer";
import { useAuth } from "../../../hooks/useAuth";
import { useGetMe } from "../../../hooks/useGetMe";

const VerificationRejectedPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useGetMe();

  // Define verification status constants
  const VERIFICATION_STATUS = {
    UNVERIFIED: 1,
    SUBMITTED_FOR_REVIEW: 2,
    APPROVED: 3,
    REJECTED: 4,
  };

  // Redirect if status is not rejected
  useEffect(() => {
    if (user) {
      if (user.profile_verification_status === VERIFICATION_STATUS.APPROVED) {
        navigate("/dashboard");
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

  // Get rejection time (use modified_at if available)
  const rejectionTime = user?.modified_at || new Date().toISOString();
  const rejectionDate = new Date(rejectionTime);

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

  // Handle logout
  const handleSignOff = () => {
    logout();
  };

  // Common reasons for rejection (for educational purposes)
  const commonReasons = [
    "Incomplete or inaccurate personal information",
    "Address verification issues",
    "Insufficient comic collecting history details",
    "Business information could not be validated",
    "Suspicious or unusual activity detected",
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-red-500">
            {/* Card Header */}
            <div className="px-6 py-8 sm:p-10 bg-gradient-to-r from-red-50 to-red-100 flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="h-24 w-24 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center">
                  <ShieldX
                    className="h-12 w-12 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  Verification Rejected
                </h1>
                <p className="mt-2 text-lg text-gray-700">
                  We were unable to verify your profile with the information
                  provided.
                </p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <AlertOctagon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Verification Failed
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-10">
              {/* Rejection Info */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-3">
                  <XCircle
                    className="mr-2 h-5 w-5 text-red-500"
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
                      <p className="text-sm text-gray-500">Rejected on</p>
                      <p className="text-md font-medium text-gray-800">
                        {formatDate(rejectionDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification type</p>
                      <p className="text-md font-medium text-gray-800">
                        {user?.role === 2
                          ? "Business/Retailer"
                          : "Individual Collector"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-md font-medium text-red-600">
                        Verification Rejected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <AlertTriangle
                    className="mr-2 h-5 w-5 text-amber-500"
                    aria-hidden="true"
                  />
                  Common Reasons for Rejection
                </h2>

                <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
                  <p className="text-sm text-gray-700 mb-4">
                    Verification may be rejected for various reasons, including
                    but not limited to:
                  </p>
                  <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
                    {commonReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* What to Do Next */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  What to Do Next
                </h2>

                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FileQuestion
                        className="h-5 w-5 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-md font-medium text-blue-800">
                        Options for Proceeding
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 space-y-3">
                        <p>
                          Unfortunately, your verification attempt was not
                          successful. To proceed:
                        </p>
                        <p>
                          1. You can log out and create a new account with
                          complete and accurate information.
                        </p>
                        <p>
                          2. Contact our support team for more specific details
                          about why your verification was rejected.
                        </p>
                        <p>
                          3. Ensure all your information is accurate, complete,
                          and verifiable if you try again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail
                      className="h-5 w-5 text-purple-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-purple-800">
                      Need Help?
                    </h3>
                    <p className="mt-2 text-sm text-purple-700">
                      If you believe this rejection was made in error or you
                      need more specific information about the rejection reason,
                      please contact our support team.
                    </p>
                    <div className="mt-4">
                      <a
                        href="mailto:support@comiccoin.com"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Contact Support
                        <ArrowRight
                          className="ml-1.5 h-4 w-4"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Off Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSignOff}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <LogOut className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Sign Off
            </button>
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

export default VerificationRejectedPage;
