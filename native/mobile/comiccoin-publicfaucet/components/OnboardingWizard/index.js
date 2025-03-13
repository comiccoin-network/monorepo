// components/OnboardingWizard/index.js
import { Platform } from "react-native";
import IOSOnboardingWizard from "./OnboardingWizard.ios";
import AndroidOnboardingWizard from "./OnboardingWizard.android";

/**
 * Platform-specific onboarding wizard that automatically selects
 * the appropriate implementation based on the platform.
 */
export default function OnboardingWizard(props) {
  return Platform.OS === "ios" ? (
    <IOSOnboardingWizard {...props} />
  ) : (
    <AndroidOnboardingWizard {...props} />
  );
}
