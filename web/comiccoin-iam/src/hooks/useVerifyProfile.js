// src/hooks/useVerifyProfile.js
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useVerifyProfile as useVerifyProfileAPI } from "../api/endpoints/verifyProfileApi";
import { toast } from "react-toastify";

// Define User Role constants to match backend Go code
export const USER_ROLE = {
  ROOT: 1, // Root user, has all permissions
  RETAILER: 2, // Retailer
  CUSTOMER: 3, // Customer/Individual
};

/**
 * Custom hook for handling profile verification
 * Wraps the API hook with navigation and user feedback handling
 *
 * @returns {Object} Hook methods and state
 */
export function useVerifyProfile() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Use the API hook
  const {
    verifyProfile,
    isLoading,
    error,
    success,
    reset: resetAPI,
  } = useVerifyProfileAPI({
    onSuccess: () => {
      // Show success toast
      toast.success("Profile verification submitted successfully");

      // Navigate to pending page on success
      navigate("/verification/pending");
    },
    onError: (err) => {
      // Show error toast
      toast.error(err.message || "Failed to submit verification");
    },
  });

  /**
   * Transform backend error keys from snake_case to camelCase
   * This maps backend field names to frontend form field names
   *
   * @param {Object} errors - Backend error object with snake_case keys
   * @returns {Object} Errors with camelCase keys that match form field names
   */
  const transformErrorKeys = (errors) => {
    if (!errors || typeof errors !== "object") return {};

    const transformed = {};

    // Map of backend field names to frontend field names
    const fieldMapping = {
      address_line1: "addressLine1",
      address_line2: "addressLine2",
      postal_code: "postalCode",
      has_shipping_address: "hasShippingAddress",
      shipping_name: "shippingName",
      shipping_phone: "shippingPhone",
      shipping_country: "shippingCountry",
      shipping_region: "shippingRegion",
      shipping_city: "shippingCity",
      shipping_postal_code: "shippingPostalCode",
      shipping_address_line1: "shippingAddressLine1",
      shipping_address_line2: "shippingAddressLine2",
      how_did_you_hear_about_us: "howDidYouHearAboutUs",
      how_did_you_hear_about_us_other: "howDidYouHearAboutUsOther",
      how_long_collecting_comic_books_for_grading:
        "howLongCollectingComicBooksForGrading",
      has_previously_submitted_comic_book_for_grading:
        "hasPreviouslySubmittedComicBookForGrading",
      has_owned_graded_comic_books: "hasOwnedGradedComicBooks",
      has_regular_comic_book_shop: "hasRegularComicBookShop",
      has_previously_purchased_from_auction_site:
        "hasPreviouslyPurchasedFromAuctionSite",
      has_previously_purchased_from_facebook_marketplace:
        "hasPreviouslyPurchasedFromFacebookMarketplace",
      has_regularly_attended_comic_cons_or_collectible_shows:
        "hasRegularlyAttendedComicConsOrCollectibleShows",
      comic_book_store_name: "comicBookStoreName",
      store_logo: "storeLogo",
      how_long_store_operating: "howLongStoreOperating",
      grading_comics_experience: "gradingComicsExperience",
      retail_partnership_reason: "retailPartnershipReason",
      cps_partnership_reason: "cpsPartnershipReason",
      website_url: "websiteURL",
      estimated_submissions_per_month: "estimatedSubmissionsPerMonth",
      has_other_grading_service: "hasOtherGradingService",
      other_grading_service_name: "otherGradingServiceName",
      request_welcome_package: "requestWelcomePackage",
    };

    // Transform each error key from snake_case to camelCase
    Object.entries(errors).forEach(([key, value]) => {
      // If we have a mapping, use it; otherwise, use the original key
      const frontendKey = fieldMapping[key] || key;
      transformed[frontendKey] = value;
    });

    return transformed;
  };

  /**
   * Transform formData for API submission
   * This converts camelCase keys to snake_case for the API
   *
   * @param {Object} data - Frontend form data
   * @returns {Object} Transformed data for API
   */
  const transformDataForApi = (data) => {
    const result = {};

    // Reverse mapping - from frontend field names to backend field names
    const reverseFieldMapping = {
      addressLine1: "address_line1",
      addressLine2: "address_line2",
      postalCode: "postal_code",
      hasShippingAddress: "has_shipping_address",
      shippingName: "shipping_name",
      shippingPhone: "shipping_phone",
      shippingCountry: "shipping_country",
      shippingRegion: "shipping_region",
      shippingCity: "shipping_city",
      shippingPostalCode: "shipping_postal_code",
      shippingAddressLine1: "shipping_address_line1",
      shippingAddressLine2: "shipping_address_line2",
      howDidYouHearAboutUs: "how_did_you_hear_about_us",
      howDidYouHearAboutUsOther: "how_did_you_hear_about_us_other",
      howLongCollectingComicBooksForGrading:
        "how_long_collecting_comic_books_for_grading",
      hasPreviouslySubmittedComicBookForGrading:
        "has_previously_submitted_comic_book_for_grading",
      hasOwnedGradedComicBooks: "has_owned_graded_comic_books",
      hasRegularComicBookShop: "has_regular_comic_book_shop",
      hasPreviouslyPurchasedFromAuctionSite:
        "has_previously_purchased_from_auction_site",
      hasPreviouslyPurchasedFromFacebookMarketplace:
        "has_previously_purchased_from_facebook_marketplace",
      hasRegularlyAttendedComicConsOrCollectibleShows:
        "has_regularly_attended_comic_cons_or_collectible_shows",
      comicBookStoreName: "comic_book_store_name",
      storeLogo: "store_logo",
      howLongStoreOperating: "how_long_store_operating",
      gradingComicsExperience: "grading_comics_experience",
      retailPartnershipReason: "retail_partnership_reason",
      cpsPartnershipReason: "cps_partnership_reason",
      websiteURL: "website_url",
      estimatedSubmissionsPerMonth: "estimated_submissions_per_month",
      hasOtherGradingService: "has_other_grading_service",
      otherGradingServiceName: "other_grading_service_name",
      requestWelcomePackage: "request_welcome_package",
      userRole: "user_role", // Add user_role mapping
    };

    // Transform each field
    Object.entries(data).forEach(([key, value]) => {
      // Skip null or undefined values
      if (value === null || value === undefined) {
        return;
      }

      // If we have a mapping, use it; otherwise, use the original key
      const apiKey = reverseFieldMapping[key] || key;

      // Special handling for numeric fields - ensure they are integers
      if (
        typeof value === "string" &&
        [
          "how_did_you_hear_about_us",
          "how_long_collecting_comic_books_for_grading",
          "has_previously_submitted_comic_book_for_grading",
          "has_owned_graded_comic_books",
          "has_regular_comic_book_shop",
          "has_previously_purchased_from_auction_site",
          "has_previously_purchased_from_facebook_marketplace",
          "has_regularly_attended_comic_cons_or_collectible_shows",
          "how_long_store_operating",
          "has_other_grading_service",
          "request_welcome_package",
          "user_role", // Include user_role in numeric fields
        ].includes(apiKey)
      ) {
        // Convert string to integer if it's numeric
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          result[apiKey] = numValue;
        } else {
          result[apiKey] = value;
        }
      } else {
        result[apiKey] = value;
      }
    });

    // Set default user role based on form data if not explicitly provided
    if (!result.user_role) {
      // If it has business-specific fields, it's a retailer
      if (
        result.comic_book_store_name ||
        result.store_logo ||
        result.retail_partnership_reason
      ) {
        result.user_role = USER_ROLE.RETAILER;
      }
      // If it has individual-specific fields, it's a customer
      else if (
        result.has_previously_submitted_comic_book_for_grading ||
        result.has_owned_graded_comic_books
      ) {
        result.user_role = USER_ROLE.CUSTOMER;
      }
    }

    return result;
  };

  /**
   * Handle form submission with backend validation
   *
   * @param {Object} formData - The form data to submit
   * @param {number} [explicitUserRole] - Optional user role to override form-based detection
   * @returns {Promise<boolean>} Success status
   */
  const submitVerification = async (formData, explicitUserRole) => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      // Create a copy of formData with the userRole if provided
      const formDataWithRole = explicitUserRole
        ? { ...formData, userRole: explicitUserRole }
        : formData;

      // Transform data for API
      const apiData = transformDataForApi(formDataWithRole);

      // Log the data being sent to the API for debugging
      console.log("📤 Sending verification data:", apiData);

      // Submit data to API
      await verifyProfile(apiData);
      return true;
    } catch (err) {
      console.error("Verification submission error:", err);

      // Handle field-specific errors from API
      if (err.response?.data && typeof err.response.data === "object") {
        // Transform error keys from backend format to frontend format
        const transformedErrors = transformErrorKeys(err.response.data);
        setFormErrors(transformedErrors);
      }

      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset all state
   */
  const reset = () => {
    setFormErrors({});
    setIsSubmitting(false);
    resetAPI();
  };

  return {
    submitVerification,
    isSubmitting: isSubmitting || isLoading,
    formErrors,
    apiError: error,
    success,
    reset,
    USER_ROLE, // Export user role constants
  };
}

export default useVerifyProfile;
