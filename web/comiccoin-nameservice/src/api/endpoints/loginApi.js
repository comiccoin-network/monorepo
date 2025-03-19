// src/api/endpoints/loginApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Authenticate user with email and password
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise} Promise with login result
 */
export const loginUser = async (credentials) => {
  try {
    console.log("🔑 API: Attempting login with email:", credentials.email);

    // Using the publicEndpoint configuration since login doesn't require auth
    const response = await axiosClient.post(
      "/login",
      credentials,
      publicEndpoint({}),
    );

    console.log("✅ API: Login successful");
    return response.data;
  } catch (error) {
    console.error("❌ API: Login error:", {
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
        // Throw the entire response data object
        // This preserves the field-specific errors that the form expects
        throw {
          fieldErrors: error.response.data, // Keep field errors separately
          message: "Login failed, please check your credentials",
          status: error.response.status,
        };
      }
      // If the server returned a response with a general error message
      else if (error.response?.data) {
        throw {
          message: error.response.data.message || "Login failed",
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
      message: "An unexpected error occurred during login.",
      status: 500,
    };
  }
};

export default {
  loginUser,
};
