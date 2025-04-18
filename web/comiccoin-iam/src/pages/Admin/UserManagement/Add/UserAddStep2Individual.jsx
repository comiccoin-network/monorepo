// UserAddStep2Individual.jsx
import React, { useState } from "react";
import { useUserWizard } from "./UserAddWizardContext";
import countryRegionData from "country-region-data/dist/data-umd";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  UserCircle,
  Shield,
  Phone,
  Globe,
  MapPin,
  Home,
  Hash,
  Info,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  BookOpen,
  Check,
  ArrowDown,
  Truck,
} from "lucide-react";
import {
  USER_STATUS,
  PROFILE_VERIFICATION_STATUS,
} from "../../../../hooks/useUser";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";

// Timezones for dropdown
const timezones = [
  { value: "", label: "Select Timezone..." },
  { value: "UTC-12:00", label: "(UTC-12:00) International Date Line West" },
  { value: "UTC-11:00", label: "(UTC-11:00) Samoa" },
  { value: "UTC-10:00", label: "(UTC-10:00) Hawaii" },
  { value: "UTC-09:00", label: "(UTC-09:00) Alaska" },
  { value: "UTC-08:00", label: "(UTC-08:00) Pacific Time (US & Canada)" },
  { value: "UTC-07:00", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  { value: "UTC-06:00", label: "(UTC-06:00) Central Time (US & Canada)" },
  { value: "UTC-05:00", label: "(UTC-05:00) Eastern Time (US & Canada)" },
  { value: "UTC-04:00", label: "(UTC-04:00) Atlantic Time (Canada)" },
  { value: "UTC-03:00", label: "(UTC-03:00) Brasilia" },
  { value: "UTC+00:00", label: "(UTC+00:00) London, Dublin, Lisbon" },
  { value: "UTC+01:00", label: "(UTC+01:00) Berlin, Paris, Rome, Madrid" },
  { value: "UTC+02:00", label: "(UTC+02:00) Athens, Istanbul, Cairo" },
  { value: "UTC+03:00", label: "(UTC+03:00) Moscow, Baghdad" },
  { value: "UTC+05:30", label: "(UTC+05:30) New Delhi, Mumbai" },
  { value: "UTC+08:00", label: "(UTC+08:00) Beijing, Singapore, Hong Kong" },
  { value: "UTC+09:00", label: "(UTC+09:00) Tokyo, Seoul" },
  { value: "UTC+10:00", label: "(UTC+10:00) Sydney, Melbourne" },
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

// Referral sources
const referralSources = [
  { value: 0, label: "Select an option..." },
  { value: 1, label: "Social Media" },
  { value: 2, label: "Search Engine" },
  { value: 3, label: "Friend or Family" },
  { value: 4, label: "Comic Convention" },
  { value: 5, label: "Comic Book Store" },
  { value: 6, label: "Other" },
];

// Yes/No options
const yesNoOptions = [
  { value: 0, label: "Select an option..." },
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

const UserAddStep2Individual = () => {
  const {
    formData,
    updateFormData,
    prevStep,
    nextStep,
    formErrors,
    setFormErrors,
  } = useUserWizard();
  const [localErrors, setLocalErrors] = useState({});

  // Inline styles for select elements to fix Safari issues
  const selectStyles = {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "1em",
    paddingRight: "2.5rem",
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    updateFormData({ [name]: newValue });

    // Clear error when user types
    if (localErrors[name]) {
      const newErrors = { ...localErrors };
      delete newErrors[name];
      setLocalErrors(newErrors);
    }
  };

  // Get available regions based on selected country
  const getRegionsForCountry = (countryCode) => {
    if (!countryCode) return [];
    const country = countryRegionData.find(
      (country) => country.countryShortCode === countryCode,
    );
    return country ? country.regions : [];
  };

  // Available regions for the selected countries
  const availableRegions = getRegionsForCountry(formData.country);
  const availableShippingRegions = getRegionsForCountry(
    formData.shippingCountry,
  );

  // Handle country changes
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    updateFormData({
      country: countryCode,
      region: "", // Reset region when country changes
    });

    // Clear country error
    if (localErrors.country) {
      const newErrors = { ...localErrors };
      delete newErrors.country;
      setLocalErrors(newErrors);
    }
  };

  // Handle region changes
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    updateFormData({ region: regionCode });

    // Clear region error
    if (localErrors.region) {
      const newErrors = { ...localErrors };
      delete newErrors.region;
      setLocalErrors(newErrors);
    }
  };

  // Handle shipping country changes
  const handleShippingCountryChange = (e) => {
    const countryCode = e.target.value;
    updateFormData({
      shippingCountry: countryCode,
      shippingRegion: "", // Reset region when country changes
    });

    // Clear country error
    if (localErrors.shippingCountry) {
      const newErrors = { ...localErrors };
      delete newErrors.shippingCountry;
      setLocalErrors(newErrors);
    }
  };

  // Handle shipping region changes
  const handleShippingRegionChange = (e) => {
    const regionCode = e.target.value;
    updateFormData({ shippingRegion: regionCode });

    // Clear region error
    if (localErrors.shippingRegion) {
      const newErrors = { ...localErrors };
      delete newErrors.shippingRegion;
      setLocalErrors(newErrors);
    }
  };

  // Basic validation before proceeding
  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.websiteURL) errors.websiteURL = "Website URL is required";

    // Password length
    if (formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Check experience fields
    if (formData.howLongCollectingComicBooksForGrading === 0)
      errors.howLongCollectingComicBooksForGrading = "This field is required";

    if (formData.howDidYouHearAboutUs === 0)
      errors.howDidYouHearAboutUs = "This field is required";

    if (
      formData.howDidYouHearAboutUs === 6 &&
      !formData.howDidYouHearAboutUsOther
    ) {
      errors.howDidYouHearAboutUsOther =
        "Please specify how you heard about us";
    }

    // Check shipping address fields if provided
    if (formData.hasShippingAddress) {
      if (!formData.shippingName)
        errors.shippingName = "Shipping name is required";
      if (!formData.shippingAddressLine1)
        errors.shippingAddressLine1 = "Shipping address is required";
      if (!formData.shippingCity) errors.shippingCity = "City is required";
      if (!formData.shippingCountry)
        errors.shippingCountry = "Country is required";
      if (!formData.shippingPostalCode)
        errors.shippingPostalCode = "Postal code is required";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = (e) => {
    e.preventDefault();

    if (validateForm()) {
      nextStep();
    }
  };

  // Check if field has error
  const hasError = (field) => Boolean(localErrors[field] || formErrors[field]);

  // Get error message for a field
  const getErrorMessage = (field) => localErrors[field] || formErrors[field];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <AdminTopNavigation />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Wizard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">Add New User</h1>
          <p className="text-gray-600">Step 2 of 3: Individual Information</p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Individual Information
              </h2>
              <p className="text-gray-600 mt-1">
                Enter information for the individual account
              </p>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              {/* Basic Account Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Account Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("email")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="user@example.com"
                        required
                      />
                      {hasError("email") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("email") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("email")}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("password")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      {hasError("password") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("password") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("password")}</span>
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters
                    </p>
                  </div>

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("firstName")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="John"
                        required
                      />
                      {hasError("firstName") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("firstName") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("firstName")}</span>
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("lastName")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="Doe"
                        required
                      />
                      {hasError("lastName") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("lastName") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("lastName")}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Account Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        style={selectStyles}
                      >
                        <option value={USER_STATUS.ACTIVE}>Active</option>
                        <option value={USER_STATUS.LOCKED}>Locked</option>
                        <option value={USER_STATUS.ARCHIVED}>Archived</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Email Verification Checkbox */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isEmailVerified"
                        name="isEmailVerified"
                        type="checkbox"
                        className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                        checked={formData.isEmailVerified}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="isEmailVerified"
                        className="font-medium text-gray-700"
                      >
                        Mark Email as Verified
                      </label>
                      <p className="text-gray-500">
                        Skip email verification process for this user
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>

                {/* Description */}
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Personal Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <Info className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        hasError("description")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="For example: Comic book collector and enthusiast with a focus on Silver Age Marvel..."
                      required
                    ></textarea>
                    {hasError("description") && (
                      <div className="absolute top-3 right-3 flex items-center pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {hasError("description") && (
                    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{getErrorMessage("description")}</span>
                    </p>
                  )}
                </div>

                {/* Website URL */}
                <div className="mb-4">
                  <label
                    htmlFor="websiteURL"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Online Presence Link <span className="text-red-500">*</span>
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
                        hasError("websiteURL")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., https://linkedin.com/in/yourprofile"
                      required
                    />
                    {hasError("websiteURL") && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Please provide a link to your personal website or a public
                    social media profile
                  </p>
                  {hasError("websiteURL") && (
                    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{getErrorMessage("websiteURL")}</span>
                    </p>
                  )}
                </div>

                {/* How did you hear about us */}
                <div className="mb-4">
                  <label
                    htmlFor="howDidYouHearAboutUs"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    How did you hear about us?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Info className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="howDidYouHearAboutUs"
                      name="howDidYouHearAboutUs"
                      value={formData.howDidYouHearAboutUs}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        hasError("howDidYouHearAboutUs")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      style={selectStyles}
                      required
                    >
                      {referralSources.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {hasError("howDidYouHearAboutUs") ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {hasError("howDidYouHearAboutUs") && (
                    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{getErrorMessage("howDidYouHearAboutUs")}</span>
                    </p>
                  )}
                </div>

                {/* Conditional field for "Other" referral source */}
                {formData.howDidYouHearAboutUs === 6 && (
                  <div className="mb-4">
                    <label
                      htmlFor="howDidYouHearAboutUsOther"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Please specify <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Info className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="howDidYouHearAboutUsOther"
                        name="howDidYouHearAboutUsOther"
                        value={formData.howDidYouHearAboutUsOther}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("howDidYouHearAboutUsOther")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="Please specify"
                        required
                      />
                      {hasError("howDidYouHearAboutUsOther") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("howDidYouHearAboutUsOther") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {getErrorMessage("howDidYouHearAboutUsOther")}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Collecting Experience */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <BookOpen
                    className="h-5 w-5 text-purple-600 mr-2"
                    aria-hidden="true"
                  />
                  <h3 className="text-md font-medium text-gray-900">
                    Comic Book Collecting Experience
                  </h3>
                </div>

                {/* How long collecting */}
                <div className="mb-4">
                  <label
                    htmlFor="howLongCollectingComicBooksForGrading"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    How long have you been collecting comic books for grading?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="howLongCollectingComicBooksForGrading"
                      name="howLongCollectingComicBooksForGrading"
                      value={formData.howLongCollectingComicBooksForGrading}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        hasError("howLongCollectingComicBooksForGrading")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      style={selectStyles}
                      required
                    >
                      {experienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {hasError("howLongCollectingComicBooksForGrading") ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {hasError("howLongCollectingComicBooksForGrading") && (
                    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        {getErrorMessage(
                          "howLongCollectingComicBooksForGrading",
                        )}
                      </span>
                    </p>
                  )}
                </div>

                {/* Experience questions */}
                <div className="space-y-4">
                  {/* Previously submitted for grading */}
                  <div>
                    <label
                      htmlFor="hasPreviouslySubmittedComicBookForGrading"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Have you previously submitted comic books for grading?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="hasPreviouslySubmittedComicBookForGrading"
                        name="hasPreviouslySubmittedComicBookForGrading"
                        value={
                          formData.hasPreviouslySubmittedComicBookForGrading
                        }
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("hasPreviouslySubmittedComicBookForGrading")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Owned graded comics */}
                  <div>
                    <label
                      htmlFor="hasOwnedGradedComicBooks"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Have you owned graded comic books?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="hasOwnedGradedComicBooks"
                        name="hasOwnedGradedComicBooks"
                        value={formData.hasOwnedGradedComicBooks}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("hasOwnedGradedComicBooks")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Regular comic book shop */}
                  <div>
                    <label
                      htmlFor="hasRegularComicBookShop"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Do you have a regular comic book shop?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="hasRegularComicBookShop"
                        name="hasRegularComicBookShop"
                        value={formData.hasRegularComicBookShop}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("hasRegularComicBookShop")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Auction Sites */}
                  <div>
                    <label
                      htmlFor="hasPreviouslyPurchasedFromAuctionSite"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Have you purchased from auction sites?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="hasPreviouslyPurchasedFromAuctionSite"
                        name="hasPreviouslyPurchasedFromAuctionSite"
                        value={formData.hasPreviouslyPurchasedFromAuctionSite}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("hasPreviouslyPurchasedFromAuctionSite")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Facebook Marketplace */}
                  <div>
                    <label
                      htmlFor="hasPreviouslyPurchasedFromFacebookMarketplace"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Have you purchased from Facebook Marketplace?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="hasPreviouslyPurchasedFromFacebookMarketplace"
                        name="hasPreviouslyPurchasedFromFacebookMarketplace"
                        value={
                          formData.hasPreviouslyPurchasedFromFacebookMarketplace
                        }
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError(
                            "hasPreviouslyPurchasedFromFacebookMarketplace",
                          )
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Comic Cons */}
                  <div>
                    <label
                      htmlFor="hasRegularlyAttendedComicConsOrCollectibleShows"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Do you attend comic cons or collectible shows?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="hasRegularlyAttendedComicConsOrCollectibleShows"
                        name="hasRegularlyAttendedComicConsOrCollectibleShows"
                        value={
                          formData.hasRegularlyAttendedComicConsOrCollectibleShows
                        }
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError(
                            "hasRegularlyAttendedComicConsOrCollectibleShows",
                          )
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                      >
                        {yesNoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ArrowDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Home
                    className="h-5 w-5 text-purple-600 mr-2"
                    aria-hidden="true"
                  />
                  <h3 className="text-md font-medium text-gray-900">
                    Address Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address Line 1 */}
                  <div>
                    <label
                      htmlFor="addressLine1"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("addressLine1")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="Street address, P.O. box, company name, c/o"
                        required
                      />
                      {hasError("addressLine1") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("addressLine1") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("addressLine1")}</span>
                      </p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label
                      htmlFor="addressLine2"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address Line 2{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("city")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="City/Town"
                        required
                      />
                      {hasError("city") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("city") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("city")}</span>
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleCountryChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("country")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        required
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
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("country") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {hasError("country") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("country")}</span>
                      </p>
                    )}
                  </div>

                  {/* Region/State */}
                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State/Province <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleRegionChange}
                        disabled={!availableRegions.length}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("region")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        } ${!availableRegions.length ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        style={selectStyles}
                        required
                      >
                        <option value="">
                          {availableRegions.length
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
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("region") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {hasError("region") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("region")}</span>
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP/Postal Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("postalCode")
                            ? "border-red-500 bg-red-50 pr-10"
                            : "border-gray-300"
                        }`}
                        placeholder="ZIP or Postal Code"
                        required
                      />
                      {hasError("postalCode") && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {hasError("postalCode") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("postalCode")}</span>
                      </p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div>
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Timezone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          hasError("timezone")
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        style={selectStyles}
                        required
                      >
                        {timezones.map((timezone) => (
                          <option key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasError("timezone") ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {hasError("timezone") && (
                      <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{getErrorMessage("timezone")}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Truck
                      className="h-5 w-5 text-purple-600 mr-2"
                      aria-hidden="true"
                    />
                    <h3 className="text-md font-medium text-gray-900">
                      Shipping Address
                    </h3>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasShippingAddress"
                      name="hasShippingAddress"
                      checked={formData.hasShippingAddress}
                      onChange={handleInputChange}
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
                  <div className="space-y-4 border-l-2 border-purple-100 pl-3 mt-4">
                    {/* Shipping Name and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping Name */}
                      <div>
                        <label
                          htmlFor="shippingName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="shippingName"
                            name="shippingName"
                            value={formData.shippingName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError("shippingName")
                                ? "border-red-500 bg-red-50 pr-10"
                                : "border-gray-300"
                            }`}
                            placeholder="Full Name"
                            required={formData.hasShippingAddress}
                          />
                          {hasError("shippingName") && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {hasError("shippingName") && (
                          <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{getErrorMessage("shippingName")}</span>
                          </p>
                        )}
                      </div>

                      {/* Shipping Phone */}
                      <div>
                        <label
                          htmlFor="shippingPhone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number{" "}
                          <span className="text-gray-400 text-xs">
                            (Optional)
                          </span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="shippingPhone"
                            name="shippingPhone"
                            value={formData.shippingPhone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Lines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping Address Line 1 */}
                      <div>
                        <label
                          htmlFor="shippingAddressLine1"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="shippingAddressLine1"
                            name="shippingAddressLine1"
                            value={formData.shippingAddressLine1}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError("shippingAddressLine1")
                                ? "border-red-500 bg-red-50 pr-10"
                                : "border-gray-300"
                            }`}
                            placeholder="Street address, P.O. box, company name, c/o"
                            required={formData.hasShippingAddress}
                          />
                          {hasError("shippingAddressLine1") && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {hasError("shippingAddressLine1") && (
                          <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>
                              {getErrorMessage("shippingAddressLine1")}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Shipping Address Line 2 */}
                      <div>
                        <label
                          htmlFor="shippingAddressLine2"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Address Line 2{" "}
                          <span className="text-gray-400 text-xs">
                            (Optional)
                          </span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Home className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="shippingAddressLine2"
                            name="shippingAddressLine2"
                            value={formData.shippingAddressLine2}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping City, Country, Region, Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping City */}
                      <div>
                        <label
                          htmlFor="shippingCity"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="shippingCity"
                            name="shippingCity"
                            value={formData.shippingCity}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError("shippingCity")
                                ? "border-red-500 bg-red-50 pr-10"
                                : "border-gray-300"
                            }`}
                            placeholder="City/Town"
                            required={formData.hasShippingAddress}
                          />
                          {hasError("shippingCity") && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {hasError("shippingCity") && (
                          <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{getErrorMessage("shippingCity")}</span>
                          </p>
                        )}
                      </div>

                      {/* Shipping Country */}
                      <div>
                        <label
                          htmlFor="shippingCountry"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Country <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="shippingCountry"
                            name="shippingCountry"
                            value={formData.shippingCountry}
                            onChange={handleShippingCountryChange}
                            className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError("shippingCountry")
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                            style={selectStyles}
                            required={formData.hasShippingAddress}
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
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {hasError("shippingCountry") ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <ArrowDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        {hasError("shippingCountry") && (
                          <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{getErrorMessage("shippingCountry")}</span>
                          </p>
                        )}
                      </div>

                      {/* Shipping Region */}
                      <div>
                        <label
                          htmlFor="shippingRegion"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          State/Province <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="shippingRegion"
                            name="shippingRegion"
                            value={formData.shippingRegion}
                            onChange={handleShippingRegionChange}
                            disabled={!availableShippingRegions.length}
                            className={`w-full pl-10 pr-10 py-2 border appearance-none rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError("shippingRegion")
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            } ${!availableShippingRegions.length ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            style={selectStyles}
                            required={formData.hasShippingAddress}
                          >
                            <option value="">
                              {availableShippingRegions.length
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
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {hasError("shippingRegion") ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <ArrowDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        {hasError("shippingRegion") && (
                          <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{getErrorMessage("shippingRegion")}</span>
                          </p>
                        )}
                      </div>

                      {/* Shipping Postal Code */}
                      <div>
                        <label
                          htmlFor="shippingPostalCode"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          ZIP/Postal Code{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="shippingPostalCode"
                            name="shippingPostalCode"
                            value={formData.shippingPostalCode}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              hasError("shippingPostalCode")
                                ? "border-red-500 bg-red-50 pr-10"
                                : "border-gray-300"
                            }`}
                            placeholder="ZIP or Postal Code"
                            required={formData.hasShippingAddress}
                          />
                          {hasError("shippingPostalCode") && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                          )}
                        </div>
                        {hasError("shippingPostalCode") && (
                          <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{getErrorMessage("shippingPostalCode")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Consent */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Terms and Consent
                </h3>

                <div className="space-y-3">
                  {/* Terms of Service */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeTermsOfService"
                        name="agreeTermsOfService"
                        type="checkbox"
                        className={`focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded ${
                          hasError("agreeTermsOfService")
                            ? "border-red-500 bg-red-50"
                            : ""
                        }`}
                        checked={formData.agreeTermsOfService}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agreeTermsOfService"
                        className="font-medium text-gray-700"
                      >
                        Terms of Service <span className="text-red-500">*</span>
                      </label>
                      <p className="text-gray-500">
                        User agrees to the Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </div>
                  {hasError("agreeTermsOfService") && (
                    <p className="text-sm text-red-600 flex items-start gap-1 pl-7">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{getErrorMessage("agreeTermsOfService")}</span>
                    </p>
                  )}

                  {/* Marketing Communications */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreePromotions"
                        name="agreePromotions"
                        type="checkbox"
                        className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                        checked={formData.agreePromotions}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agreePromotions"
                        className="font-medium text-gray-700"
                      >
                        Marketing Communications
                      </label>
                      <p className="text-gray-500">
                        User agrees to receive promotional emails and updates
                      </p>
                    </div>
                  </div>

                  {/* Third-Party Tracking */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeToTrackingAcrossThirdPartyAppsAndServices"
                        name="agreeToTrackingAcrossThirdPartyAppsAndServices"
                        type="checkbox"
                        className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                        checked={
                          formData.agreeToTrackingAcrossThirdPartyAppsAndServices
                        }
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agreeToTrackingAcrossThirdPartyAppsAndServices"
                        className="font-medium text-gray-700"
                      >
                        Third-Party Tracking
                      </label>
                      <p className="text-gray-500">
                        User agrees to tracking across third-party apps and
                        services
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  <ArrowLeft className="h-5 w-5 inline mr-1" /> Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Next <ArrowRight className="h-5 w-5 inline ml-1" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default UserAddStep2Individual;
