/**
 * src/api/endpoints/registrationApi.js
 *
 * PURPOSE:
 * This file manages the user registration flow in our application, including:
 * 1. Creating new user accounts
 * 2. Verifying email addresses
 * 3. Resending verification emails
 *
 * It provides a clean interface for our application to interact with the backend API
 * without having to worry about the details of HTTP requests, error handling, etc.
 *
 * DESIGN PATTERN:
 * Each function follows the same pattern:
 * - Make an API request using our custom axiosClient
 * - Handle successful responses by returning the data
 * - Handle errors by formatting them into a consistent structure
 *
 * ERROR HANDLING PHILOSOPHY:
 * We convert all API errors into a consistent format that our UI can easily display.
 * This means transforming technical errors into user-friendly messages and ensuring
 * every error has at least:
 * - A message property (user-friendly description)
 * - A status property (HTTP status code or custom code)
 */

import axios from "axios"; // Import the base axios library for error type checking
import axiosClient, { publicEndpoint } from "../axiosClient"; // Import our custom axios instance

/**
 * Register a new user
 *
 * This function sends user registration data to the server and processes
 * the response. Registration typically requires email, password, and potentially
 * other user information like name, country, etc.
 *
 * @param {Object} data - The user registration information
 * @param {string} data.email - User's email address
 * @param {string} data.password - User's chosen password
 * @param {string} [data.first_name] - User's first name (optional)
 * @param {string} [data.last_name] - User's last name (optional)
 * @param {string} [data.country] - User's country (optional)
 * @param {boolean} [data.agree_promotions] - Marketing consent (optional)
 *
 * @returns {Promise<Object>} Promise that resolves with the registration result
 *                            or rejects with a formatted error object
 *
 * Example usage:
 * try {
 *   const result = await registerUser({
 *     email: 'user@example.com',
 *     password: 'securepassword',
 *     first_name: 'John',
 *     last_name: 'Doe'
 *   });
 *   // Handle successful registration
 * } catch (error) {
 *   // Display error.message to the user
 * }
 */
export const registerUser = async (data) => {
  try {
    // STEP 1: MAKE THE API REQUEST
    // ============================
    // We use axiosClient.post to send a POST request to the server
    // - First argument: The endpoint path ('/register')
    // - Second argument: The data to send (registration information)
    // - Third argument: Configuration options
    //   - publicEndpoint({}) marks this as a public API that doesn't need authentication
    //     (since the user isn't logged in yet)
    const response = await axiosClient.post(
      "/register",
      data, // This contains all the user registration information
      publicEndpoint({}), // This tells axiosClient not to add authentication headers
    );

    // STEP 2: RETURN THE SUCCESSFUL RESPONSE
    // =====================================
    // If we reach this line, it means the request was successful (no errors thrown)
    // We return just the data portion of the response (typically contains user info)
    return response.data;
  } catch (error) {
    // STEP 3: ERROR HANDLING
    // =====================
    // If something went wrong during the request, execution jumps here

    // First, log detailed error information for debugging purposes
    // The emoji makes it easier to find in the console logs
    console.log("📝 Registration error details:", {
      error, // The full error object
      response: error.response?.data, // The response data, if any (optional chaining prevents errors)
      status: error.response?.status, // The HTTP status code, if any
    });

    // STEP 4: FORMAT ERRORS BASED ON TYPE
    // ==================================

    // Check if this is an error generated by axios (network or HTTP error)
    if (axios.isAxiosError(error)) {
      // CASE 1: FIELD VALIDATION ERRORS (400 Bad Request)
      // ------------------------------------------------
      // This handles cases where the server returns specific validation errors
      // for individual fields, e.g., { email: "Email already in use" }
      if (
        error.response?.status === 400 && // Check if it's a 400 Bad Request
        typeof error.response.data === "object" // And the response data is an object
      ) {
        // Throw a formatted error object that includes the field-specific errors
        throw {
          message: error.response.data, // Contains field validation messages
          status: error.response.status, // HTTP status code (400)
        };
      }

      // CASE 2: STANDARD API ERROR RESPONSE
      // ----------------------------------
      // This handles cases where the server returns an error in our expected format
      // Typically: { message: "Error description", errors: {...} }
      else if (error.response?.data) {
        throw {
          // Use the server's error message, or fall back to a generic message
          message: error.response.data.message || "Registration failed",
          // Include any additional error details the server provided
          errors: error.response.data.errors || {},
          status: error.response.status,
        };
      }

      // CASE 3: NETWORK ERRORS
      // ---------------------
      // This handles network issues like no internet connection
      throw {
        message: "Network error. Please check your internet connection.",
        // For network errors, status might be undefined, so default to 0
        status: error.response?.status || 0,
      };
    }

    // CASE 4: UNEXPECTED ERRORS
    // ------------------------
    // This is a catch-all for any other type of error not handled above
    throw {
      message: "An unexpected error occurred during registration.",
      status: 500, // 500 is the HTTP status code for "Internal Server Error"
    };
  }
};

/**
 * Verify a user's email address using a verification code
 *
 * After registration, users typically need to verify their email address
 * by clicking a link or entering a code sent to their email. This function
 * sends that verification code to the server for validation.
 *
 * @param {string} code - The verification code from the email
 * @returns {Promise<Object>} Promise that resolves with the verification result
 *                            or rejects with a formatted error object
 *
 * Example usage:
 * try {
 *   const result = await verifyEmail('abc123def456');
 *   // Email successfully verified
 * } catch (error) {
 *   // Display verification error to user
 * }
 */
export const verifyEmail = async (code) => {
  try {
    // STEP 1: MAKE THE API REQUEST
    // ============================
    // Send the verification code to the server for validation
    const response = await axiosClient.post(
      "/verify-email-code", // The API endpoint for email verification
      { code }, // Send the code in the request body as an object
      publicEndpoint({}), // This is a public endpoint (no auth needed)
    );

    // STEP 2: RETURN SUCCESSFUL RESPONSE
    // =================================
    // If successful, return the response data
    return response.data;
  } catch (error) {
    // STEP 3: ERROR HANDLING
    // =====================

    // Log detailed error information for debugging
    console.log("📧 Email verification error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // STEP 4: FORMAT ERRORS BASED ON TYPE
    // ==================================

    // Check if this is an axios error (network or HTTP error)
    if (axios.isAxiosError(error)) {
      // If we got an actual response from the server
      if (error.response?.data) {
        throw {
          // Use the server's error message or fall back to a generic message
          message: error.response.data.message || "Email verification failed",
          status: error.response.status,
        };
      }

      // Network errors (no response from server)
      throw {
        message: "Network error. Please check your internet connection.",
        status: error.response?.status || 0,
      };
    }

    // Catch-all for unexpected errors
    throw {
      message: "An unexpected error occurred during email verification.",
      status: 500,
    };
  }
};

/**
 * Resend the verification email to a user
 *
 * If a user didn't receive the original verification email or the code expired,
 * this function allows requesting a new verification email to be sent.
 *
 * @param {string} email - User's email address to send verification to
 * @returns {Promise<Object>} Promise that resolves with the result
 *                            or rejects with a formatted error object
 *
 * Example usage:
 * try {
 *   await resendVerificationEmail('user@example.com');
 *   // Show "Email sent" confirmation to user
 * } catch (error) {
 *   // Show error message to user
 * }
 */
export const resendVerificationEmail = async (email) => {
  try {
    // STEP 1: MAKE THE API REQUEST
    // ============================
    // Request a new verification email to be sent
    const response = await axiosClient.post(
      "/resend-verification", // API endpoint for resending verification
      { email }, // Email address to send verification to
      publicEndpoint({}), // This is a public endpoint (no auth needed)
    );

    // STEP 2: RETURN SUCCESSFUL RESPONSE
    // =================================
    return response.data;
  } catch (error) {
    // STEP 3: ERROR HANDLING
    // =====================

    // Log detailed error information for debugging
    console.log("📧 Resend verification error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // STEP 4: FORMAT ERRORS BASED ON TYPE
    // ==================================

    // Check if this is an axios error
    if (axios.isAxiosError(error)) {
      // If we got a response from the server
      if (error.response?.data) {
        throw {
          // Use server message or fallback
          message:
            error.response.data.message ||
            "Failed to resend verification email",
          status: error.response.status,
        };
      }

      // Network errors
      throw {
        message: "Network error. Please check your internet connection.",
        status: error.response?.status || 0,
      };
    }

    // Catch-all for unexpected errors
    throw {
      message: "An unexpected error occurred.",
      status: 500,
    };
  }
};

/**
 * Export all functions as a single object
 *
 * This allows importing the module in two ways:
 * 1. import { registerUser, verifyEmail } from './registrationApi'
 *    (Named imports for specific functions)
 *
 * 2. import registrationApi from './registrationApi'
 *    registrationApi.registerUser()
 *    (Default import for accessing all functions through one object)
 */
export default {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
};
