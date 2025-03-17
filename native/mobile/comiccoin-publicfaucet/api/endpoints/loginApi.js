// api/endpoints/loginApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";
import { handle524Error } from "../../utils/networkDiagnostics";

/**
 * Login a user with email and password
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Promise with login result containing user data and tokens
 */
export const loginUser = async (credentials) => {
  try {
    const response = await axiosClient.post(
      "/login",
      credentials,
      publicEndpoint({}),
    );
    return response.data;
  } catch (error) {
    console.log("🔒 Login error details:", {
      error,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle 524 Cloudflare timeout errors specially
    if (error.response?.status === 524) {
      // Run network diagnostics to help debug the issue
      await handle524Error();

      throw {
        message:
          "Server is taking too long to respond. This might happen when checking passwords. Please try again later.",
        status: 524,
      };
    }

    // Handle HTML error responses (which aren't proper JSON)
    if (
      error.response?.data &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE html>")
    ) {
      throw {
        message:
          "Server returned an unexpected response format. Please try again later.",
        status: error.response?.status || 500,
      };
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      // If we have field-specific errors as an object
      if (
        error.response?.status === 400 &&
        typeof error.response.data === "object" &&
        !Array.isArray(error.response.data)
      ) {
        const fieldErrors = {};
        let errorMessage = "Login failed. Please check your credentials.";

        // Extract field messages - ensuring they're all strings
        Object.entries(error.response.data).forEach(([field, message]) => {
          fieldErrors[field] =
            typeof message === "string" ? message : JSON.stringify(message);

          // Use field error as general message if available
          if (field === "email" || field === "password") {
            errorMessage = fieldErrors[field];
          }
        });

        throw {
          message: errorMessage,
          fieldErrors: fieldErrors,
          status: error.response.status,
        };
      }
      // Network errors or other axios errors
      throw {
        message:
          error.response?.data?.message ||
          "Connection error. Please check your internet and try again.",
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
