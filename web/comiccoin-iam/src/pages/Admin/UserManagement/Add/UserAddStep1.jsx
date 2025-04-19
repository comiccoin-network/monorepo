// monorepo/web/comiccoin-iam/src/pages/Admin/UserManagement/Add/UserAddStep1.jsx
import React from "react";
import { useNavigate } from "react-router";
import AdminTopNavigation from "../../../../components/AdminTopNavigation";
import AdminFooter from "../../../../components/AdminFooter";
import { Shield, Building, User, ArrowRight } from "lucide-react";
import { USER_ROLE } from "../../../../hooks/useUser";

const UserAddStep1 = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Get existing form data or initialize if none exists
    let formData = JSON.parse(localStorage.getItem("userAddFormData") || "{}");

    // Update with selected role
    formData = {
      ...formData,
      role,
    };

    // Save to localStorage
    localStorage.setItem("userAddFormData", JSON.stringify(formData));

    // Navigate based on role
    if (role === USER_ROLE.ROOT) {
      navigate("/admin/users/add/details/admin");
    } else if (role === USER_ROLE.COMPANY) {
      navigate("/admin/users/add/details/business");
    } else if (role === USER_ROLE.INDIVIDUAL) {
      navigate("/admin/users/add/details/individual");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <AdminTopNavigation />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Wizard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-purple-900">Add New User</h1>
          <p className="text-gray-600">Step 1 of 3: Select Role</p>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: "30%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Select User Type
              </h2>
              <p className="text-gray-600 mt-2">
                Choose the type of user account to create
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Administrator Role Card */}
              <div
                onClick={() => handleRoleSelect(USER_ROLE.ROOT)}
                className="bg-white rounded-lg border border-gray-200 hover:border-purple-400 shadow-sm hover:shadow-md cursor-pointer transition-all p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Administrator
                </h3>
                <p className="text-gray-600 text-sm">
                  Full access to manage users, content, and system settings.
                </p>
                <button className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                  Select <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>

              {/* Business/Retailer Role Card */}
              <div
                onClick={() => handleRoleSelect(USER_ROLE.COMPANY)}
                className="bg-white rounded-lg border border-gray-200 hover:border-purple-400 shadow-sm hover:shadow-md cursor-pointer transition-all p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Business/Retailer
                </h3>
                <p className="text-gray-600 text-sm">
                  For comic shops, retailers, and business customers.
                </p>
                <button className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                  Select <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>

              {/* Individual Role Card */}
              <div
                onClick={() => handleRoleSelect(USER_ROLE.INDIVIDUAL)}
                className="bg-white rounded-lg border border-gray-200 hover:border-purple-400 shadow-sm hover:shadow-md cursor-pointer transition-all p-6 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Individual
                </h3>
                <p className="text-gray-600 text-sm">
                  For collectors, fans, and personal users.
                </p>
                <button className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                  Select <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
};

export default UserAddStep1;
