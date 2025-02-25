// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/settings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";
import { usePutUpdateMe } from "@/hooks/usePutUpdateMe";
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

// Type definitions for form data
interface FormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  timezone: string;
  wallet_address: string;
}

// Type for country/timezone options
interface SelectOption {
  value: string;
  label: string;
}

// Country options for dropdown
const countries: SelectOption[] = [
  { value: "", label: "Select a country" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
];

// Timezone options for dropdown
const timezones: SelectOption[] = [
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
];

export default function Page() {
  const router = useRouter();
  const { user } = useMe();
  const formRef = useRef<HTMLFormElement>(null);

  // Prevent iOS scroll bounce
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.body.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });

    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.removeEventListener("touchmove", preventTouchMove);
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overscrollBehavior = "";
    };
  }, []);

  // Loading state
  const [isUserLoading, setIsUserLoading] = useState(true);

  const {
    updateMe,
    isLoading: isUpdating,
    error: updateError,
    isSuccess,
    reset,
  } = usePutUpdateMe();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    timezone: "",
    wallet_address: "",
  });

  // UI state
  const [formMessage, setFormMessage] = useState("");

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
      setIsUserLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsUserLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Reset form message when update status changes
  useEffect(() => {
    if (isSuccess) {
      setFormMessage("Your settings have been updated successfully!");

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const timer = setTimeout(() => {
        reset();
        setFormMessage("");

        // Reload the page after successful update to refresh user data
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (updateError) {
      setFormMessage(
        updateError.message ||
          "An error occurred while updating your settings. Please try again.",
      );
    }
  }, [isSuccess, updateError, reset]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const apiData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        country: formData.country || null,
        timezone: formData.timezone,
      };

      await updateMe(apiData);
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Settings className="h-12 w-12 mx-auto text-purple-300" />
          </div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-purple-50 py-4 px-4 touch-manipulation"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center mb-2">
          <Settings className="h-6 w-6 text-purple-600 mr-2" />
          <h1 className="text-2xl font-bold text-purple-800">
            Account Settings
          </h1>
        </div>
        <p className="text-xs text-gray-600">
          Manage your profile and account preferences
        </p>
      </header>

      {/* Form Status Message */}
      {(isSuccess || updateError) && formMessage && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            isSuccess
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {isSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            )}
            <p className={`text-sm ${isSuccess ? "text-green-700" : "text-red-700"}`}>
              {formMessage}
            </p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Profile Information Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-base font-semibold text-purple-800">
              Profile Information
            </h2>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your email address"
              />
            </div>
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block text-xs font-medium text-gray-700 mb-1"
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Your first name"
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label
              htmlFor="last_name"
              className="block text-xs font-medium text-gray-700 mb-1"
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Your last name"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Your phone number (optional)"
              />
            </div>
          </div>
        </div>

        {/* Location Settings Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-base font-semibold text-purple-800">
              Location Settings
            </h2>
          </div>

          {/* Country */}
          <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
          <div>
            <label
              htmlFor="timezone"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Timezone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="timezone"
                name="timezone"
                required
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                {timezones.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Wallet Information Section */}
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex items-center mb-4">
      <Wallet className="h-5 w-5 text-purple-600 mr-2" />
      <h2 className="text-base font-semibold text-purple-800">
        Wallet Information
      </h2>
    </div>

    {/* Wallet Address */}
    <div>
      <label
        htmlFor="wallet_address"
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        Wallet Address
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Wallet className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          id="wallet_address"
          name="wallet_address"
          value={formData.wallet_address}
          disabled={true}
          className="w-full pl-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Your wallet address is created when you first sign up and cannot
        be changed through this form.
      </p>
    </div>
  </div>

  {/* Submit Button */}
  <div className="mt-6">
    <button
      type="submit"
      disabled={isUpdating}
      className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-70 active:scale-95"
    >
      {isUpdating ? (
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
</form>
</div>
);
}
