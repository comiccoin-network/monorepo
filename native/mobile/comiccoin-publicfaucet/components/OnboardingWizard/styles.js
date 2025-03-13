// components/OnboardingWizard/styles.js
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700; // iPhone SE or similar
const isVerySmallDevice = height < 600; // Extra small devices

// Shared styles that match the provided screenshot
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4f46e5", // Purple/blue background from screenshot
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: isVerySmallDevice ? 10 : 0,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    paddingTop: 24,
    paddingBottom: 100, // Extra space for the button and pagination dots
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  stepIndicator: {
    marginBottom: 16,
    width: "100%",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b21a8", // Purple color
    marginBottom: 6,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3e8ff", // Light purple
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 4,
  },
  iconContainer: {
    backgroundColor: "#f9f5ff", // Very light purple
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 16,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  iconText: {
    fontSize: 36,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8", // Purple
    textAlign: "center",
    marginBottom: 8,
  },
  titleSmall: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7c3aed", // Purple
    textAlign: "center",
    marginBottom: 16,
  },
  subtitleSmall: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#4b5563", // Dark gray
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  descriptionSmall: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    width: "100%",
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
  continueButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: isSmallDevice ? 12 : 20,
  },
  continueButton: {
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 12,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  buttonPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  buttonPaginationDotActive: {
    backgroundColor: "white",
    width: 8, // Same as inactive dots, per the screenshot
  },
  continueButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
  },
  loadingText: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    marginLeft: 12,
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
    paddingVertical: 14,
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

  // Additional content styling for screen 1
  additionalContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  additionalItem: {
    marginBottom: 24,
  },
  additionalTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: "600",
    color: "#6b21a8", // Purple
    marginBottom: isSmallDevice ? 6 : 8,
  },
  additionalDescription: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#4b5563", // Dark gray
    lineHeight: isSmallDevice ? 20 : 24,
    marginBottom: isSmallDevice ? 6 : 8,
  },
  websiteLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  websiteLinkText: {
    fontSize: 16,
    color: "#7c3aed", // Purple
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
    backgroundColor: "#8b5cf6", // Purple
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 280,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed", // Purple
    marginBottom: 8,
    textAlign: "center",
  },
  cloudDataDescription: {
    fontSize: 16,
    color: "#4b5563", // Dark gray
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  dataItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dataItem: {
    width: "48%", // Two items per row
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f5ff", // Very light purple
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  dataItemIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dataItemLabel: {
    fontSize: 15,
    color: "#6b21a8", // Purple
    fontWeight: "500",
  },
  additionalInfoText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280", // Gray
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  websiteBannerLink: {
    backgroundColor: "#8b5cf6", // Purple
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
  websiteBannerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  websiteBannerUrl: {
    color: "#e0e7ff", // Light purple/white
    fontSize: 14,
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
    marginTop: 16,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    marginBottom: isSmallDevice ? 16 : 20,
    alignItems: "center",
  },
  benefitIconContainer: {
    width: isSmallDevice ? 50 : 60,
    height: isSmallDevice ? 50 : 60,
    borderRadius: isSmallDevice ? 25 : 30,
    backgroundColor: "#f9f5ff", // Very light purple
    justifyContent: "center",
    alignItems: "center",
    marginRight: isSmallDevice ? 12 : 16,
  },
  benefitIcon: {
    fontSize: 28,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#7c3aed", // Purple
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 15,
    color: "#6b7280", // Gray
    lineHeight: 22,
  },
  noteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280", // Gray
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
});
