// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Move the navigation to useEffect instead of doing it during render
  useEffect(() => {
    // Only redirect if authenticated
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginRequest = {
        email,
        password,
      };

      await login(loginRequest);
      // The redirect will happen in the useEffect when isAuthenticated changes
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Rest of your component remains the same */}
    </div>
  );
}

export default LoginPage;
