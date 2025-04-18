// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/Add/UserAddWizardContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const UserAddWizardContext = createContext();

export const UserWizardProvider = ({ children }) => {
  const initialFormData = {
    // Basic user information
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "", // Will be set in Step 1
    phone: "",
    status: 1, // Active by default
    profileVerificationStatus: 1, // Unverified by default
    isEmailVerified: false,

    // Common fields for all roles
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    region: "",
    postalCode: "",

    // Fields for shipping address
    hasShippingAddress: false,
    shippingName: "",
    shippingPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingCountry: "",
    shippingRegion: "",
    shippingPostalCode: "",

    // Business-specific fields
    comicBookStoreName: "",
    howLongStoreOperating: 0,
    gradingComicsExperience: "",
    retailPartnershipReason: "",
    estimatedSubmissionsPerMonth: 0,
    hasOtherGradingService: 0,
    otherGradingServiceName: "",
    requestWelcomePackage: 0,
    websiteURL: "",
    description: "",

    // Individual-specific fields
    howLongCollectingComicBooksForGrading: 0,
    hasPreviouslySubmittedComicBookForGrading: 0,
    hasOwnedGradedComicBooks: 0,
    hasRegularComicBookShop: 0,
    hasPreviouslyPurchasedFromAuctionSite: 0,
    hasPreviouslyPurchasedFromFacebookMarketplace: 0,
    hasRegularlyAttendedComicConsOrCollectibleShows: 0,

    // Referral and consent fields
    howDidYouHearAboutUs: 0,
    howDidYouHearAboutUsOther: "",
    agreeTermsOfService: true,
    agreePromotions: false,
    agreeToTrackingAcrossThirdPartyAppsAndServices: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedData = localStorage.getItem("userAddWizardData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setCurrentStep(
          parseInt(localStorage.getItem("userAddWizardStep") || "0"),
        );
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        // Clear invalid data
        clearWizardData();
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem("userAddWizardData", JSON.stringify(formData));
      localStorage.setItem("userAddWizardStep", currentStep.toString());
    }
  }, [formData, currentStep]);

  const clearWizardData = () => {
    localStorage.removeItem("userAddWizardData");
    localStorage.removeItem("userAddWizardStep");
    setFormData(initialFormData);
    setCurrentStep(0);
    setFormErrors({});
    setIsSubmitting(false);
    setFormSubmitted(false);
    setCreatedUserId(null);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

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
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
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
