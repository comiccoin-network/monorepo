// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/Add/UserAddWizard.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserWizard } from "./UserAddWizardContext";
import AdminTopNavigation from "../../../components/AdminTopNavigation";
import AdminFooter from "../../../components/AdminFooter";
import UserAddStep0 from "./UserAddStep0";
import UserAddStep1 from "./UserAddStep1";
import UserAddStep2Admin from "./UserAddStep2Admin";
import UserAddStep2Business from "./UserAddStep2Business";
import UserAddStep2Individual from "./UserAddStep2Individual";
import UserAddStep3 from "./UserAddStep3";
import { USER_ROLE } from "../../../hooks/useUser";

// This is the main container component for the user add wizard
const UserAddWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentStep,
    setCurrentStep,
    formData,
    formSubmitted,
    createdUserId,
  } = useUserWizard();

  // If the form was submitted successfully, redirect to the user details page
  useEffect(() => {
    if (formSubmitted && createdUserId) {
      navigate(`/users/${createdUserId}`);
    }
  }, [formSubmitted, createdUserId, navigate]);

  // Sync the URL with the current step
  useEffect(() => {
    const step = parseInt(location.pathname.split("/").pop(), 10);
    if (!isNaN(step) && step >= 0 && step <= 3 && step !== currentStep) {
      setCurrentStep(step);
    }
  }, [location, setCurrentStep, currentStep]);

  // Update the URL when the step changes
  useEffect(() => {
    navigate(`/users/add/${currentStep}`, { replace: true });
  }, [currentStep, navigate]);

  // Determine which step component to render based on role and current step
  const renderStepComponent = () => {
    if (currentStep === 0) return <UserAddStep0 />;
    if (currentStep === 1) return <UserAddStep1 />;

    if (currentStep === 2) {
      if (formData.role === USER_ROLE.ROOT) {
        return <UserAddStep2Admin />;
      } else if (formData.role === USER_ROLE.COMPANY) {
        return <UserAddStep2Business />;
      } else if (formData.role === USER_ROLE.INDIVIDUAL) {
        return <UserAddStep2Individual />;
      } else {
        // If no valid role, go back to step 1
        navigate("/users/add/1");
        return null;
      }
    }

    if (currentStep === 3) return <UserAddStep3 />;

    return null;
  };

  // Function to get the step name based on current step
  const getStepName = () => {
    switch (currentStep) {
      case 0:
        return "Initializing";
      case 1:
        return "Select Role";
      case 2:
        return "User Details";
      case 3:
        return "Review & Submit";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <AdminTopNavigation />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Wizard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">Add New User</h1>
          <p className="text-gray-600">
            Step {currentStep} of 3: {getStepName()}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.max((currentStep - 1) * 33.33, 0)}%` }}
            ></div>
          </div>
        </div>

        {/* The current step component */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {renderStepComponent()}
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default UserAddWizard;
