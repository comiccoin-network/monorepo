// components/OnboardingWizard/styles.js
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Shared styles used by both iOS and Android implementations
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  slideContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  completionSlide: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  stepIndicator: {
    marginBottom: 12,
    width: "100%",
  },
  stepText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b21a8",
    marginBottom: 6,
    textAlign: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f3e8ff",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 3,
  },
  iconContainer: {
    backgroundColor: "#f9f5ff",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignSelf: "center",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 36,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#7c3aed",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "white",
    width: 16,
  },
  navigationContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  continueButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalIconContainer: {
    backgroundColor: "#f9f5ff",
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  modalLinkText: {
    fontSize: 16,
    color: "#7c3aed",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },
  modalPrimaryButton: {
    backgroundColor: "#7c3aed",
  },
  modalPrimaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalSecondaryButton: {
    backgroundColor: "#f3e8ff",
  },
  modalSecondaryButtonText: {
    color: "#7c3aed",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b21a8",
    fontWeight: "500",
  },
  // Additional content styling for screen 1
  additionalContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  additionalItem: {
    marginBottom: 16,
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b21a8",
    marginBottom: 4,
  },
  additionalDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  websiteLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  websiteLinkText: {
    fontSize: 14,
    color: "#7c3aed",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  // Wallet options styling for screen 2
  optionsContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    gap: 16,
  },
  optionButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 240,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  optionIcon: {
    fontSize: 20,
    color: "white",
    marginRight: 12,
  },
  optionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Cloud data styling for screen 3
  cloudDataContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  cloudDataTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#7c3aed",
    marginBottom: 4,
    textAlign: "center",
  },
  cloudDataDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 20,
  },
  dataItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dataItem: {
    width: "48%", // This ensures two items per row with a small gap
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f5ff",
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  dataItemIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dataItemLabel: {
    fontSize: 15,
    color: "#6b21a8",
    fontWeight: "500",
  },
  additionalInfoText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 18,
  },
  websiteBannerLink: {
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  websiteBannerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  websiteBannerUrl: {
    color: "#e0e7ff",
    fontSize: 13,
  },
  websiteBannerIcon: {
    color: "white",
    fontSize: 16,
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -8,
  },
  // Tracking benefits styling for iOS screen 4
  trackingContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "center",
  },
  benefitIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f9f5ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  benefitIcon: {
    fontSize: 28,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  noteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
});
