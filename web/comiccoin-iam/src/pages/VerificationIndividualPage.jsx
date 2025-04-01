// src/pages/VerificationIndividualPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import countryRegionData from "country-region-data/dist/data-umd";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  User,
  Home,
  Building,
  Truck,
  InfoIcon,
  BookOpen,
} from "lucide-react";

import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";
import { useAuth } from "../hooks/useAuth";
import { useVerifyProfile, USER_ROLE } from "../hooks/useVerifyProfile";

// Hook to handle localStorage
const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  // Save to localStorage whenever the state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

const VerificationIndividualPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { submitVerification, isSubmitting, formErrors } = useVerifyProfile();

  const VERIFICATION_STATUS = {
    UNVERIFIED: 1,
    SUBMITTED_FOR_REVIEW: 2,
    APPROVED: 3,
    REJECTED: 4,
  };

  // Inline styles for select elements to fix Safari
  const selectStyles = {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M6 9L12 15 18 9'%3e%3c/path%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "1em",
    paddingRight: "2.5rem",
  };

  // State for form data (with localStorage persistence)
  const [formData, setFormData] = useLocalStorage(
    "individual_verification_data",
    {
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      country: "",
      country_other: "",
      postalCode: "",
      howDidYouHearAboutUs: 0,
      howDidYouHearAboutUsOther: "",
      hasShippingAddress: false,
      shippingName: "",
      shippingPhone: "",
      shippingCountry: "",
      shippingRegion: "",
      shippingCity: "",
      shippingAddressLine1: "",
      shippingAddressLine2: "",
      shippingPostalCode: "",
      howLongCollectingComicBooksForGrading: 0,
      hasPreviouslySubmittedComicBookForGrading: 0,
      hasOwnedGradedComicBooks: 0,
      hasRegularComicBookShop: 0,
      hasPreviouslyPurchasedFromAuctionSite: 0,
      hasPreviouslyPurchasedFromFacebookMarketplace: 0,
      hasRegularlyAttendedComicConsOrCollectibleShows: 0,
    },
  );

  // Form errors state
  const [errors, setErrors] = useState({});

  // Update our errors state with the formErrors from the hook
  useEffect(() => {
    if (formErrors && Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
    }
  }, [formErrors]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle country dropdown change
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      region: "", // Reset region when country changes
    }));

    // Clear country error if it exists
    if (errors.country) {
      setErrors((prev) => ({
        ...prev,
        country: undefined,
      }));
    }
  };

  // Handle region dropdown change
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      region: regionCode,
    }));

    // Clear region error if it exists
    if (errors.region) {
      setErrors((prev) => ({
        ...prev,
        region: undefined,
      }));
    }
  };

  // Handle shipping country dropdown change
  const handleShippingCountryChange = (e) => {
    const countryCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      shippingCountry: countryCode,
      shippingRegion: "", // Reset region when country changes
    }));

    // Clear country error if it exists
    if (errors.shippingCountry) {
      setErrors((prev) => ({
        ...prev,
        shippingCountry: undefined,
      }));
    }
  };

  // Handle shipping region dropdown change
  const handleShippingRegionChange = (e) => {
    const regionCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      shippingRegion: regionCode,
    }));

    // Clear region error if it exists
    if (errors.shippingRegion) {
      setErrors((prev) => ({
        ...prev,
        shippingRegion: undefined,
      }));
    }
  };

  // Helper function to get regions for a country
  const getRegionsForCountry = (countryCode) => {
    if (!countryCode) return [];

    const country = countryRegionData.find(
      (country) => country.countryShortCode === countryCode,
    );

    return country ? country.regions : [];
  };

  // Get available regions based on selected country
  const availableRegions = getRegionsForCountry(formData.country);
  const availableShippingRegions = getRegionsForCountry(
    formData.shippingCountry,
  );

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle radio button changes
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit the form data to the backend with explicit user role
      const success = await submitVerification(formData, USER_ROLE.CUSTOMER);

      if (success) {
        // Use the updateUser from the component scope, not from inside this function
        if (user && updateUser) {
          updateUser({
            ...user,
            profile_verification_status:
              VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW,
          });
        }

        // Use replace: true to prevent going back to the form
        navigate("/verification/pending", { replace: true });
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      // Error handling is managed by the useVerifyProfile hook
    }
  };

  // How did you hear about us options
  const referralSources = [
    { value: 0, label: "Select an option..." },
    { value: 1, label: "Social Media" },
    { value: 2, label: "Search Engine" },
    { value: 3, label: "Friend or Family" },
    { value: 4, label: "Comic Convention" },
    { value: 5, label: "Comic Book Store" },
    { value: 6, label: "Other" },
  ];

  // Experience options
  const experienceOptions = [
    { value: 0, label: "Select an option..." },
    { value: 1, label: "Less than 1 year" },
    { value: 2, label: "1-3 years" },
    { value: 3, label: "3-5 years" },
    { value: 4, label: "5-10 years" },
    { value: 5, label: "More than 10 years" },
  ];

  // Yes/No options for radio buttons
  const yesNoOptions = [
    { value: 1, label: "Yes" },
    { value: 2, label: "No" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showButton={false} showBackButton={false} />

      <main id="main-content" className="flex-grow">
        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 bg-purple-600 text-white">
              <div className="flex items-center">
                <User
                  className="h-6 w-6 mr-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h1 className="text-xl font-medium">
                    Individual Verification Form
                  </h1>
                  <p className="text-sm text-purple-100 mt-0.5">
                    Please provide your personal information for verification
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-5">
              {isSubmitting ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-700">
                    Processing your verification...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Display any errors at the top */}
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center mb-1">
                        <AlertCircle
                          className="h-4 w-4 text-red-500 mr-2"
                          aria-hidden="true"
                        />
                        <p className="font-medium text-sm text-red-600">
                          Please correct the following errors:
                        </p>
                      </div>
                      <ul className="list-disc ml-8 text-sm text-red-600">
                        {Object.values(errors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Primary Address Information Section */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Home
                        className="h-5 w-5 text-purple-600 mr-2"
                        aria-hidden="true"
                      />
                      <h2 className="text-md font-medium text-gray-900">
                        Primary Address Information
                      </h2>
                    </div>

                    {/* Address Line 1 */}
                    <div className="mb-3">
                      <label
                        htmlFor="addressLine1"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.addressLine1
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Street address, P.O. box, company name, c/o"
                        aria-required="true"
                        aria-invalid={errors.addressLine1 ? "true" : "false"}
                      />
                      {errors.addressLine1 && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.addressLine1}
                        </p>
                      )}
                    </div>

                    {/* Address Line 2 */}
                    <div className="mb-3">
                      <label
                        htmlFor="addressLine2"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Address Line 2{" "}
                        <span className="text-gray-400 text-xs">
                          (Optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        aria-required="false"
                      />
                    </div>

                    {/* City */}
                    <div className="mb-3">
                      <label
                        htmlFor="city"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.city
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="City/Town"
                        aria-required="true"
                        aria-invalid={errors.city ? "true" : "false"}
                      />
                      {errors.city && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* Country Dropdown */}
                    <div className="mb-3">
                      <label
                        htmlFor="country"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleCountryChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.country
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={errors.country ? "true" : "false"}
                      >
                        <option value="">Select Country...</option>
                        {countryRegionData.map((country) => (
                          <option
                            key={country.countryShortCode}
                            value={country.countryShortCode}
                          >
                            {country.countryName}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.country}
                        </p>
                      )}
                    </div>

                    {/* State/Province Dropdown */}
                    <div className="mb-3">
                      <label
                        htmlFor="region"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleRegionChange}
                        disabled={!formData.country}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.region
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        } ${!formData.country ? "bg-gray-100" : ""}`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={errors.region ? "true" : "false"}
                      >
                        <option value="">
                          {formData.country
                            ? "Select State/Province..."
                            : "Select Country First"}
                        </option>
                        {availableRegions.map((region) => (
                          <option
                            key={region.shortCode}
                            value={region.shortCode}
                          >
                            {region.name}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.region}
                        </p>
                      )}
                    </div>

                    {/* ZIP/Postal Code */}
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        ZIP/Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.postalCode
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="ZIP or Postal Code"
                        aria-required="true"
                        aria-invalid={errors.postalCode ? "true" : "false"}
                      />
                      {errors.postalCode && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Additional Information section */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <InfoIcon
                        className="h-5 w-5 text-purple-600 mr-2"
                        aria-hidden="true"
                      />
                      <h2 className="text-md font-medium text-gray-900">
                        Additional Information
                      </h2>
                    </div>

                    {/* How did you hear about ComicCoin */}
                    <div>
                      <label
                        htmlFor="howDidYouHearAboutUs"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        How did you hear about ComicCoin?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="howDidYouHearAboutUs"
                        name="howDidYouHearAboutUs"
                        value={formData.howDidYouHearAboutUs}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.howDidYouHearAboutUs
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={
                          errors.howDidYouHearAboutUs ? "true" : "false"
                        }
                      >
                        {referralSources.map((source) => (
                          <option key={source.value} value={source.value}>
                            {source.label}
                          </option>
                        ))}
                      </select>
                      {errors.howDidYouHearAboutUs && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.howDidYouHearAboutUs}
                        </p>
                      )}

                      {/* Show the "Other" text input if "Other" is selected */}
                      {formData.howDidYouHearAboutUs === 6 && (
                        <div className="mt-3">
                          <label
                            htmlFor="howDidYouHearAboutUsOther"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Please specify{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="howDidYouHearAboutUsOther"
                            name="howDidYouHearAboutUsOther"
                            value={formData.howDidYouHearAboutUsOther}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                              errors.howDidYouHearAboutUsOther
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Please specify"
                            aria-required="true"
                            aria-invalid={
                              errors.howDidYouHearAboutUsOther
                                ? "true"
                                : "false"
                            }
                          />
                          {errors.howDidYouHearAboutUsOther && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.howDidYouHearAboutUsOther}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comic Book Collecting Experience Section */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <BookOpen
                        className="h-5 w-5 text-purple-600 mr-2"
                        aria-hidden="true"
                      />
                      <h2 className="text-md font-medium text-gray-900">
                        Comic Book Collecting Experience
                      </h2>
                    </div>

                    {/* How long collecting comic books */}
                    <div className="mb-4">
                      <label
                        htmlFor="howLongCollectingComicBooksForGrading"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        How long have you been collecting comic books for
                        grading? <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="howLongCollectingComicBooksForGrading"
                        name="howLongCollectingComicBooksForGrading"
                        value={formData.howLongCollectingComicBooksForGrading}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.howLongCollectingComicBooksForGrading
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={
                          errors.howLongCollectingComicBooksForGrading
                            ? "true"
                            : "false"
                        }
                      >
                        {experienceOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.howLongCollectingComicBooksForGrading && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.howLongCollectingComicBooksForGrading}
                        </p>
                      )}
                    </div>

                    {/* Yes/No Questions with radio buttons */}
                    <div className="space-y-4">
                      {/* Previously submitted for grading */}
                      <div>
                        <fieldset className="mb-3">
                          <legend className="block text-sm text-gray-700 mb-2">
                            Have you previously submitted comic books for
                            grading? <span className="text-red-500">*</span>
                          </legend>
                          <div className="flex space-x-6">
                            {yesNoOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`hasPreviouslySubmittedComicBookForGrading-${option.value}`}
                                  name="hasPreviouslySubmittedComicBookForGrading"
                                  type="radio"
                                  value={option.value}
                                  checked={
                                    formData.hasPreviouslySubmittedComicBookForGrading ===
                                    option.value
                                  }
                                  onChange={handleRadioChange}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  aria-required="true"
                                />
                                <label
                                  htmlFor={`hasPreviouslySubmittedComicBookForGrading-${option.value}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.hasPreviouslySubmittedComicBookForGrading && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.hasPreviouslySubmittedComicBookForGrading}
                            </p>
                          )}
                        </fieldset>
                      </div>

                      {/* Owned graded comics */}
                      <div>
                        <fieldset className="mb-3">
                          <legend className="block text-sm text-gray-700 mb-2">
                            Have you owned graded comic books?{" "}
                            <span className="text-red-500">*</span>
                          </legend>
                          <div className="flex space-x-6">
                            {yesNoOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`hasOwnedGradedComicBooks-${option.value}`}
                                  name="hasOwnedGradedComicBooks"
                                  type="radio"
                                  value={option.value}
                                  checked={
                                    formData.hasOwnedGradedComicBooks ===
                                    option.value
                                  }
                                  onChange={handleRadioChange}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  aria-required="true"
                                />
                                <label
                                  htmlFor={`hasOwnedGradedComicBooks-${option.value}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.hasOwnedGradedComicBooks && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.hasOwnedGradedComicBooks}
                            </p>
                          )}
                        </fieldset>
                      </div>

                      {/* Regular comic book shop */}
                      <div>
                        <fieldset className="mb-3">
                          <legend className="block text-sm text-gray-700 mb-2">
                            Do you have a regular comic book shop?{" "}
                            <span className="text-red-500">*</span>
                          </legend>
                          <div className="flex space-x-6">
                            {yesNoOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`hasRegularComicBookShop-${option.value}`}
                                  name="hasRegularComicBookShop"
                                  type="radio"
                                  value={option.value}
                                  checked={
                                    formData.hasRegularComicBookShop ===
                                    option.value
                                  }
                                  onChange={handleRadioChange}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  aria-required="true"
                                />
                                <label
                                  htmlFor={`hasRegularComicBookShop-${option.value}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.hasRegularComicBookShop && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.hasRegularComicBookShop}
                            </p>
                          )}
                        </fieldset>
                      </div>

                      {/* Purchased from auction sites */}
                      <div>
                        <fieldset className="mb-3">
                          <legend className="block text-sm text-gray-700 mb-2">
                            Have you purchased from auction sites?{" "}
                            <span className="text-red-500">*</span>
                          </legend>
                          <div className="flex space-x-6">
                            {yesNoOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`hasPreviouslyPurchasedFromAuctionSite-${option.value}`}
                                  name="hasPreviouslyPurchasedFromAuctionSite"
                                  type="radio"
                                  value={option.value}
                                  checked={
                                    formData.hasPreviouslyPurchasedFromAuctionSite ===
                                    option.value
                                  }
                                  onChange={handleRadioChange}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  aria-required="true"
                                />
                                <label
                                  htmlFor={`hasPreviouslyPurchasedFromAuctionSite-${option.value}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.hasPreviouslyPurchasedFromAuctionSite && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.hasPreviouslyPurchasedFromAuctionSite}
                            </p>
                          )}
                        </fieldset>
                      </div>

                      {/* Purchased from Facebook Marketplace */}
                      <div>
                        <fieldset className="mb-3">
                          <legend className="block text-sm text-gray-700 mb-2">
                            Have you purchased from Facebook Marketplace?{" "}
                            <span className="text-red-500">*</span>
                          </legend>
                          <div className="flex space-x-6">
                            {yesNoOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`hasPreviouslyPurchasedFromFacebookMarketplace-${option.value}`}
                                  name="hasPreviouslyPurchasedFromFacebookMarketplace"
                                  type="radio"
                                  value={option.value}
                                  checked={
                                    formData.hasPreviouslyPurchasedFromFacebookMarketplace ===
                                    option.value
                                  }
                                  onChange={handleRadioChange}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  aria-required="true"
                                />
                                <label
                                  htmlFor={`hasPreviouslyPurchasedFromFacebookMarketplace-${option.value}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.hasPreviouslyPurchasedFromFacebookMarketplace && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {
                                errors.hasPreviouslyPurchasedFromFacebookMarketplace
                              }
                            </p>
                          )}
                        </fieldset>
                      </div>

                      {/* Attended comic cons or collectible shows */}
                      <div>
                        <fieldset className="mb-3">
                          <legend className="block text-sm text-gray-700 mb-2">
                            Do you attend comic cons or collectible shows?{" "}
                            <span className="text-red-500">*</span>
                          </legend>
                          <div className="flex space-x-6">
                            {yesNoOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`hasRegularlyAttendedComicConsOrCollectibleShows-${option.value}`}
                                  name="hasRegularlyAttendedComicConsOrCollectibleShows"
                                  type="radio"
                                  value={option.value}
                                  checked={
                                    formData.hasRegularlyAttendedComicConsOrCollectibleShows ===
                                    option.value
                                  }
                                  onChange={handleRadioChange}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  aria-required="true"
                                />
                                <label
                                  htmlFor={`hasRegularlyAttendedComicConsOrCollectibleShows-${option.value}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {errors.hasRegularlyAttendedComicConsOrCollectibleShows && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {
                                errors.hasRegularlyAttendedComicConsOrCollectibleShows
                              }
                            </p>
                          )}
                        </fieldset>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Truck
                          className="h-5 w-5 text-purple-600 mr-2"
                          aria-hidden="true"
                        />
                        <h2 className="text-md font-medium text-gray-900">
                          Shipping Address
                        </h2>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasShippingAddress"
                          name="hasShippingAddress"
                          checked={formData.hasShippingAddress}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          aria-labelledby="shipping-address-label"
                        />
                        <label
                          id="shipping-address-label"
                          htmlFor="hasShippingAddress"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          I have a different shipping address
                        </label>
                      </div>
                    </div>

                    {/* Show shipping address fields only if checkbox is checked */}
                    {formData.hasShippingAddress && (
                      <div className="mt-4 space-y-3 border-l-2 border-purple-100 pl-3">
                        {/* Shipping Name */}
                        <div>
                          <label
                            htmlFor="shippingName"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="shippingName"
                            name="shippingName"
                            value={formData.shippingName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                              errors.shippingName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Full Name"
                            aria-required="true"
                            aria-invalid={
                              errors.shippingName ? "true" : "false"
                            }
                          />
                          {errors.shippingName && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.shippingName}
                            </p>
                          )}
                        </div>

                        {/* Shipping Phone */}
                        <div>
                          <label
                            htmlFor="shippingPhone"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Phone Number{" "}
                            <span className="text-gray-400 text-xs">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="tel"
                            id="shippingPhone"
                            name="shippingPhone"
                            value={formData.shippingPhone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="+1 (555) 123-4567"
                            aria-required="false"
                          />
                        </div>

                        {/* Shipping Address Line 1 */}
                        <div>
                          <label
                            htmlFor="shippingAddressLine1"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Address Line 1{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="shippingAddressLine1"
                            name="shippingAddressLine1"
                            value={formData.shippingAddressLine1}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                              errors.shippingAddressLine1
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Street address, P.O. box, company name, c/o"
                            aria-required="true"
                            aria-invalid={
                              errors.shippingAddressLine1 ? "true" : "false"
                            }
                          />
                          {errors.shippingAddressLine1 && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.shippingAddressLine1}
                            </p>
                          )}
                        </div>

                        {/* Shipping Address Line 2 */}
                        <div>
                          <label
                            htmlFor="shippingAddressLine2"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Address Line 2{" "}
                            <span className="text-gray-400 text-xs">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="text"
                            id="shippingAddressLine2"
                            name="shippingAddressLine2"
                            value={formData.shippingAddressLine2}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            aria-required="false"
                          />
                        </div>

                        {/* Shipping City, Region/State, ZIP/Postal Code in a grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Shipping City */}
                          <div>
                            <label
                              htmlFor="shippingCity"
                              className="block text-sm text-gray-700 mb-1"
                            >
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="shippingCity"
                              name="shippingCity"
                              value={formData.shippingCity}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                errors.shippingCity
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="City/Town"
                              aria-required="true"
                              aria-invalid={
                                errors.shippingCity ? "true" : "false"
                              }
                            />
                            {errors.shippingCity && (
                              <p
                                className="mt-1 text-xs text-red-600 flex items-center"
                                aria-live="polite"
                              >
                                <AlertCircle
                                  className="h-3 w-3 mr-1"
                                  aria-hidden="true"
                                />
                                {errors.shippingCity}
                              </p>
                            )}
                          </div>

                          {/* Shipping Region/State */}
                          <div>
                            <label
                              htmlFor="shippingRegion"
                              className="block text-sm text-gray-700 mb-1"
                            >
                              State/Province{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="shippingRegion"
                              name="shippingRegion"
                              value={formData.shippingRegion}
                              onChange={handleShippingRegionChange}
                              disabled={!formData.shippingCountry}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                errors.shippingRegion
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              } ${!formData.shippingCountry ? "bg-gray-100" : ""}`}
                              style={selectStyles}
                              aria-required="true"
                              aria-invalid={
                                errors.shippingRegion ? "true" : "false"
                              }
                            >
                              <option value="">
                                {formData.shippingCountry
                                  ? "Select State/Province..."
                                  : "Select Country First"}
                              </option>
                              {availableShippingRegions.map((region) => (
                                <option
                                  key={region.shortCode}
                                  value={region.shortCode}
                                >
                                  {region.name}
                                </option>
                              ))}
                            </select>
                            {errors.shippingRegion && (
                              <p
                                className="mt-1 text-xs text-red-600 flex items-center"
                                aria-live="polite"
                              >
                                <AlertCircle
                                  className="h-3 w-3 mr-1"
                                  aria-hidden="true"
                                />
                                {errors.shippingRegion}
                              </p>
                            )}
                          </div>

                          {/* Shipping Postal Code */}
                          <div>
                            <label
                              htmlFor="shippingPostalCode"
                              className="block text-sm text-gray-700 mb-1"
                            >
                              ZIP/Postal Code{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="shippingPostalCode"
                              name="shippingPostalCode"
                              value={formData.shippingPostalCode}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                errors.shippingPostalCode
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="ZIP or Postal Code"
                              aria-required="true"
                              aria-invalid={
                                errors.shippingPostalCode ? "true" : "false"
                              }
                            />
                            {errors.shippingPostalCode && (
                              <p
                                className="mt-1 text-xs text-red-600 flex items-center"
                                aria-live="polite"
                              >
                                <AlertCircle
                                  className="h-3 w-3 mr-1"
                                  aria-hidden="true"
                                />
                                {errors.shippingPostalCode}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Shipping Country */}
                        <div>
                          <label
                            htmlFor="shippingCountry"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="shippingCountry"
                            name="shippingCountry"
                            value={formData.shippingCountry}
                            onChange={handleShippingCountryChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                              errors.shippingCountry
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            style={selectStyles}
                            aria-required="true"
                            aria-invalid={
                              errors.shippingCountry ? "true" : "false"
                            }
                          >
                            <option value="">Select Country...</option>
                            {countryRegionData.map((country) => (
                              <option
                                key={country.countryShortCode}
                                value={country.countryShortCode}
                              >
                                {country.countryName}
                              </option>
                            ))}
                          </select>
                          {errors.shippingCountry && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.shippingCountry}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Navigation */}
                  <div className="mt-6 flex justify-between">
                    <Link
                      to="/verification"
                      className="flex items-center px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      aria-label="Go back to verification options"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      Back
                    </Link>

                    <button
                      type="submit"
                      className="flex items-center px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      aria-label="Submit your verification information"
                      disabled={isSubmitting}
                    >
                      Submit Verification
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />
    </div>
  );
};

export default VerificationIndividualPage;
