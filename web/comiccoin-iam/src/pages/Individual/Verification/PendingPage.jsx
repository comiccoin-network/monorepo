// monorepo/web/comiccoin-iam/src/pages/Individual/Verification/PendingPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Hourglass,
  Mail,
  AlertCircle,
  User,
  Home,
  RefreshCw,
  LogOut,
  CheckCircle,
} from "lucide-react";

import Header from "../../../components/IndexPage/Header";
import Footer from "../../../components/IndexPage/Footer";
import { useGetMe } from "../../../hooks/useGetMe";
import { useAuth } from "../../../hooks/useAuth";

const VerificationPendingPage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { user, isLoading, error, refetch } = useGetMe();
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Define verification status constants
  const VERIFICATION_STATUS = {
    UNVERIFIED: 1,
    SUBMITTED_FOR_REVIEW: 2,
    APPROVED: 3,
    REJECTED: 4,
  };

  // Get current verification status
  const verificationStatus =
    user?.profile_verification_status ||
    authUser?.profile_verification_status ||
    VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW;

  // Calculate submission time (use current time if not available)
  const submissionTime = user?.modified_at || new Date().toISOString();
  const submissionDate = new Date(submissionTime);

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

  // Estimate review completion time (2 business days from submission)
  const estimateReviewCompletion = (submissionDate) => {
    const date = new Date(submissionDate);
    let businessDaysToAdd = 2;

    // Skip weekends when adding business days
    while (businessDaysToAdd > 0) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysToAdd -= 1;
      }
    }

    return date;
  };

  const estimatedCompletionDate = estimateReviewCompletion(submissionDate);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setLastRefreshTime(new Date());
    setIsRefreshing(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Redirect if status is not pending
  useEffect(() => {
    if (!isLoading && user) {
      if (user.profile_verification_status === VERIFICATION_STATUS.APPROVED) {
        navigate("/verification/approved");
      } else if (
        user.profile_verification_status === VERIFICATION_STATUS.REJECTED
      ) {
        navigate("/verification/rejected");
      } else if (
        user.profile_verification_status === VERIFICATION_STATUS.UNVERIFIED
      ) {
        navigate("/verification");
      }
    }
  }, [isLoading, user, navigate]);

  // Check estimated time remaining
  const now = new Date();
  const isOverdue = now > estimatedCompletionDate;
  const timeRemaining = estimatedCompletionDate - now;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-yellow-500">
            {/* Card Header */}
            <div className="px-6 py-8 sm:p-10 bg-gradient-to-r from-yellow-50 to-yellow-100 flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="h-24 w-24 rounded-full bg-yellow-100 border-4 border-yellow-200 flex items-center justify-center">
                  <Hourglass
                    className="h-12 w-12 text-yellow-500 animate-pulse"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  Verification In Progress
                </h1>
                <p className="mt-2 text-lg text-gray-700">
                  Your profile is currently being reviewed by our team.
                </p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Pending Review
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-10">
              {/* Submitted Info */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-3">
                  <CheckCircle2
                    className="mr-2 h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                  Submission Received
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Submitted on</p>
                      <p className="text-md font-medium text-gray-800">
                        {formatDate(submissionDate)}
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
                      <p className="text-sm text-gray-500">
                        Status last checked
                      </p>
                      <div className="flex items-center">
                        <p className="text-md font-medium text-gray-800 mr-2">
                          {formatDate(lastRefreshTime)}
                        </p>
                        <button
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="text-purple-600 hover:text-purple-800 focus:outline-none"
                          aria-label="Refresh verification status"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Estimated completion
                      </p>
                      <p
                        className={`text-md font-medium ${isOverdue ? "text-orange-600" : "text-gray-800"}`}
                      >
                        {formatDate(estimatedCompletionDate)}
                        {isOverdue &&
                          " (Processing may take longer than usual)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Verification Progress
                </h2>

                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>

                  {/* Step 1: Submitted */}
                  <div className="relative flex items-start mb-8">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center z-10">
                      <CheckCircle2
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-4 pt-0.5">
                      <h3 className="text-lg font-medium text-gray-900">
                        Verification Submitted
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Your verification information has been received and is
                        in our queue.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: In Review */}
                  <div className="relative flex items-start mb-8">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center z-10">
                      <Clock
                        className="h-6 w-6 text-yellow-600 animate-pulse"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-4 pt-0.5">
                      <h3 className="text-lg font-medium text-gray-900">
                        Review In Progress
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Our team is reviewing your verification details. This
                        typically takes 1-2 business days.
                      </p>
                      {!isOverdue && hoursRemaining > 0 && (
                        <p className="mt-1 text-sm font-medium text-purple-600">
                          Approximately {hoursRemaining} hours remaining
                        </p>
                      )}
                      {isOverdue && (
                        <p className="mt-1 text-sm font-medium text-orange-600">
                          Review is taking longer than usual. Please be patient.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Completed - Now with proper icon */}
                  <div className="relative flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center z-10">
                      <CheckCircle
                        className="h-6 w-6 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-4 pt-0.5">
                      <h3 className="text-lg font-medium text-gray-500">
                        Verification Complete
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You'll be notified when your verification is approved or
                        if we need additional information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Expect */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  What to Expect
                </h2>

                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <HelpCircle
                        className="h-5 w-5 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-md font-medium text-blue-800">
                        During Review
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 space-y-1">
                        <p>
                          Our team reviews all submissions thoroughly to
                          maintain security standards.
                        </p>
                        <p>
                          You'll receive an email notification once your
                          verification is approved.
                        </p>
                        <p>
                          If additional information is needed, we'll contact you
                          via email.
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
                      If your verification is taking longer than expected or you
                      have questions, please contact our support team.
                    </p>
                    <div className="mt-4">
                      <Link
                        to="/help"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button (replacing "Back to Dashboard") */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <LogOut className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Log out
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

export default VerificationPendingPage;
