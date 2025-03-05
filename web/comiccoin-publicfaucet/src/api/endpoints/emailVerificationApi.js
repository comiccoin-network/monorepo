// src/api/endpoints/emailVerificationApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Verify an email address using a verification code
 * @param {string} verificationCode - The verification code from the email
 * @returns {Promise} Promise with the verification result
 */
export const verifyEmail = async (verificationCode) => {
  try {
    console.log(
      "🔄 Starting email verification process with code:",
      verificationCode,
    );

    // Using the path relative to API_BASE_URL from axiosClient
    const response = await axiosClient.post(
      "/verify",
      { code: verificationCode },
      publicEndpoint({}),
    );

    console.log("✅ Email verification successful");
    return response.data;
  } catch (error) {
    console.error("❌ Email verification error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // If the server returned a response with our standard error format
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Verification failed",
          status: error.response.status,
        };
      }

      // Network errors or other axios errors
      throw {
        message: "Network error. Please check your internet connection.",
        status: error.response?.status || 0,
      };
    }

    // For any other unexpected errors
    throw {
      message: "An unexpected error occurred during verification.",
      status: 500,
    };
  }
};

export default {
  verifyEmail,
};
