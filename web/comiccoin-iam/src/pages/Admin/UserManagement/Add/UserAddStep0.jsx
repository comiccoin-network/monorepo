// UserAddStep0.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUserWizard } from "./UserAddWizardContext";
import { Loader } from "lucide-react";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";

const UserAddStep0 = () => {
  const navigate = useNavigate();
  const { clearWizardData } = useUserWizard();

  // Run effect only once with empty dependency array
  useEffect(() => {
    // Clear wizard data
    clearWizardData();

    // Simple timeout to show loading indicator then navigate
    const timer = setTimeout(() => {
      navigate("/admin/users/add/role");
    }, 800);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array - runs once

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <AdminTopNavigation />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Wizard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">Add New User</h1>
          <p className="text-gray-600">Initializing...</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-12 w-12 text-purple-600 animate-spin mb-4" />
              <h2 className="text-xl font-medium text-gray-800">
                Initializing...
              </h2>
              <p className="text-gray-600 mt-2">
                Preparing the user creation wizard
              </p>
            </div>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default UserAddStep0;
