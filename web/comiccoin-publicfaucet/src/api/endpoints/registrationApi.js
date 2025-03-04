// src/api/endpoints/registrationApi.js
import axios from "axios";
import axiosClient, { publicEndpoint } from "../axiosClient";

/**
 * Register a new customer
 * @param {Object} data Registration data
 * @returns {Promise} Promise with registration result
 */
export const registerCustomer = async (data) => {
  try {
    const response = await axiosClient.post(
      "/publicfaucet/api/v1/register",
      data,
      publicEndpoint({}),
    );
    return response.data;
  } catch (error) {
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

export default {
  registerCustomer,
};
