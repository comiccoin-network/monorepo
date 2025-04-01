// src/components/withProfileVerification.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

/**
 * Higher Order Component that checks profile verification status
 * and redirects users based on their verification state
 */
function withProfileVerification(WrappedComponent) {
  function ProfileVerificationWrapper(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    console.log("🧐 withProfileVerification HOC received user:", user);

    // Define verification status constants
    const VERIFICATION_STATUS = {
      UNVERIFIED: 1, // The user's profile has not yet been submitted for verification
      SUBMITTED_FOR_REVIEW: 2, // The user's profile has been submitted and is awaiting review
      APPROVED: 3, // The user's profile has been approved
      REJECTED: 4, // The user's profile has been rejected
      // Add any other potential states your system might have
    };

    // Check the user's verification status
    const verificationStatus = React.useMemo(() => {
      const status = user?.profile_verification_status;
      console.log("🔍 Verification status check:", {
        status,
        statusName: getStatusName(status),
        pathname: location.pathname,
      });
      return status;
    }, [user?.profile_verification_status, location.pathname]);

    // Function to get status name for logging
    function getStatusName(verificationStatus) {
      switch (verificationStatus) {
        case VERIFICATION_STATUS.UNVERIFIED:
          console.log(
            "🔄 User is unverified, redirecting to verification start page",
          );
          navigate("/verification");
          break;
        case VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
          console.log(
            "🔄 User verification is pending, redirecting to verification pending page",
          );
          navigate("/verification/pending");
          break;
        case VERIFICATION_STATUS.REJECTED: // IMPORTANT: Stop redirecting status 4 users
          console.log(
            "✅ User with status 4 (REJECTED), allowing dashboard access",
          );
          // No redirect - allow access to all components
          break;
        case VERIFICATION_STATUS.APPROVED:
          console.log("✅ User is verified, allowing access to component");
          break;
        default:
          // Handle unknown status
          console.log("⚠️ Unknown verification status:", verificationStatus);
          break;
      }
    }

    // Redirect based on verification status (only on initial mount)
    useEffect(() => {
      // Skip redirects for verification flow pages
      const isVerificationFlow = location.pathname.includes("/verification");
      // Skip redirects for dashboard when status is APPROVED or REJECTED
      const isDashboard = location.pathname === "/dashboard";
      const canAccessDashboard =
        verificationStatus === VERIFICATION_STATUS.APPROVED ||
        verificationStatus === VERIFICATION_STATUS.REJECTED; // Assuming REJECTED (4) should also see dashboard

      console.log("🔍 withProfileVerification navigation check:", {
        verificationStatus,
        isVerificationFlow,
        isDashboard,
        canAccessDashboard,
        pathname: location.pathname,
      });

      // Only handle redirects if we have a user object and not already in verification flow
      if (!isVerificationFlow && user) {
        // If trying to access dashboard with correct status, allow it
        if (isDashboard && canAccessDashboard) {
          console.log("✅ User has proper verification status for dashboard");
          return; // Don't redirect
        }

        // Otherwise apply normal redirection rules
        switch (verificationStatus) {
          case VERIFICATION_STATUS.UNVERIFIED:
            console.log(
              "🔄 User is unverified, redirecting to verification start page",
            );
            navigate("/verification");
            break;
          case VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
            console.log(
              "🔄 User verification is pending, redirecting to verification pending page",
            );
            navigate("/verification/pending");
            break;
          case VERIFICATION_STATUS.REJECTED: // Value is 4
            // Allow access to dashboard, don't redirect to the rejected page
            if (!isDashboard) {
              console.log(
                "🔄 User verification was rejected, redirecting to verification rejected page",
              );
              navigate("/verification/rejected");
            }
            break;
          case VERIFICATION_STATUS.APPROVED:
            // No redirection needed for approved users, they can access the wrapped component
            console.log("✅ User is verified, allowing access to component");
            break;
          default:
            // If status is unknown, don't redirect
            console.log("⚠️ Unknown verification status:", verificationStatus);
            break;
        }
      }
    }, [user, verificationStatus, location.pathname, navigate]);

    // Pass verification information to the wrapped component
    return (
      <WrappedComponent
        {...props}
        isVerified={verificationStatus === VERIFICATION_STATUS.APPROVED}
        verificationStatus={verificationStatus}
      />
    );
  }

  // Set display name for easier debugging
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  ProfileVerificationWrapper.displayName = `withProfileVerification(${displayName})`;

  return React.memo(ProfileVerificationWrapper);
}

export default withProfileVerification;
