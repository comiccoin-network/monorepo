// src/api/endpoints/resetPasswordApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Request a password reset email to be sent to the user's email address
 * @param {string} email - The user's email address
 * @returns {Promise} Promise with the request result
 */
export const requestPasswordReset = async (email) => {
  try {
    console.log("🔄 Sending password reset request for email:", email);

    const response = await axiosClient.post(
      "/reset-password",
      { email },
      publicEndpoint({}),
    );

    return response.data;
  } catch (error) {
    console.error("❌ Password reset request error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // If the server returned a response with our standard error format
      if (error.response?.data) {
        throw {
          message:
            error.response.data.message ||
            "Failed to send password reset email",
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
      message: "An unexpected error occurred. Please try again later.",
      status: 500,
    };
  }
};

/**
 * Reset a user's password using the verification code and new password
 * @param {Object} data - Password reset data including code and new password
 * @returns {Promise} Promise with the reset result
 */
export const resetPassword = async (data) => {
  try {
    console.log("🔄 Attempting to reset password with verification code");

    const response = await axiosClient.post(
      "/reset-password",
      data,
      publicEndpoint({}),
    );

    return response.data;
  } catch (error) {
    console.error("❌ Password reset error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // Check for field-specific errors
      if (
        error.response?.status === 400 &&
        typeof error.response.data === "object"
      ) {
        throw {
          message: error.response.data,
          status: error.response.status,
        };
      }
      // Handle standard error format
      else if (error.response?.data) {
        throw {
          message: error.response.data.message || "Failed to reset password",
          status: error.response.status,
        };
      }
      // Network errors
      throw {
        message: "Network error. Please check your internet connection.",
        status: error.response?.status || 0,
      };
    }

    // For any other unexpected errors
    throw {
      message: "An unexpected error occurred. Please try again later.",
      status: 500,
    };
  }
};

export default {
  requestPasswordReset,
  resetPassword,
};
