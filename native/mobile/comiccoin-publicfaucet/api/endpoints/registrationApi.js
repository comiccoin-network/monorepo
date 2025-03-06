// src/api/endpoints/registrationApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Register a new user
 * @param {Object} data Registration data
 * @returns {Promise} Promise with registration result
 */
export const registerUser = async (data) => {
  try {
    // Using the full path from axiosClient base URL
    const response = await axiosClient.post(
      "/register",
      data,
      publicEndpoint({})
    );
    return response.data;
  } catch (error) {
    console.log("📝 Registration error details:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // If we have a 400 error with field-specific errors in the format { field: "message" }
      if (
        error.response?.status === 400 &&
        typeof error.response.data === "object"
      ) {
        throw {
          message: error.response.data,
          status: error.response.status,
        };
      }

      // If the server returned a response with our standard error format
      else if (error.response?.data) {
        throw {
          message: error.response.data.message || "Registration failed",
          errors: error.response.data.errors || {},
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
      message: "An unexpected error occurred during registration.",
      status: 500,
    };
  }
};

/**
 * Verify email address
 * @param {string} token Verification token
 * @returns {Promise} Promise with verification result
 */
export const verifyEmail = async (token) => {
  try {
    const response = await axiosClient.post(
      "/verify-email",
      { token },
      publicEndpoint({})
    );
    return response.data;
  } catch (error) {
    console.log("📧 Email verification error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Email verification failed",
          status: error.response.status,
        };
      }

      throw {
        message: "Network error. Please check your internet connection.",
        status: error.response?.status || 0,
      };
    }

    throw {
      message: "An unexpected error occurred during email verification.",
      status: 500,
    };
  }
};

/**
 * Resend verification email
 * @param {string} email User's email address
 * @returns {Promise} Promise with result
 */
export const resendVerificationEmail = async (email) => {
  try {
    const response = await axiosClient.post(
      "/resend-verification",
      { email },
      publicEndpoint({})
    );
    return response.data;
  } catch (error) {
    console.log("📧 Resend verification error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Failed to resend verification email",
          status: error.response.status,
        };
      }

      throw {
        message: "Network error. Please check your internet connection.",
        status: error.response?.status || 0,
      };
    }

    throw {
      message: "An unexpected error occurred.",
      status: 500,
    };
  }
};

export default {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
};
