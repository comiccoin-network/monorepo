// UserAddStep2Admin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  UserCircle,
  Shield,
  Check,
  Phone,
  Globe,
  Clock,
  AlertCircle,
} from "lucide-react";
import countryRegionData from "country-region-data/dist/data-umd";
import {
  USER_STATUS,
  PROFILE_VERIFICATION_STATUS,
} from "../../../../hooks/useUser";

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

const UserAddStep2Admin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: 1, // USER_ROLE.ROOT = 1
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    status: USER_STATUS.ACTIVE,
    profileVerificationStatus: PROFILE_VERIFICATION_STATUS.APPROVED,
    isEmailVerified: true,
    country: "",
    region: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    agreeTermsOfService: true,
  });
  const [localErrors, setLocalErrors] = useState({});

  // Load existing form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("userAddFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData((prevData) => ({
          ...prevData,
          ...parsedData,
        }));
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

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

  // Available regions for the selected country
  const availableRegions = getRegionsForCountry(formData.country);

  // Handle country change
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      region: "", // Reset region when country changes
    }));

    // Clear country error
    if (localErrors.country) {
      const newErrors = { ...localErrors };
      delete newErrors.country;
      setLocalErrors(newErrors);
    }
  };

  // Handle region change
  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      region: regionCode,
    }));

    // Clear region error
    if (localErrors.region) {
      const newErrors = { ...localErrors };
      delete newErrors.region;
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

    // Password length
    if (formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Save form data to localStorage
      localStorage.setItem("userAddFormData", JSON.stringify(formData));
      // Navigate to next step (Role selection)
      navigate("/admin/users/add/review");
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    // Save form data before navigating
    localStorage.setItem("userAddFormData", JSON.stringify(formData));
    navigate("/admin/users/add/role"); // Assuming previous step is Role selection, adjust if needed
  };

  // Check if field has error
  const hasError = (field) => Boolean(localErrors[field]);

  // Get error message for a field
  const getErrorMessage = (field) => localErrors[field];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <AdminTopNavigation />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Wizard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">Add New User</h1>
          <p className="text-gray-600">
            Step 2 of 3: Administrator Information
          </p>

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
                Administrator Information
              </h2>
              <p className="text-gray-600 mt-1">
                Enter basic information for the administrator account
              </p>
            </div>

            <form onSubmit={handleNext} className="space-y-6">
              {/* Email and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="admin@example.com"
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
              </div>

              {/* Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* Status and Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    >
                      <option value={USER_STATUS.ACTIVE}>Active</option>
                      <option value={USER_STATUS.LOCKED}>Locked</option>
                      <option value={USER_STATUS.ARCHIVED}>Archived</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ArrowLeft className="h-5 w-5 text-gray-400 rotate-270" />
                    </div>
                  </div>
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
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    {timezones.map((timezone) => (
                      <option key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ArrowLeft className="h-5 w-5 text-gray-400 rotate-270" />
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

              {/* Form Actions */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
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

export default UserAddStep2Admin;
