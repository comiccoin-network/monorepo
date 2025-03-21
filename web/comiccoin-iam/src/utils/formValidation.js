// src/utils/formValidation.js

/**
 * Validates individual (customer) verification form data
 *
 * @param {Object} formData - The form data to validate
 * @returns {Object} Object with validation errors (empty if valid)
 */
export function validateIndividualVerificationForm(formData) {
  const errors = {};

  // Required fields validation
  if (!formData.addressLine1) errors.addressLine1 = "Address is required";
  if (!formData.city) errors.city = "City is required";
  if (!formData.country) errors.country = "Country is required";
  if (!formData.region) errors.region = "State/Province is required";
  if (!formData.postalCode) errors.postalCode = "Postal/ZIP code is required";
  if (!formData.howDidYouHearAboutUs)
    errors.howDidYouHearAboutUs = "This field is required";

  // Validate shipping address if it's enabled
  if (formData.hasShippingAddress) {
    if (!formData.shippingName) errors.shippingName = "Name is required";
    if (!formData.shippingAddressLine1)
      errors.shippingAddressLine1 = "Address is required";
    if (!formData.shippingCity) errors.shippingCity = "City is required";
    if (!formData.shippingRegion)
      errors.shippingRegion = "State/Province is required";
    if (!formData.shippingCountry)
      errors.shippingCountry = "Country is required";
    if (!formData.shippingPostalCode)
      errors.shippingPostalCode = "Postal/ZIP code is required";
  }

  // Validate "How did you hear about us" other field
  if (
    formData.howDidYouHearAboutUs === 6 &&
    !formData.howDidYouHearAboutUsOther
  ) {
    errors.howDidYouHearAboutUsOther = "Please specify how you heard about us";
  }

  // Validate Yes/No radio selections
  if (formData.hasPreviouslySubmittedComicBookForGrading === 0) {
    errors.hasPreviouslySubmittedComicBookForGrading =
      "Please select an option";
  }
  if (formData.hasOwnedGradedComicBooks === 0) {
    errors.hasOwnedGradedComicBooks = "Please select an option";
  }
  if (formData.hasRegularComicBookShop === 0) {
    errors.hasRegularComicBookShop = "Please select an option";
  }
  if (formData.hasPreviouslyPurchasedFromAuctionSite === 0) {
    errors.hasPreviouslyPurchasedFromAuctionSite = "Please select an option";
  }
  if (formData.hasPreviouslyPurchasedFromFacebookMarketplace === 0) {
    errors.hasPreviouslyPurchasedFromFacebookMarketplace =
      "Please select an option";
  }
  if (formData.hasRegularlyAttendedComicConsOrCollectibleShows === 0) {
    errors.hasRegularlyAttendedComicConsOrCollectibleShows =
      "Please select an option";
  }

  return errors;
}

/**
 * Validates business (retailer) verification form data
 *
 * @param {Object} formData - The form data to validate
 * @returns {Object} Object with validation errors (empty if valid)
 */
export function validateBusinessVerificationForm(formData) {
  const errors = {};

  // Required fields validation
  if (!formData.comicBookStoreName)
    errors.comicBookStoreName = "Store name is required";
  if (!formData.addressLine1) errors.addressLine1 = "Address is required";
  if (!formData.city) errors.city = "City is required";
  if (!formData.region) errors.region = "State/Province is required";
  if (!formData.country) errors.country = "Country is required";
  if (!formData.postalCode) errors.postalCode = "Postal/ZIP code is required";
  if (!formData.gradingComicsExperience)
    errors.gradingComicsExperience = "This field is required";
  if (!formData.retailPartnershipReason)
    errors.retailPartnershipReason = "This field is required";
  if (!formData.estimatedSubmissionsPerMonth)
    errors.estimatedSubmissionsPerMonth = "This field is required";
  if (!formData.howDidYouHearAboutUs)
    errors.howDidYouHearAboutUs = "This field is required";

  // Validate shipping address if it's enabled
  if (formData.hasShippingAddress) {
    if (!formData.shippingName) errors.shippingName = "Name is required";
    if (!formData.shippingAddressLine1)
      errors.shippingAddressLine1 = "Address is required";
    if (!formData.shippingCity) errors.shippingCity = "City is required";
    if (!formData.shippingRegion)
      errors.shippingRegion = "State/Province is required";
    if (!formData.shippingCountry)
      errors.shippingCountry = "Country is required";
    if (!formData.shippingPostalCode)
      errors.shippingPostalCode = "Postal/ZIP code is required";
  }

  // Validate "How did you hear about us" other field
  if (
    formData.howDidYouHearAboutUs === 6 &&
    !formData.howDidYouHearAboutUsOther
  ) {
    errors.howDidYouHearAboutUsOther = "Please specify how you heard about us";
  }

  // Validate other grading service name if applicable
  if (
    formData.hasOtherGradingService === 1 &&
    !formData.otherGradingServiceName
  ) {
    errors.otherGradingServiceName =
      "Please specify the name of the grading service";
  }

  return errors;
}

export default {
  validateIndividualVerificationForm,
  validateBusinessVerificationForm,
};
