// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/Add/UserAddWizardContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const UserAddWizardContext = createContext();

export const UserWizardProvider = ({ children }) => {
  const initialFormData = {
    // Basic user information
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "",
    phone: "",
    status: 1, // Active by default
    profileVerificationStatus: 1, // Unverified by default
    isEmailVerified: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    // Other fields...
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);

  // Load data from localStorage on init
  useEffect(() => {
    const savedData = localStorage.getItem("userAddWizardData");
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("userAddWizardData", JSON.stringify(formData));
  }, [formData]);

  // Reset all data
  const clearWizardData = () => {
    localStorage.removeItem("userAddWizardData");
    setFormData(initialFormData);
    setFormErrors({});
    setFormSubmitted(false);
    setCreatedUserId(null);
  };

  // Update form data
  const updateFormData = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  return (
    <UserAddWizardContext.Provider
      value={{
        formData,
        updateFormData,
        clearWizardData,
        formErrors,
        setFormErrors,
        isSubmitting,
        setIsSubmitting,
        formSubmitted,
        setFormSubmitted,
        createdUserId,
        setCreatedUserId,
      }}
    >
      {children}
    </UserAddWizardContext.Provider>
  );
};

export const useUserWizard = () => {
  const context = useContext(UserAddWizardContext);
  if (!context) {
    throw new Error("useUserWizard must be used within a UserWizardProvider");
  }
  return context;
};
