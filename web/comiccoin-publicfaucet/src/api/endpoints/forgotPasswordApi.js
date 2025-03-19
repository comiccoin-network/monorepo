// src/api/endpoints/forgotPasswordApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Request a password reset email for a user
 * @param {Object} data - Object containing the user's email
 * @returns {Promise} Promise with the result of the password reset request
 */
export const requestPasswordReset = async (data) => {
  try {
    console.log("📧 API: Sending password reset request for:", data.email);

    // Using the publicEndpoint configuration since password reset doesn't require auth
    const response = await axiosClient.post(
      "/forgot-password",
      data,
      publicEndpoint({}),
    );

    console.log("✅ API: Password reset email sent successfully");
    return response.data;
  } catch (error) {
    console.error("❌ API: Password reset request error:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // If the server returned field-specific errors (400 status)
      if (
        error.response?.status === 400 &&
        typeof error.response.data === "object"
      ) {
        // Check if the error is in the format we expect (field-specific errors)
        if (error.response.data.email) {
          throw {
            fieldErrors: error.response.data,
            message: error.response.data.email || "Failed to send reset email",
            status: error.response.status,
          };
        } else {
          // Otherwise, use the whole object as the general error
          throw {
            message:
              JSON.stringify(error.response.data) ||
              "Failed to send reset email",
            status: error.response.status,
          };
        }
      }
      // If the server returned a response with a general error message
      else if (error.response?.data) {
        let errorMessage = "Failed to send password reset email";

        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        throw {
          message: errorMessage,
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
      message:
        "An unexpected error occurred while requesting a password reset.",
      status: 500,
    };
  }
};

export default {
  requestPasswordReset,
};
