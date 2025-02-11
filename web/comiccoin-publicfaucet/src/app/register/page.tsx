"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coins, AlertCircle, ArrowLeft } from "lucide-react";
import FormTimezoneSelectField from "@/components/FormTimezoneSelectField";

// Define our form data structure
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  countryOther: string;
  timezone: string;
  password: string;
  passwordConfirm: string;
  agreeTermsOfService: boolean;
  agreePromotions: boolean;
}

// Define our form errors structure
interface FormErrors {
  [key: string]: string;
}

const RegisterPage = () => {
  const router = useRouter();
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Form state management
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    countryOther: "",
    timezone: defaultTimezone,
    password: "",
    passwordConfirm: "",
    agreeTermsOfService: false,
    agreePromotions: false,
  });

  // UI state management
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Field validation logic
  const validateField = (name: string, value: string | boolean): string => {
    switch (name) {
      case "firstName":
        if (!value.toString().trim()) return "First name is required";
        if (value.toString().length < 2)
          return "First name must be at least 2 characters";
        if (!/^[a-zA-Z\s-']+$/.test(value.toString()))
          return "First name can only contain letters, spaces, hyphens, and apostrophes";
        return "";

      case "lastName":
        if (!value.toString().trim()) return "Last name is required";
        if (value.toString().length < 2)
          return "Last name must be at least 2 characters";
        if (!/^[a-zA-Z\s-']+$/.test(value.toString()))
          return "Last name can only contain letters, spaces, hyphens, and apostrophes";
        return "";

      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString()))
          return "Please enter a valid email address";
        return "";

      case "password":
        const passwordErrors: string[] = [];
        if (!value) return "Password is required";
        if (value.toString().length < 8)
          passwordErrors.push("at least 8 characters");
        if (!/[A-Z]/.test(value.toString()))
          passwordErrors.push("one uppercase letter");
        if (!/[a-z]/.test(value.toString()))
          passwordErrors.push("one lowercase letter");
        if (!/[0-9]/.test(value.toString())) passwordErrors.push("one number");
        if (!/[!@#$%^&*]/.test(value.toString()))
          passwordErrors.push("one special character");
        return passwordErrors.length
          ? `Password must contain ${passwordErrors.join(", ")}`
          : "";

      case "passwordConfirm":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";

      case "agreeTermsOfService":
        if (!value) return "You must agree to the Terms of Service";
        return "";

      default:
        return "";
    }
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return (strength / 5) * 100;
  };

  // Form change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
      ...(name === "country" && value !== "Other" && { countryOther: "" }),
    }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (hasSubmitted) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // TODO: Implement actual OAuth 2.0 flow
      // For now, we'll just simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to success page
      router.push("/register-successful");
    } catch (error) {
      setErrors({
        // Handle actual API errors here
        general: "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coins className="h-8 w-8" />
            <span className="text-2xl font-bold">ComicCoin Faucet</span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
          {/* Form header */}
          <h1 className="text-4xl font-bold mb-8 text-purple-800 text-center">
            Register for ComicCoin
          </h1>

          {/* Error messages */}
          {hasSubmitted && Object.keys(errors).length > 0 && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please correct the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {Object.values(errors)
                        .filter(Boolean)
                        .map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200"
          >
            {/* Form fields go here - same as your original implementation but with better typing */}
            {/* ... Rest of the form implementation ... */}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4">
            © {new Date().getFullYear()} ComicCoin Faucet. All rights reserved.
          </p>
          <p>
            <Link href="/terms" className="underline hover:text-purple-200">
              Terms of Service
            </Link>{" "}
            |{" "}
            <Link href="/privacy" className="underline hover:text-purple-200">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
