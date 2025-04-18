// UserAddStep0.jsx
import React, { useEffect } from "react";
import { useUserWizard } from "./UserAddWizardContext";
import { Loader } from "lucide-react";

// This component clears all cached data and redirects to the first step
const UserAddStep0 = () => {
  const { clearWizardData, nextStep } = useUserWizard();

  useEffect(() => {
    const initialize = async () => {
      // Clear all wizard data
      await clearWizardData();

      // Redirect to step 1 after a brief delay
      setTimeout(() => {
        nextStep();
      }, 500);
    };

    initialize();
  }, [clearWizardData, nextStep]);

  return (
    <div className="p-6 text-center">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="h-12 w-12 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-800">Initializing...</h2>
        <p className="text-gray-600 mt-2">Preparing the user creation wizard</p>
      </div>
    </div>
  );
};

export default UserAddStep0;
