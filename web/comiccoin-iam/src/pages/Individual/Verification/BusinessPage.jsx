// monorepo/web/comiccoin-iam/src/pages/Individual/Verification/BusinessPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import countryRegionData from "country-region-data/dist/data-umd";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Home,
  InfoIcon,
  Building,
  Truck,
  Globe,
  Store,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";

import Header from "../../../components/IndexPage/Header";
import Footer from "../../../components/IndexPage/Footer";
import { useAuth } from "../../../hooks/useAuth";
import { useVerifyProfile, USER_ROLE } from "../../../hooks/useVerifyProfile";

const VERIFICATION_STATUS = {
  UNVERIFIED: 1,
  SUBMITTED_FOR_REVIEW: 2,
  APPROVED: 3,
  REJECTED: 4,
};

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

const VerificationBusinessPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { submitVerification, isSubmitting, formErrors } = useVerifyProfile();

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
    "business_verification_data",
    {
      comicBookStoreName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      country: "",
      postalCode: "",
      howDidYouHearAboutUs: 0,
      howDidYouHearAboutUsOther: "",
      howLongStoreOperating: 0,
      gradingComicsExperience: "",
      comicCoinPartnershipReason: "",
      hasShippingAddress: false,
      shippingName: "",
      shippingPhone: "",
      shippingCountry: "",
      shippingRegion: "",
      shippingCity: "",
      shippingAddressLine1: "",
      shippingAddressLine2: "",
      shippingPostalCode: "",
      retailPartnershipReason: "",
      websiteURL: "",
      estimatedSubmissionsPerMonth: "",
      hasOtherGradingService: 0,
      otherGradingServiceName: "",
      requestWelcomePackage: 0,
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
    let processedValue = value; // Default to string value

    // These specific select fields use numeric values in their options
    // and should be stored as numbers in the state.
    const numericSelects = [
      "howDidYouHearAboutUs",
      "howLongStoreOperating",
      "hasOtherGradingService",
      "requestWelcomePackage",
      "estimatedSubmissionsPerMonth",
    ];

    if (numericSelects.includes(name)) {
      const parsedValue = parseInt(value, 10);
      // Use the parsed number if valid, otherwise default (assuming 0 for empty/invalid selection)
      processedValue = isNaN(parsedValue) ? 0 : parsedValue;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue, // Use the original or parsed value
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

    // Client-side validation
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      { field: "comicBookStoreName", label: "Comic Book Store Name" },
      { field: "addressLine1", label: "Address Line 1" },
      { field: "city", label: "City" },
      { field: "country", label: "Country" },
      { field: "region", label: "State/Province" },
      { field: "postalCode", label: "ZIP/Postal Code" },
      { field: "howDidYouHearAboutUs", label: "How did you hear about us" },
      { field: "howLongStoreOperating", label: "Store operation duration" },
      { field: "gradingComicsExperience", label: "Grading comics experience" },
      { field: "retailPartnershipReason", label: "Retail partnership reason" },
      {
        field: "estimatedSubmissionsPerMonth",
        label: "Estimated submissions per month",
      },
      {
        field: "hasOtherGradingService",
        label: "Other grading service information",
      },
      { field: "requestWelcomePackage", label: "Welcome package request" },
      { field: "websiteURL", label: "Website URL" },
      { field: "description", label: "Description" },
    ];

    requiredFields.forEach(({ field, label }) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "number" && formData[field] === 0)
      ) {
        newErrors[field] = `${label} is required`;
      }
    });

    // Validate "Other" field if "Other" is selected in the dropdown
    if (
      formData.howDidYouHearAboutUs === 6 &&
      !formData.howDidYouHearAboutUsOther
    ) {
      newErrors.howDidYouHearAboutUsOther =
        "Please specify how you heard about us";
    }

    // Validate grading service name if "Yes" is selected
    if (
      formData.hasOtherGradingService === 1 &&
      !formData.otherGradingServiceName
    ) {
      newErrors.otherGradingServiceName = "Please specify the grading service";
    }

    // Validate shipping address fields if shipping address is enabled
    if (formData.hasShippingAddress) {
      const requiredShippingFields = [
        { field: "shippingName", label: "Shipping name" },
        { field: "shippingCountry", label: "Shipping country" },
        { field: "shippingRegion", label: "Shipping state/province" },
        { field: "shippingCity", label: "Shipping city" },
        { field: "shippingAddressLine1", label: "Shipping address" },
        { field: "shippingPostalCode", label: "Shipping postal code" },
      ];

      requiredShippingFields.forEach(({ field, label }) => {
        if (!formData[field]) {
          newErrors[field] = `${label} is required`;
        }
      });
    }

    // If there are errors, show them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      // Submit data to the API with explicit user role
      // USER_ROLE.RETAILER = 2 in our backend (business/retailer user)
      const success = await submitVerification(formData, USER_ROLE.RETAILER);

      if (success) {
        // Update user verification status if available
        if (user && updateUser) {
          updateUser({
            ...user,
            profile_verification_status:
              VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW,
          });
        }

        // After successful submission, redirect to pending page
        // Use replace: true to prevent going back to the form
        navigate("/verification/pending", { replace: true });
      }
    } catch (error) {
      console.error("Error submitting business verification:", error);

      // Update our local errors with any formErrors from the hook
      if (formErrors && Object.keys(formErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...formErrors }));
      }

      // Scroll to the top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // How did you hear about us options
  const referralSources = [
    { value: 0, label: "Select an option..." },
    { value: 1, label: "Social Media" },
    { value: 2, label: "Search Engine" },
    { value: 3, label: "Friend or Colleague" },
    { value: 4, label: "Comic Convention" },
    { value: 5, label: "Industry Publication" },
    { value: 6, label: "Other" },
  ];

  // Years in operation options
  const yearsInOperation = [
    { value: 0, label: "Select an option..." },
    { value: 1, label: "Less than 1 year" },
    { value: 2, label: "1-3 years" },
    { value: 3, label: "3-5 years" },
    { value: 4, label: "5-10 years" },
    { value: 5, label: "More than 10 years" },
  ];

  // Yes/No options
  const yesNoOptions = [
    { value: 0, label: "Select an option..." },
    { value: 1, label: "Yes" },
    { value: 2, label: "No" },
  ];

  // Estimated submissions per month options
  const estimatedSubmissionsPerMonthOptions = [
    { value: 0, label: "Select an option..." },
    { value: 1, label: "1-10 submissions per month" },
    { value: 2, label: "11-25 submissions per month" },
    { value: 3, label: "26-50 submissions per month" },
    { value: 4, label: "51-100 submissions per month" },
    { value: 5, label: "More than 100 submissions per month" },
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
                <Building
                  className="h-6 w-6 mr-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h1 className="text-xl font-medium">
                    Business Verification Form
                  </h1>
                  <p className="text-sm text-purple-100 mt-0.5">
                    Please provide your business information for verification
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

                  {/* Business Information Section */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Store
                        className="h-5 w-5 text-purple-600 mr-2"
                        aria-hidden="true"
                      />
                      <h2 className="text-md font-medium text-gray-900">
                        Business Information
                      </h2>
                    </div>

                    {/* Comic Book Store Name */}
                    <div className="mb-3">
                      <label
                        htmlFor="comicBookStoreName"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Comic Book Store Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="comicBookStoreName"
                        name="comicBookStoreName"
                        value={formData.comicBookStoreName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.comicBookStoreName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Your store name"
                        aria-required="true"
                        aria-invalid={
                          errors.comicBookStoreName ? "true" : "false"
                        }
                      />
                      {errors.comicBookStoreName && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.comicBookStoreName}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Please write a brief description of the comic book store{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.description
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder={
                          "For example `Rare comic book shop for collectors and traders`, etc."
                        }
                        aria-required="true"
                        aria-invalid={errors.description ? "true" : "false"}
                      ></textarea>
                      {errors.description && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.description}
                        </p>
                      )}
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
                    <div className="mb-3">
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

                    {/* Website URL */}
                    <div className="mt-3">
                      <label
                        htmlFor="websiteURL"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Online Presence Link{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          <LinkIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                          type="url"
                          id="websiteURL"
                          name="websiteURL"
                          value={formData.websiteURL}
                          onChange={handleInputChange}
                          className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                            errors.websiteURL
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="e.g., https://linkedin.com/in/yourprofile"
                          aria-required="true"
                          aria-invalid={errors.websiteURL ? "true" : "false"}
                          aria-describedby="websiteURL-help"
                        />
                      </div>
                      <p
                        id="websiteURL-help"
                        className="mt-1 text-xs text-gray-500"
                      >
                        Please provide a link to your company website, parent
                        company HQ website, or a public social media profile
                        (like LinkedIn, Twitter, or Facebook). This helps us
                        verify your identity and connection to the comic
                        community.
                      </p>
                      {errors.websiteURL && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.websiteURL}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Business Operations Section */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Briefcase
                        className="h-5 w-5 text-purple-600 mr-2"
                        aria-hidden="true"
                      />
                      <h2 className="text-md font-medium text-gray-900">
                        Business Operations
                      </h2>
                    </div>

                    {/* How long has your store been operating */}
                    <div className="mb-3">
                      <label
                        htmlFor="howLongStoreOperating"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        How long has your store been operating?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="howLongStoreOperating"
                        name="howLongStoreOperating"
                        value={formData.howLongStoreOperating}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.howLongStoreOperating
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={
                          errors.howLongStoreOperating ? "true" : "false"
                        }
                      >
                        {yearsInOperation.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.howLongStoreOperating && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.howLongStoreOperating}
                        </p>
                      )}
                    </div>

                    {/* Grading Experience */}
                    <div className="mb-3">
                      <label
                        htmlFor="gradingComicsExperience"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Describe your experience with grading comics{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="gradingComicsExperience"
                        name="gradingComicsExperience"
                        value={formData.gradingComicsExperience}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.gradingComicsExperience
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Please share your experience with comic grading services"
                        aria-required="true"
                        aria-invalid={
                          errors.gradingComicsExperience ? "true" : "false"
                        }
                      ></textarea>
                      {errors.gradingComicsExperience && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.gradingComicsExperience}
                        </p>
                      )}
                    </div>

                    {/* Estimated Submissions Per Month */}
                    <div className="mb-3">
                      <label
                        htmlFor="estimatedSubmissionsPerMonth"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Estimated submissions per month of Comics for grading{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="estimatedSubmissionsPerMonth"
                        name="estimatedSubmissionsPerMonth"
                        value={formData.estimatedSubmissionsPerMonth}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.estimatedSubmissionsPerMonth
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={
                          errors.estimatedSubmissionsPerMonth ? "true" : "false"
                        }
                      >
                        {estimatedSubmissionsPerMonthOptions.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                      {errors.estimatedSubmissionsPerMonth && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.estimatedSubmissionsPerMonth}
                        </p>
                      )}
                    </div>

                    {/* Other Grading Services */}
                    <div className="mb-3">
                      <label
                        htmlFor="hasOtherGradingService"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Do you currently use another grading service?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="hasOtherGradingService"
                        name="hasOtherGradingService"
                        value={formData.hasOtherGradingService}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.hasOtherGradingService
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={
                          errors.hasOtherGradingService ? "true" : "false"
                        }
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.hasOtherGradingService && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.hasOtherGradingService}
                        </p>
                      )}

                      {/* Conditional field for other grading service name */}
                      {formData.hasOtherGradingService === 1 && (
                        <div className="mt-3">
                          <label
                            htmlFor="otherGradingServiceName"
                            className="block text-sm text-gray-700 mb-1"
                          >
                            Which grading service do you use?{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="otherGradingServiceName"
                            name="otherGradingServiceName"
                            value={formData.otherGradingServiceName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                              errors.otherGradingServiceName
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                            placeholder="Name of grading service"
                            aria-required="true"
                            aria-invalid={
                              errors.otherGradingServiceName ? "true" : "false"
                            }
                          />
                          {errors.otherGradingServiceName && (
                            <p
                              className="mt-1 text-xs text-red-600 flex items-center"
                              aria-live="polite"
                            >
                              <AlertCircle
                                className="h-3 w-3 mr-1"
                                aria-hidden="true"
                              />
                              {errors.otherGradingServiceName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Request Welcome Package */}
                    <div className="mb-3">
                      <label
                        htmlFor="requestWelcomePackage"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Would you like to receive a retailer welcome package?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="requestWelcomePackage"
                        name="requestWelcomePackage"
                        value={formData.requestWelcomePackage}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.requestWelcomePackage
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        aria-required="true"
                        aria-invalid={
                          errors.requestWelcomePackage ? "true" : "false"
                        }
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.requestWelcomePackage && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.requestWelcomePackage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Partnership Details */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <InfoIcon
                        className="h-5 w-5 text-purple-600 mr-2"
                        aria-hidden="true"
                      />
                      <h2 className="text-md font-medium text-gray-900">
                        Partnership Details
                      </h2>
                    </div>

                    {/* How did you hear about ComicCoin */}
                    <div className="mb-3">
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

                    {/* Comic Coin Partnership Reason */}
                    <div className="mb-3">
                      <label
                        htmlFor="comicCoinPartnershipReason"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Why are you interested in the ComicCoin Blockchain
                        program?{" "}
                        <span className="text-gray-400 text-xs">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        id="comicCoinPartnershipReason"
                        name="comicCoinPartnershipReason"
                        value={formData.comicCoinPartnershipReason}
                        onChange={handleInputChange}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.comicCoinPartnershipReason
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Your reasons for interest in the ComicCoin Blockchain program"
                        aria-required="false"
                      ></textarea>
                      {errors.comicCoinPartnershipReason && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.comicCoinPartnershipReason}
                        </p>
                      )}
                    </div>

                    {/* Retail Partnership Reason */}
                    <div className="mb-3">
                      <label
                        htmlFor="retailPartnershipReason"
                        className="block text-sm text-gray-700 mb-1"
                      >
                        Why are you interested in becoming a retail partner?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="retailPartnershipReason"
                        name="retailPartnershipReason"
                        value={formData.retailPartnershipReason}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                          errors.retailPartnershipReason
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Please explain why you're interested in partnering with us"
                        aria-required="true"
                        aria-invalid={
                          errors.retailPartnershipReason ? "true" : "false"
                        }
                      ></textarea>
                      {errors.retailPartnershipReason && (
                        <p
                          className="mt-1 text-xs text-red-600 flex items-center"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="h-3 w-3 mr-1"
                            aria-hidden="true"
                          />
                          {errors.retailPartnershipReason}
                        </p>
                      )}
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

export default VerificationBusinessPage;
