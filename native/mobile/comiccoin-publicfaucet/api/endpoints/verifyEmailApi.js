/**
 * api/endpoints/verifyEmailApi.js
 *
 * PURPOSE:
 * This file handles email verification in our application. Email verification is a critical
 * security step that confirms users own the email addresses they registered with.
 *
 * WHY EMAIL VERIFICATION MATTERS:
 * 1. Security: Prevents someone from registering with someone else's email
 * 2. Anti-spam: Reduces fake accounts created by bots
 * 3. Communication: Ensures we can reliably reach users at their email address
 *
 * HOW IT WORKS:
 * 1. When a user registers, they receive an email with a verification code
 * 2. The user enters that code in the app
 * 3. We send the code to our server to verify it's correct
 * 4. If verified, the user's account is marked as having a confirmed email
 *
 * This file provides two main functions:
 * - verifyEmailWithCode: Checks if a verification code is valid
 * - resendVerificationCode: Requests a new code if the original wasn't received
 */

import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Verify a user's email address with a verification code
 *
 * This function sends the user's email and verification code to the server
 * to confirm that the user owns the email address they registered with.
 *
 * Think of this like the post office confirming your address. The server
 * sent a secret code to your email "mailbox," and now you're proving you
 * received it by sending that code back to the server.
 *
 * @param {string} email - The user's email address being verified
 * @param {string} code - The verification code the user received in their email
 *
 * @returns {Promise} - A promise that resolves to the verification result
 *                      or rejects with an error if verification fails
 *
 * Example usage:
 * try {
 *   const result = await verifyEmailWithCode('user@example.com', '123456');
 *   // Email verified successfully
 * } catch (error) {
 *   // Show error message to the user
 * }
 */
export const verifyEmailWithCode = async (email, code) => {
  try {
    // STEP 1: SEND THE VERIFICATION REQUEST
    // =====================================

    // Make a POST request to the verification endpoint
    // This is like submitting a form with your email and the code you received
    const response = await axiosClient.post(
      "/verify-email-code", // The API endpoint (URL path) we're sending to
      { email, code }, // The data we're sending (as a JavaScript object)
      publicEndpoint({}), // Mark this as a public endpoint (no auth needed)
    );

    // STEP 2: RETURN THE SUCCESSFUL RESPONSE
    // =====================================

    // If we get here, it means the verification was successful
    // The server typically responds with user data or a success message
    return response.data;
  } catch (error) {
    // STEP 3: HANDLE ANY ERRORS
    // ========================

    // If something went wrong, we'll end up here

    // First, log detailed error information to help with debugging
    // The 📧 emoji makes it easy to find this in the console
    console.log("📧 Email verification error:", {
      error, // The complete error object
      response: error.response?.data, // Any data the server sent back (if available)
      status: error.response?.status, // The HTTP status code (if available)
    });

    // STEP 4: FORMAT ERROR FOR THE UI
    // ==============================

    // Now we create a simplified error object that our UI can easily use
    // This is important because raw error objects can be complex and inconsistent

    throw {
      // Use the server's error message if available, otherwise use a generic message
      message: error.response?.data?.message || "Email verification failed",

      // Include the HTTP status code if available, or default to 500 (server error)
      status: error.response?.status || 500,
    };
  }
};

/**
 * Request a new verification code to be sent to the user's email
 *
 * This function is used when a user didn't receive the original verification
 * email or if the code expired before they could use it.
 *
 * It's like asking the post office to resend a delivery confirmation letter
 * because you never received the first one.
 *
 * @param {string} email - The user's email address to send the new code to
 *
 * @returns {Promise} - A promise that resolves with the API response
 *                      or rejects with an error
 *
 * Example usage:
 * try {
 *   await resendVerificationCode('user@example.com');
 *   // Show "New code sent" message to user
 * } catch (error) {
 *   // Show error message to user
 * }
 */
export const resendVerificationCode = async (email) => {
  try {
    // STEP 1: SEND THE RESEND REQUEST
    // ===============================

    // Make a POST request to the resend verification endpoint
    const response = await axiosClient.post(
      "/resend-verification-code", // The API endpoint for resending codes
      { email }, // We only need to provide the email address
      publicEndpoint({}), // Mark as a public endpoint (no auth needed)
    );

    // STEP 2: RETURN THE SUCCESSFUL RESPONSE
    // =====================================

    // If successful, return the response data
    // This might include a message like "Verification email sent"
    return response.data;
  } catch (error) {
    // STEP 3: BASIC ERROR HANDLING
    // ===========================

    // Log the error for debugging purposes
    console.log("📧 Resend code error:", error);

    // Note: This function has simpler error handling than verifyEmailWithCode
    // It just passes the original error up without formatting it
    // In a more consistent API, we might want to format this error too

    throw error; // Pass the error up to the caller
  }
};

// Note: Unlike some other API files, this one doesn't export a default object
// This means you would import these functions individually like:
// import { verifyEmailWithCode, resendVerificationCode } from './verifyEmailApi';
