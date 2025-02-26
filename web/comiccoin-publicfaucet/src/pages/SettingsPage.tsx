import React, { useState, useEffect } from "react";
import { withAuth } from "../hocs/withAuth";
import { usePutUpdateMe } from "../hooks/usePutUpdateMe";
import { useMe } from "../hooks/useMe";
import { UpdateMeRequestDTO } from "../hooks/usePutUpdateMe";

// Define country and timezone options
const countries = [
  { value: "", label: "Select a country" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" }
];

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
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" }
];

const SettingsPage: React.FC = () => {
  // Use hooks for user data and updating
  const { user, refetch } = useMe();
  const {
    updateMe,
    isLoading: isUpdating,
    error: updateError,
    isSuccess,
    reset: resetUpdateState
  } = usePutUpdateMe();

  // State for form data
  const [formData, setFormData] = useState<UpdateMeRequestDTO>({
    email: '',
    first_name: '',
    last_name: '',
    phone: null,
    country: null,
    timezone: '',
    wallet_address: ''
  });

  // State for form status and validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || null,
        country: user.country || null,
        timezone: user.timezone || '',
        wallet_address: user.wallet_address?.toString() || ''
      });
    }
  }, [user]);

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Basic validation
    let errorMessage = '';
    switch (name) {
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          errorMessage = 'Invalid email format';
        }
        break;
      case 'first_name':
      case 'last_name':
        if (value && value.length < 2) {
          errorMessage = `${name === 'first_name' ? 'First' : 'Last'} name is too short`;
        }
        break;
      case 'phone':
        if (value && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value)) {
          errorMessage = 'Invalid phone number format';
        }
        break;
    }

    // Update form data and errors
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? (value || null) : value
    }));

    // Update or clear specific field error
    setFormErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform final validation
    const errors: Record<string, string> = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    }
    if (!formData.timezone) {
      errors.timezone = 'Timezone is required';
    }

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Prepare data for submission
      const updateData: UpdateMeRequestDTO = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        timezone: formData.timezone,
        phone: formData.phone,
        country: formData.country
      };

      // Attempt to update user profile
      await updateMe(updateData);

      // Refresh user data after successful update
      await refetch();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  // Reset form message when navigating away from error/success state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess || updateError) {
      timer = setTimeout(() => {
        resetUpdateState();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess, updateError, resetUpdateState]);

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-600 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm p-6 md:p-8">
        {/* Page Layout Container */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          {/* Left Side - Header and Description */}
          <div className="border-b md:border-b-0 md:border-r border-gray-200 pr-0 md:pr-8 pb-6 md:pb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Account Settings
            </h1>
            <p className="text-sm text-gray-600">
              Manage your profile and account preferences.
              Update your personal information and keep your account details current.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="pl-0 md:pl-8">
            {/* Status Message */}
            {(isSuccess || updateError) && (
              <div className={`
                mb-4 p-3 rounded-lg
                ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
              `}>
                <p>
                  {isSuccess
                    ? 'Settings updated successfully!'
                    : updateError?.message || 'Failed to update settings'}
                </p>
              </div>
            )}

            {/* Settings Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Fields in Two Columns on Desktop */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`
                      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                      ${formErrors.first_name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'}
                    `}
                    placeholder="Enter your first name"
                  />
                  {formErrors.first_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.first_name}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`
                      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                      ${formErrors.last_name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'}
                    `}
                    placeholder="Enter your last name"
                  />
                  {formErrors.last_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`
                    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                    ${formErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-purple-500'}
                  `}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Two-Column Layout for Phone, Country, Timezone */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className={`
                      w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                      ${formErrors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'}
                    `}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className={`
                    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
                    ${formErrors.timezone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-purple-500'}
                    appearance-none
                  `}
                >
                  {timezones.map((timezone) => (
                    <option key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </option>
                  ))}
                </select>
                {formErrors.timezone && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.timezone}
                  </p>
                )}
              </div>

              {/* Wallet Address (read-only) */}
              <div>
                <label
                  htmlFor="wallet_address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Wallet Address
                </label>
                <input
                  type="text"
                  id="wallet_address"
                  name="wallet_address"
                  value={formData.wallet_address}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  placeholder="Wallet address (cannot be changed)"
                />
                <p className="text-xs text-gray-500 mt-1"
                >
                  Wallet address is automatically generated and cannot be modified
                </p>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`
                    w-full py-3 rounded-md text-white transition-colors flex items-center justify-center
                    ${isUpdating
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'}
                  `}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with the auth HOC
export default withAuth(SettingsPage);
