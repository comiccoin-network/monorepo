// UserAddStep3.jsx
import React, { useState } from "react";
import { useUserWizard } from "./UserAddWizardContext";
import { ArrowLeft, Check, X, AlertCircle, Save, Loader } from "lucide-react";
import {
  useUser,
  USER_ROLE,
  USER_STATUS,
  PROFILE_VERIFICATION_STATUS,
} from "../../../hooks/useUser";

const UserAddStep3 = () => {
  const {
    formData,
    prevStep,
    formErrors,
    setFormErrors,
    setIsSubmitting,
    setFormSubmitted,
    setCreatedUserId,
  } = useUserWizard();

  const { createNewUser } = useUser();
  const [isSubmitting, setLocalIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Helper to get role name
  const getRoleName = (roleId) => {
    switch (roleId) {
      case USER_ROLE.ROOT:
        return "Administrator";
      case USER_ROLE.COMPANY:
        return "Business/Retailer";
      case USER_ROLE.INDIVIDUAL:
        return "Individual";
      default:
        return "Unknown";
    }
  };

  // Helper to get status name
  const getStatusName = (statusId) => {
    switch (statusId) {
      case USER_STATUS.ACTIVE:
        return "Active";
      case USER_STATUS.LOCKED:
        return "Locked";
      case USER_STATUS.ARCHIVED:
        return "Archived";
      default:
        return "Unknown";
    }
  };

  // Helper to format data for display
  const formatValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not provided";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return value;
  };

  // Handle form submission to create user
  const handleSubmit = async () => {
    setLocalIsSubmitting(true);
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Submit to API
      const result = await createNewUser(formData);

      // Handle success
      setFormSubmitted(true);
      setCreatedUserId(result.id);
    } catch (error) {
      console.error("Error creating user:", error);

      // Extract error details
      const errorMessage = error.message || "Failed to create user";
      setSubmitError(errorMessage);

      // If there are field-specific errors, set them
      if (error.response?.data && typeof error.response.data === "object") {
        setFormErrors(error.response.data);
      }
    } finally {
      setLocalIsSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Review User Information
        </h2>
        <p className="text-gray-600 mt-1">
          Please review the information before creating the user
        </p>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="font-medium">{submitError}</p>
          </div>
        </div>
      )}

      {/* Summary sections */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Account Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatValue(formData.email)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getRoleName(formData.role)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">First Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatValue(formData.firstName)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Last Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatValue(formData.lastName)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {getStatusName(formData.status)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatValue(formData.phone)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Timezone</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatValue(formData.timezone)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Email Verified
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.isEmailVerified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <X className="h-3 w-3 mr-1" /> Not Verified
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Address Information - if provided */}
        {(formData.addressLine1 || formData.city || formData.country) && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Address Information
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Address Line 1
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(formData.addressLine1)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Address Line 2
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(formData.addressLine2)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(formData.city)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  State/Province
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(formData.region)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(formData.country)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Postal Code
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatValue(formData.postalCode)}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Role-specific information would be rendered here */}
        {/* For brevity, I'm not including all possible fields */}

        {/* Consent Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Consent Information
          </h3>
          <dl className="grid grid-cols-1 gap-y-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Terms of Service
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.agreeTermsOfService ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" /> Agreed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <X className="h-3 w-3 mr-1" /> Not Agreed
                  </span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Marketing Communications
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.agreePromotions ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" /> Opted In
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <X className="h-3 w-3 mr-1" /> Opted Out
                  </span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Third-Party Tracking
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.agreeToTrackingAcrossThirdPartyAppsAndServices ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" /> Opted In
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <X className="h-3 w-3 mr-1" /> Opted Out
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-5 w-5 inline mr-1" /> Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader className="h-5 w-5 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Create User
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UserAddStep3;
