// utils/biometricAuth.ts
import * as LocalAuthentication from "expo-local-authentication";

/**
 * Check if the device supports biometric authentication
 * @returns Promise resolving to an object containing support info
 */
export async function checkBiometricSupport() {
  try {
    // Check if hardware supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();

    if (!compatible) {
      return {
        supported: false,
        biometryType: null,
        reason: "This device does not support biometric authentication",
      };
    }

    // Check if biometric records are saved on the device
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!enrolled) {
      return {
        supported: false,
        biometryType: null,
        reason: "No biometrics enrolled on this device",
      };
    }

    // Get the authentication type available
    const biometryType =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    const biometryTypeName = getBiometryTypeName(biometryType);

    return {
      supported: true,
      biometryType: biometryTypeName,
      reason: null,
    };
  } catch (error) {
    console.error("Error checking biometric support:", error);
    return {
      supported: false,
      biometryType: null,
      reason:
        error instanceof Error
          ? error.message
          : "Unknown error checking biometrics",
    };
  }
}

/**
 * Get a user-friendly name for the biometry type
 */
function getBiometryTypeName(types: LocalAuthentication.AuthenticationType[]) {
  if (
    types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
  ) {
    return "FaceID";
  } else if (
    types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
  ) {
    return "TouchID/Fingerprint";
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return "Iris";
  }
  return "Biometrics";
}

/**
 * Authenticate the user using biometrics
 * @param {string} promptMessage - Message to display in the authentication prompt
 * @returns {Promise<boolean>} Promise resolving to true if authentication succeeded
 */
export async function authenticateWithBiometrics(
  promptMessage: string = "Authenticate to access secure data",
): Promise<boolean> {
  try {
    // Check biometric support first
    const support = await checkBiometricSupport();

    if (!support.supported) {
      console.log("Biometric authentication not supported:", support.reason);
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Use passcode",
      disableDeviceFallback: false, // Allow device PIN/pattern as fallback
      cancelLabel: "Cancel",
    });

    return result.success;
  } catch (error) {
    console.error("Error during biometric authentication:", error);
    return false;
  }
}
