// src/api/endpoints/userApi.js
import { usePrivateQuery, usePrivateMutation } from "../../hooks/useApi";
import axiosClient from "../axiosClient";

// STATUS CONSTANTS
export const USER_STATUS = {
  ACTIVE: 1,
  LOCKED: 50,
  ARCHIVED: 100,
};

// ROLE CONSTANTS
export const USER_ROLE = {
  ROOT: 1,
  COMPANY: 2,
  INDIVIDUAL: 3,
};

// PROFILE VERIFICATION STATUS CONSTANTS
export const PROFILE_VERIFICATION_STATUS = {
  UNVERIFIED: 1,
  SUBMITTED_FOR_REVIEW: 2,
  APPROVED: 3,
  REJECTED: 4,
};

/**
 * Fetch a user by ID
 */
export const getUserById = async (id) => {
  const response = await axiosClient.get(`/users/${id}`);
  return response.data;
};

/**
 * Fetch a user by email
 */
export const getUserByEmail = async (email) => {
  const response = await axiosClient.get(`/users/${email}`);
  return response.data;
};

/**
 * Custom hook for listing users with filtering
 */
export const useListUsers = (filters = {}, options = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page);
  if (filters.pageSize) queryParams.append("page_size", filters.pageSize);
  if (filters.searchTerm) queryParams.append("search", filters.searchTerm);
  if (filters.role) queryParams.append("role", filters.role);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.profileVerificationStatus)
    queryParams.append(
      "profile_verification_status",
      filters.profileVerificationStatus,
    );
  if (filters.sortBy) queryParams.append("sort_by", filters.sortBy);
  if (filters.sortOrder) queryParams.append("sort_order", filters.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ""}`;

  return usePrivateQuery(["users", filters], endpoint, options);
};

/**
 * Custom hook for creating a user
 */
export const useCreateUser = (options = {}) => {
  return usePrivateMutation("/users", "post", {
    invalidateQueries: ["users"],
    ...options,
  });
};

/**
 * Custom hook for updating a user
 */
export const useUpdateUser = (id, options = {}) => {
  if (!id) {
    throw new Error("ID is required for updating a user");
  }

  const endpoint = `/users/${id}`;
  return usePrivateMutation(endpoint, "put", {
    invalidateQueries: [["user", id], "users"],
    ...options,
  });
};

/**
 * Custom hook for deleting a user
 */
export const useDeleteUser = (id, options = {}) => {
  if (!id) {
    throw new Error("ID is required for deleting a user");
  }

  const endpoint = `/users/${id}`;
  return usePrivateMutation(endpoint, "delete", {
    invalidateQueries: ["users"],
    ...options,
  });
};

/**
 * Transform a User from API format to frontend format
 */
export function transformUser(user) {
  if (!user) return null;

  return {
    // Core fields from Go struct
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    name: user.name,
    lexicalName: user.lexical_name,
    role: user.role,
    phone: user.phone,
    country: user.country,
    timezone: user.timezone,
    region: user.region,
    city: user.city,
    postalCode: user.postal_code,
    addressLine1: user.address_line1,
    addressLine2: user.address_line2,
    walletAddress: user.wallet_address,
    wasEmailVerified: user.was_email_verified,
    profileVerificationStatus: user.profile_verification_status,
    websiteURL: user.website_url,
    description: user.description,
    comicBookStoreName: user.comic_book_store_name,
    createdAt: user.created_at,
    modifiedAt: user.modified_at,
    status: user.status,
    chainId: user.chain_id,
    agreeTermsOfService: user.agree_terms_of_service,
    agreePromotions: user.agree_promotions,
    agreeToTrackingAcrossThirdPartyAppsAndServices:
      user.agree_to_tracking_across_third_party_apps_and_services,

    // Helper methods
    get fullName() {
      return this.firstName && this.lastName
        ? `${this.firstName} ${this.lastName}`
        : this.name || this.email;
    },

    get isActive() {
      return this.status === USER_STATUS.ACTIVE;
    },

    get isLocked() {
      return this.status === USER_STATUS.LOCKED;
    },

    get isArchived() {
      return this.status === USER_STATUS.ARCHIVED;
    },

    get isRoot() {
      return this.role === USER_ROLE.ROOT;
    },

    get isCompany() {
      return this.role === USER_ROLE.COMPANY;
    },

    get isIndividual() {
      return this.role === USER_ROLE.INDIVIDUAL;
    },

    get isVerified() {
      return (
        this.profileVerificationStatus === PROFILE_VERIFICATION_STATUS.APPROVED
      );
    },

    get formattedWalletAddress() {
      if (!this.walletAddress) return "";
      const address = String(this.walletAddress);
      if (address.length <= 10) return address;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    getRoleLabel() {
      switch (this.role) {
        case USER_ROLE.ROOT:
          return "Administrator";
        case USER_ROLE.COMPANY:
          return "Business/Retailer";
        case USER_ROLE.INDIVIDUAL:
          return "Individual";
        default:
          return "Unknown";
      }
    },

    getStatusLabel() {
      switch (this.status) {
        case USER_STATUS.ACTIVE:
          return "Active";
        case USER_STATUS.LOCKED:
          return "Locked";
        case USER_STATUS.ARCHIVED:
          return "Archived";
        default:
          return "Unknown";
      }
    },

    getVerificationStatusLabel() {
      switch (this.profileVerificationStatus) {
        case PROFILE_VERIFICATION_STATUS.UNVERIFIED:
          return "Unverified";
        case PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
          return "Under Review";
        case PROFILE_VERIFICATION_STATUS.APPROVED:
          return "Verified";
        case PROFILE_VERIFICATION_STATUS.REJECTED:
          return "Rejected";
        default:
          return "Unknown";
      }
    },
  };
}

/**
 * Prepare user data for API submission
 */
export function prepareUserForApi(user) {
  return {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    password: user.password, // Only included for create/update operations
    role: user.role,
    phone: user.phone,
    country: user.country,
    timezone: user.timezone,
    region: user.region,
    city: user.city,
    postal_code: user.postalCode,
    address_line1: user.addressLine1,
    address_line2: user.addressLine2,
    wallet_address: user.walletAddress,
    is_email_verified: user.wasEmailVerified,
    profile_verification_status: user.profileVerificationStatus,
    website_url: user.websiteURL,
    description: user.description,
    comic_book_store_name: user.comicBookStoreName,
    status: user.status,
    agree_promotions: user.agreePromotions,
    agree_to_tracking_across_third_party_apps_and_services:
      user.agreeToTrackingAcrossThirdPartyAppsAndServices,
  };
}

export default {
  getUserById,
  getUserByEmail,
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  transformUser,
  prepareUserForApi,
  USER_STATUS,
  USER_ROLE,
  PROFILE_VERIFICATION_STATUS,
};
