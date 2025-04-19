// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/Add/UserAddWizard.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUserWizard } from "./UserAddWizardContext";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";
import UserAddStep0 from "./UserAddStep0";
import UserAddStep1 from "./UserAddStep1";
import UserAddStep2Admin from "./UserAddStep2Admin";
import UserAddStep2Business from "./UserAddStep2Business";
import UserAddStep2Individual from "./UserAddStep2Individual";
import UserAddStep3 from "./UserAddStep3";
import { USER_ROLE } from "../../../../hooks/useUser";

const UserAddWizard = () => {
  const navigate = useNavigate();
  const { step } = useParams();
  const {
    currentStep,
    setCurrentStep,
    formData,
    formSubmitted,
    createdUserId,
  } = useUserWizard();

  // If submitted successfully, redirect to user details
  useEffect(() => {
    if (formSubmitted && createdUserId) {
      navigate(`/admin/users/${createdUserId}`);
    }
  }, [formSubmitted, createdUserId, navigate]);

  // Sync URL param with state
  useEffect(() => {
    const stepNum = parseInt(step, 10);
    if (!isNaN(stepNum) && stepNum >= 0 && stepNum <= 3) {
      setCurrentStep(stepNum);
    }
  }, [step, setCurrentStep]);

  // Update URL when step changes
  useEffect(() => {
    navigate(`/admin/users/add/${currentStep}`, { replace: true });
  }, [currentStep, navigate]);

  // Render the current step component
  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <UserAddStep0 />;
      case 1:
        return <UserAddStep1 />;
      case 2:
        if (formData.role === USER_ROLE.ROOT) return <UserAddStep2Admin />;
        if (formData.role === USER_ROLE.COMPANY)
          return <UserAddStep2Business />;
        if (formData.role === USER_ROLE.INDIVIDUAL)
          return <UserAddStep2Individual />;
        return <UserAddStep1 />; // Fallback to role selection if no valid role
      case 3:
        return <UserAddStep3 />;
      default:
        return <UserAddStep0 />;
    }
  };

  // Get step name for display
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
            Step {currentStep === 0 ? 1 : currentStep} of 3: {getStepName()}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.max((currentStep - 1) * 33.33, 0)}%` }}
            ></div>
          </div>
        </div>

        {/* Current step component */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {renderStepComponent()}
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default UserAddWizard;
