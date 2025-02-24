"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import {
  Settings,
  User,
  Mail,
  Phone,
  Globe,
  Clock,
  Wallet,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { API_CONFIG } from "@/config/env";

// Country options for dropdown
const countries = [
  { value: "", label: "Select a country" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  // Add more countries as needed
];

// Timezone options for dropdown
const timezones = [
  { value: "", label: "Select a timezone" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "America/Toronto", label: "Eastern Time - Toronto" },
  { value: "America/Vancouver", label: "Pacific Time - Vancouver" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  // Add more timezones as needed
];

export default function Page() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, error: userError, refetch } = useMe();
  const fetchWithAuth = useAuthenticatedFetch();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    timezone: "",
    wallet_address: "",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null); // 'success', 'error', or null
  const [formMessage, setFormMessage] = useState("");
  const [isEditable, setIsEditable] = useState(false); // To control form editability

  // Initialize form data with user data when it loads
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        country: user.country || "",
        timezone: user.timezone || "",
        wallet_address: user.wallet_address
          ? user.wallet_address.toString()
          : "",
      });
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus(null);
    setFormMessage("");

    try {
      // Prepare data for API
      const apiData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        country: formData.country || null,
        timezone: formData.timezone,
        // Note: Don't include wallet_address as it should be updated through a different flow
      };

      // Send update request
      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update settings");
      }

      // Update was successful
      setFormStatus("success");
      setFormMessage("Your settings have been updated successfully!");
      refetch(); // Refresh user data in context

      // Reset success message after a delay
      setTimeout(() => {
        setFormStatus(null);
        setFormMessage("");
      }, 5000);
    } catch (err) {
      console.error("Error updating settings:", err);
      setFormStatus("error");
      setFormMessage(
        err.message ||
          "An error occurred while updating your settings. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return <div className="py-8 text-center">Loading your settings...</div>;
  }

  if (userError) {
    return <div className="py-8 text-center">Error: {userError.message}</div>;
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        Please log in to view your settings.
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Settings className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-purple-800">
            Account Settings
          </h1>
        </div>
        <p className="text-gray-600">
          Manage your profile and account preferences
        </p>
      </header>

      {/* Form Status Message */}
      {formStatus && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            formStatus === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {formStatus === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <p
              className={
                formStatus === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {formMessage}
            </p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Information Section */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                <User className="h-5 w-5 text-purple-600 mr-2" />
                Profile Information
              </h2>
              <div className="border-b border-gray-200 mb-6"></div>
            </div>

            {/* Email */}
            <div className="col-span-1">
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
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your email address"
                />
              </div>
            </div>

            {/* First Name */}
            <div className="col-span-1">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your first name"
              />
            </div>

            {/* Last Name */}
            <div className="col-span-1">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your last name"
              />
            </div>

            {/* Phone */}
            <div className="col-span-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
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
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your phone number (optional)"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                <Globe className="h-5 w-5 text-purple-600 mr-2" />
                Location Settings
              </h2>
              <div className="border-b border-gray-200 mb-6"></div>
            </div>

            {/* Country */}
            <div className="col-span-1">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timezone */}
            <div className="col-span-1">
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
                  required
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  {timezones.map((timezone) => (
                    <option key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wallet Information Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                <Wallet className="h-5 w-5 text-purple-600 mr-2" />
                Wallet Information
              </h2>
              <div className="border-b border-gray-200 mb-6"></div>
            </div>

            {/* Wallet Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="wallet_address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Wallet Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wallet className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="wallet_address"
                  name="wallet_address"
                  value={formData.wallet_address}
                  disabled={true} // Wallet address should not be directly editable
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Your wallet address is created when you first sign up and cannot
                be changed through this form.
              </p>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full lg:w-auto bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
