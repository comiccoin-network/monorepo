// src/pages/VerificationIndividualPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Shield, User, AlertCircle } from "lucide-react";

import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

// Hook to handle localStorage
const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  // Save to localStorage whenever the state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

const VerificationIndividualPage = () => {
  const navigate = useNavigate();

  // State for form data (with localStorage persistence)
  const [formData, setFormData] = useLocalStorage(
    "individual_verification_data",
    {
      // Will contain individual verification form fields
    },
  );

  // States for form handling
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation would go here

    // Example submission flow
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/verification/pending");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showButton={false} showBackButton={false} />

      <main id="main-content" className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-12 sm:py-16 lg:py-20 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Individual Verification
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-indigo-100 max-w-3xl mx-auto">
                Complete your personal identity verification
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mb-8">
            {/* Form Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
              <User className="h-7 w-7 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">
                  Individual Verification Form
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Please provide your personal information for verification
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-700 font-medium">
                    Processing your verification...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Form fields would go here */}

                  {/* This is just a placeholder for where forms would be added */}
                  <div className="p-12 text-center text-gray-500 italic">
                    Individual verification form fields would go here
                  </div>

                  {/* Form Navigation */}
                  <div className="mt-8 flex justify-between">
                    <Link
                      to="/verification"
                      className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Back
                    </Link>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
                    >
                      Submit Verification
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer
        isLoading={false}
        error={null}
        faucet={{}}
        formatBalance={(val) => val || "0"}
      />
    </div>
  );
};

export default VerificationIndividualPage;
