// monorepo/web/comiccoin-iam/src/pages/PrivacyPage.jsx
import React from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";
import UserFooter from "../../components/UserFooter";
import UserTopNavigation from "../../components/UserTopNavigation";

function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Parse the referrer from the query parameters
  const queryParams = new URLSearchParams(location.search);
  const referrer = queryParams.get("referrer") || "/";

  // Determine if we should show the top navigation
  // We'll show it if the referrer is a protected route like dashboard
  const isFromProtectedRoute =
    referrer.includes("/dashboard") ||
    referrer.includes("/settings") ||
    referrer.includes("/claim-coins") ||
    referrer.includes("/transactions");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Only show TopNavigation if coming from a protected route */}
      {isFromProtectedRoute && <UserTopNavigation />}

      <main
        id="main-content"
        className="container mx-auto px-4 py-4 max-w-5xl flex-grow"
      >
        <header className="mb-6 md:mb-8">
          <div className="flex items-center">
            <Link
              to={referrer}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label={`Back to ${referrer === "/" ? "Home" : "Previous Page"}`}
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                How we handle your data
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-xl p-8 shadow-md mb-8">
          <div className="flex items-center gap-3 mb-8 text-purple-700">
            <Shield className="h-8 w-8" />
            <h2 className="text-2xl font-bold">
              ComicCoin Network Privacy Policy
            </h2>
          </div>

          <div className="prose prose-purple max-w-none">
            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Who we are
            </h2>
            <p className="text-gray-700 mb-6">
              ComicCoin Network - ComicCoin Digital Identity
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Comments
            </h2>
            <p className="text-gray-700 mb-4">
              When visitors leave comments on the site we collect the data shown
              in the comments form, and also the visitor's IP address and
              browser user agent string to help spam detection.
            </p>
            <p className="text-gray-700 mb-6">
              An anonymized string created from your email address (also called
              a hash) may be provided to the Gravatar service to see if you are
              using it. The Gravatar service privacy policy is available here:
              https://automattic.com/privacy/. After approval of your comment,
              your profile picture is visible to the public in the context of
              your comment.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Media
            </h2>
            <p className="text-gray-700 mb-6">
              If you upload images to the website, you should avoid uploading
              images with embedded location data (EXIF GPS) included. Visitors
              to the website can download and extract any location data from
              images on the website.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              This site is not intended to serve customers outside of Canada. If
              you leave a comment, review or interaction on our site you may
              opt-in to saving your name, email address and website in cookies.
              These are for your convenience so that you do not have to fill in
              your details again when you leave another comment. These cookies
              will last for one year.
            </p>
            <p className="text-gray-700 mb-4">
              If you visit our login page, we will set a temporary cookie to
              determine if your browser accepts cookies. This cookie contains no
              personal data and is discarded when you close your browser.
            </p>
            <p className="text-gray-700 mb-4">
              When you log in, we will also set up several cookies to save your
              login information and your screen display choices. Login cookies
              last for two days, and screen options cookies last for a year. If
              you select "Remember Me", your login will persist for two weeks.
              If you log out of your account, the login cookies will be removed.
            </p>
            <p className="text-gray-700 mb-6">
              If you edit or publish an article, an additional cookie will be
              saved in your browser. This cookie includes no personal data and
              simply indicates the post ID of the article you just edited. It
              expires after 1 day.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Embedded content from other websites
            </h2>
            <p className="text-gray-700 mb-4">
              Articles on this site may include embedded content (e.g. videos,
              images, articles, etc.). Embedded content from other websites
              behaves in the exact same way as if the visitor has visited the
              other website.
            </p>
            <p className="text-gray-700 mb-6">
              These websites may collect data about you, use cookies, embed
              additional third-party tracking, and monitor your interaction with
              that embedded content, including tracking your interaction with
              the embedded content if you have an account and are logged in to
              that website.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Who we share your data with
            </h2>
            <p className="text-gray-700 mb-6">
              If you request a password reset, your IP address will be included
              in the reset email.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              How long we retain your data
            </h2>
            <p className="text-gray-700 mb-4">
              If you leave a comment, the comment and its metadata are retained
              indefinitely. This is so we can recognize and approve any
              follow-up comments automatically instead of holding them in a
              moderation queue.
            </p>
            <p className="text-gray-700 mb-6">
              For users that register on our website (if any), we also store the
              personal information they provide in their user profile. All users
              can see, edit, or delete their personal information at any time
              (except they cannot change their username). Website administrators
              can also see and edit that information.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              What rights you have over your data
            </h2>
            <p className="text-gray-700 mb-6">
              If you have an account on this site, or have left comments, you
              can request to receive an exported file of the personal data we
              hold about you, including any data you have provided to us. You
              can also request that we erase any personal data we hold about
              you. This does not include any data we are obliged to keep for
              financial, audit, security, administrative, legal, compliance or
              security purposes.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Where we send your data
            </h2>
            <p className="text-gray-700 mb-6">
              Visitor comments may be checked through an automated spam
              detection service.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Data Breach
            </h2>
            <p className="text-gray-700 mb-6">
              We have taken reasonable efforts to protect your data, but data
              breaches can occur. By using this site, you understand that
              information about your purchase history and profile, which could
              include personally identifiable information. By using this site,
              whether you make a purchase or not, you absolve us of any and all
              damages. If you have concerns about your personal data and its
              use, we encourage you to use our services offline instead.
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Disputes
            </h2>
            <p className="text-gray-700 mb-6">
              You agree that your sole remedy for any disputes with us will be
              through arbitration, subject to the jurisdiction and laws of the
              State of Ontario. You also absolve us of any damages, no matter
              how they may occur. In the event that we are found liable, you
              agree that the maximum, aggregate, lifetime damages will not
              exceed $250.00 (two-hundred and fifty U.S. Dollars).
            </p>

            <h2 className="text-2xl font-bold text-purple-800 mt-8 mb-4">
              Additional Questions
            </h2>
            <p className="text-gray-700 mb-6">
              If you have any questions or need help, simply email
              hello@comiccoin.ca and we will be glad to assist.
            </p>
          </div>
        </div>

        <div className="text-center mb-8">
          <Link
            to={referrer}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {referrer === "/" ? "Return to Home" : "Go Back"}
          </Link>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}

export default PrivacyPage;
