// api/endpoints/verifyEmailApi.js
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Verify email with code
 * @param {string} email User's email address
 * @param {string} code Verification code
 * @returns {Promise} Promise with verification result
 */
export const verifyEmailWithCode = async (email, code) => {
  try {
    const response = await axiosClient.post(
      "/verify-email-code",
      { email, code },
      publicEndpoint({})
    );
    return response.data;
  } catch (error) {
    console.log("📧 Email verification error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Format and throw error for consistent handling
    throw {
      message: error.response?.data?.message || "Email verification failed",
      status: error.response?.status || 500,
    };
  }
};

/**
 * Resend verification code
 * @param {string} email User's email address
 * @returns {Promise} Promise with result
 */
export const resendVerificationCode = async (email) => {
  try {
    const response = await axiosClient.post(
      "/resend-verification-code",
      { email },
      publicEndpoint({})
    );
    return response.data;
  } catch (error) {
    console.log("📧 Resend code error:", error);
    throw error;
  }
};
