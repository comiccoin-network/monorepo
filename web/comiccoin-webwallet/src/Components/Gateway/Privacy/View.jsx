// src/Components/Gateway/Privacy/View.jsx
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { Globe, Monitor ,ArrowLeft, Shield, Wallet } from 'lucide-react';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

function PrivacyPage() {

  useEffect(() => {
      let mounted = true;

      if (mounted) {
          window.scrollTo(0, 0);
      }

      return () => {
          mounted = false;
      };
  }, []);

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
              Skip to main content
          </a>

          <NavigationMenu />

          <main id="main-content" className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 max-w-4xl">
              <Link
                  to="/"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 sm:mb-6 text-sm sm:text-base"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
              </Link>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border-2 border-purple-100 p-4 sm:p-6 md:p-8 mb-4 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Who we are</h2>
                          <p className="text-sm sm:text-base text-gray-700">ComicCoin Network by Collectible Protection Services</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Comments</h2>
                          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                              <p>When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection.</p>
                              <p>An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.</p>
                          </div>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Media</h2>
                          <p className="text-sm sm:text-base text-gray-700">If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Cookies</h2>
                          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                              <p>This site is not intended to serve customers outside of Canada. If you leave a comment, review or interaction on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.</p>
                              <p>If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
                              <p>When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.</p>
                              <p>If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.</p>
                          </div>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Embedded content from other websites</h2>
                          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                              <p>Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.</p>
                              <p>These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.</p>
                          </div>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Who we share your data with</h2>
                          <p className="text-sm sm:text-base text-gray-700">If you request a password reset, your IP address will be included in the reset email.</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">How long we retain your data</h2>
                          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
                              <p>If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.</p>
                              <p>For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.</p>
                          </div>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">What rights you have over your data</h2>
                          <p className="text-sm sm:text-base text-gray-700">If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for financial, audit, security, administrative, legal, compliance or security purposes.</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Where we send your data</h2>
                          <p className="text-sm sm:text-base text-gray-700">Visitor comments may be checked through an automated spam detection service.</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Data Breach</h2>
                          <p className="text-sm sm:text-base text-gray-700">We have taken reasonable efforts to protect your data, but data breaches can occur. By using this site, you understand that information about your purchase history and profile, which could include personally identifiable information. By using this site, whether you make a purchase or not, you absolve us of any and all damages. If you have concerns about your personal data and its use, we encourage you to shop at one of our physical locations instead.</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Disputes</h2>
                          <p className="text-sm sm:text-base text-gray-700">You agree that your sole remedy for any disputes with us will be through arbitration, subject to the jurisdiction and laws of the State of Ontario. You also absolve us of any damages, no matter how they may occur. In the event that we are found liable, you agree that the maximum, aggregate, lifetime damages will not exceed $250.00 (two-hundred and fifty U.S. Dollars).</p>
                      </section>

                      <section>
                          <h2 className="text-lg sm:text-xl font-bold text-purple-800 mb-2 sm:mb-3">Additional Questions</h2>
                          <p className="text-sm sm:text-base text-gray-700">If you have any questions or need help ordering, simply email info@cpscapsule.com and we will be glad to assist.</p>
                      </section>
                  </div>
              </div>

              <Link
                  to="/"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm sm:text-base"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
              </Link>
          </main>

          <FooterMenu />
      </div>
  );
}

export default PrivacyPage;
