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
    };

    // Check the user's verification status
    const verificationStatus = React.useMemo(() => {
      const status = user?.profile_verification_status;
      console.log("🔍 Verification status check:", {
        status,
        statusName: getStatusName(status),
      });
      return status;
    }, [user?.profile_verification_status]);

    // Function to get status name for logging
    function getStatusName(status) {
      switch (status) {
        case VERIFICATION_STATUS.UNVERIFIED:
          return "UNVERIFIED";
        case VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
          return "SUBMITTED_FOR_REVIEW";
        case VERIFICATION_STATUS.APPROVED:
          return "APPROVED";
        case VERIFICATION_STATUS.REJECTED:
          return "REJECTED";
        default:
          return "UNKNOWN";
      }
    }

    // Redirect based on verification status (only on initial mount)
    useEffect(() => {
      // Skip redirects for verification flow pages
      const isVerificationFlow = location.pathname.includes("/verification");

      console.log("🔍 withProfileVerification check:", {
        verificationStatus,
        isVerificationFlow,
        pathname: location.pathname,
      });

      if (!isVerificationFlow && user) {
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
          case VERIFICATION_STATUS.REJECTED:
            console.log(
              "🔄 User verification was rejected, redirecting to verification rejected page",
            );
            navigate("/verification/rejected");
            break;
          case VERIFICATION_STATUS.APPROVED:
            // No redirection needed for approved users, they can access the wrapped component
            console.log("✅ User is verified, allowing access to component");
            break;
          default:
            // Handle edge case - if no status or unknown status
            console.log(
              "⚠️ Unknown verification status, defaulting to unverified flow",
            );
            navigate("/verification");
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
