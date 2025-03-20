// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router"; // Using react-router
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  console.log("🛡️ ProtectedRoute component initializing");

  const { isAuthenticated, isLoading } = useAuth();
  console.log("🔒 Protected route auth state:", { isAuthenticated, isLoading });

  // Show loading indicator while checking authentication
  if (isLoading) {
    console.log("⏳ Auth is still loading");
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("🚫 User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  console.log("✅ User authenticated, rendering protected content");
  return children;
}

export default ProtectedRoute;
