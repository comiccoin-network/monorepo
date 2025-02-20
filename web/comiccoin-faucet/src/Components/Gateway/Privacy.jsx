import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function Privacy() {
  return (
    <>
      <div class="container">
        <section class="section">
          <Link to="/" aria-current="page">
            <FontAwesomeIcon className="fas" icon={faArrowLeft} />
            &nbsp;Back to Home
          </Link>
          <div class="content">
            <h1 class="title is-1">Privacy Policy</h1>
            <h3 class="title is-3">Who we are</h3>
            <p>Collectible Protection Services - COMICCOIN_FAUCET</p>
            <h3 class="title is-3">Comments</h3>
            <p>
              When visitors leave comments on the site we collect the data shown
              in the comments form, and also the visitor’s IP address and
              browser user agent string to help spam detection.
            </p>
            <p>
              An anonymized string created from your email address (also called
              a hash) may be provided to the Gravatar service to see if you are
              using it. The Gravatar service privacy policy is available here:
              https://automattic.com/privacy/. After approval of your comment,
              your profile picture is visible to the public in the context of
              your comment.
            </p>
            <h3 class="title is-3">Media</h3>
            <p>
              If you upload images to the website, you should avoid uploading
              images with embedded location data (EXIF GPS) included. Visitors
              to the website can download and extract any location data from
              images on the website.
            </p>
            <h3 class="title is-3">Cookies</h3>
            <p>
              This site is not intended to serve customers outside of Canada. If
              you leave a comment, review or interaction on our site you may
              opt-in to saving your name, email address and website in cookies.
              These are for your convenience so that you do not have to fill in
              your details again when you leave another comment. These cookies
              will last for one year.
            </p>
            <p>
              If you visit our login page, we will set a temporary cookie to
              determine if your browser accepts cookies. This cookie contains no
              personal data and is discarded when you close your browser.
            </p>
            <p>
              When you log in, we will also set up several cookies to save your
              login information and your screen display choices. Login cookies
              last for two days, and screen options cookies last for a year. If
              you select “Remember Me”, your login will persist for two weeks.
              If you log out of your account, the login cookies will be removed.
            </p>
            <p>
              If you edit or publish an article, an additional cookie will be
              saved in your browser. This cookie includes no personal data and
              simply indicates the post ID of the article you just edited. It
              expires after 1 day.
            </p>
            <h3 class="title is-3">Embedded content from other websites</h3>
            <p>
              Articles on this site may include embedded content (e.g. videos,
              images, articles, etc.). Embedded content from other websites
              behaves in the exact same way as if the visitor has visited the
              other website.
            </p>
            <p>
              These websites may collect data about you, use cookies, embed
              additional third-party tracking, and monitor your interaction with
              that embedded content, including tracking your interaction with
              the embedded content if you have an account and are logged in to
              that website.
            </p>
            <h3 class="title is-3">Who we share your data with</h3>
            <p>
              If you request a password reset, your IP address will be included
              in the reset email.
            </p>
            <h3 class="title is-3">How long we retain your data</h3>
            <p>
              If you leave a comment, the comment and its metadata are retained
              indefinitely. This is so we can recognize and approve any
              follow-up comments automatically instead of holding them in a
              moderation queue.
            </p>
            <p>
              For users that register on our website (if any), we also store the
              personal information they provide in their user profile. All users
              can see, edit, or delete their personal information at any time
              (except they cannot change their username). Website administrators
              can also see and edit that information.
            </p>
            <h3 class="title is-3">What rights you have over your data</h3>
            <p>
              If you have an account on this site, or have left comments, you
              can request to receive an exported file of the personal data we
              hold about you, including any data you have provided to us. You
              can also request that we erase any personal data we hold about
              you. This does not include any data we are obliged to keep for
              financial, audit, security, administrative, legal, compliance or
              security purposes.
            </p>
            <h3 class="title is-3">Where we send your data</h3>
            <p>
              Visitor comments may be checked through an automated spam
              detection service.
            </p>
            <h3 class="title is-3">Data Breach</h3>
            <p>
              We have taken reasonable efforts to protect your data, but data
              breaches can occur. By using this site, you understand that
              information about your purchase history and profile, which could
              include personally identifiable information. By using this site,
              whether you make a purchase or not, you absolve us of any and all
              damages. If you have concerns about your personal data and its
              use, we encourage you to shop at one of our physical locations
              instead.{" "}
            </p>
            <h3 class="title is-3">Disputes</h3>
            <p>
              You agree that your sole remedy for any disputes with us will be
              through arbitration, subject to the jurisdiction and laws of the
              State of Ontario. You also absolve us of any damages, no matter
              how they may occur. In the event that we are found liable, you
              agree that the maximum, aggregate, lifetime damages will not
              exceed $250.00 (two-hundred and fifty U.S. Dollars).
            </p>
            <h3 class="title is-3">Additional Questions</h3>
            <p>
              If you have any questions or need help ordering, simply email
              info@cpscapsule.com and we will be glad to assist.
            </p>
          </div>
          <Link to="/" aria-current="page">
            <FontAwesomeIcon className="fas" icon={faArrowLeft} />
            &nbsp;Back to Home
          </Link>
        </section>
      </div>
    </>
  );
}

export default Privacy;
