// components/OnboardingWizard.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Linking,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  isAvailable,
} from "expo-tracking-transparency";

const { width, height } = Dimensions.get("window");

// Download links
const APP_LINKS = {
  ios: "https://apps.apple.com/ca/app/comiccoin-wallet/id6741118881",
  android:
    "https://play.google.com/store/apps/details?id=com.theshootingstarpress.comiccoinwallet",
  web: "https://comiccoinwallet.com",
};

// Define the wizard screens
const WIZARD_SCREENS = [
  {
    id: "1",
    title: "Welcome to ComicCoin Public Faucet",
    subtitle: "Claim Free ComicCoins Daily",
    description:
      "This app allows you to claim free ComicCoins every day simply by logging in and pressing a button.",
    additionalContent: [
      {
        title: "What is ComicCoin?",
        description:
          "ComicCoin is an open-source blockchain project utilizing a Proof of Authority consensus mechanism. This ensures fast, efficient, and environmentally friendly transactions while maintaining security and transparency. Our code is public, auditable, and community-driven.",
      },
      {
        title: "Learn More",
        description:
          "Visit our website to discover more about the ComicCoin ecosystem and how it benefits comic collectors and creators.",
        websiteUrl: "https://comiccoinnetwork.com",
      },
    ],
    icon: "🎁",
  },
  {
    id: "2",
    title: "Download ComicCoin Wallet",
    subtitle: "Required Companion App",
    description:
      "To claim ComicCoins, you need a wallet app. Choose one option below:",
    walletOptions: [
      {
        title: `Download for ${Platform.OS === "ios" ? "iOS" : "Android"}`,
        description: "Get the app on your phone",
        url: Platform.OS === "ios" ? APP_LINKS.ios : APP_LINKS.android,
        icon: "📱",
      },
      {
        title: "Use Web Wallet",
        description: "No download needed",
        url: APP_LINKS.web,
        icon: "🌐",
      },
    ],
    icon: "⬇️",
  },
  {
    id: "3",
    title: "About ComicCoin Public Faucet",
    subtitle: "Your Gateway to Free ComicCoins",
    description:
      "ComicCoin Public Faucet is a free cloud service that distributes ComicCoins to registered users.",
    websiteUrl: "http://comiccoinfaucet.com",
    cloudDataInfo: {
      title: "Data Stored in the Cloud",
      description:
        "This app communicates with our web service. The following information is stored securely in our cloud infrastructure:",
      dataItems: [
        { label: "Name", icon: "📝" },
        { label: "Email", icon: "✉️" },
        { label: "Phone Number", icon: "📱" },
        { label: "Country", icon: "🌎" },
        { label: "Timezone", icon: "🕒" },
        { label: "Wallet Address", icon: "💼" },
      ],
    },
    additionalInfo:
      "We collect this information to prevent fraudulent activity and maintain the integrity of the ComicCoin distribution system. If you opt in to marketing communications, we may also use your data to share the latest ComicCoin developments with you.",
    icon: "☁️",
  },
  {
    id: "4",
    title: "Turn on tracking allows us to provide features like:",
    subtitle: "",
    description: "",
    trackingBenefits: [
      {
        title: "Secure account registration",
        description: "Create and verify your ComicCoin account",
        icon: "👤",
      },
      {
        title: "Personalized login experience",
        description: "Access your account smoothly and securely",
        icon: "🔑",
      },
      {
        title: "Daily coin claiming",
        description: "Ensure fair distribution of ComicCoins",
        icon: "🎁",
      },
    ],
    note: "You can change this option later in the Settings app.",
    icon: "🛡️",
  },
];

const OnboardingWizard = ({ onComplete, navigation, router }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingUrlTitle, setPendingUrlTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const flatListRef = useRef();

  const handleOpenLink = (url, title = "") => {
    setPendingUrl(url);
    setPendingUrlTitle(title);
    setLinkModalVisible(true);
  };

  const confirmOpenLink = () => {
    Linking.openURL(pendingUrl);
    setLinkModalVisible(false);
  };

  const cancelOpenLink = () => {
    setLinkModalVisible(false);
    setPendingUrl("");
    setPendingUrlTitle("");
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {index + 1} of {WIZARD_SCREENS.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((index + 1) / WIZARD_SCREENS.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          {/* Title and subtitle */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Additional content for screen 1 */}
          {item.additionalContent && (
            <View style={styles.additionalContainer}>
              {item.additionalContent.map((content, contentIndex) => (
                <View key={contentIndex} style={styles.additionalItem}>
                  <Text style={styles.additionalTitle}>{content.title}</Text>
                  <Text style={styles.additionalDescription}>
                    {content.description}
                  </Text>

                  {content.websiteUrl && (
                    <TouchableOpacity
                      style={styles.websiteLink}
                      onPress={() =>
                        handleOpenLink(content.websiteUrl, "Website")
                      }
                    >
                      <Text style={styles.websiteLinkText}>
                        {content.websiteUrl}
                      </Text>
                      <Text style={{ color: "#7c3aed", marginLeft: 5 }}>
                        ↗️
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Wallet options for screen 2 */}
          {item.walletOptions && (
            <View style={styles.optionsContainer}>
              {item.walletOptions.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={styles.optionButton}
                  onPress={() =>
                    handleOpenLink(
                      option.url,
                      optionIndex === 0 ? "App Store" : "Web Browser",
                    )
                  }
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={styles.optionText}>{option.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Cloud data info for screen 3 */}
          {item.cloudDataInfo && (
            <View style={styles.cloudDataContainer}>
              <Text style={styles.cloudDataTitle}>
                {item.cloudDataInfo.title}
              </Text>
              <Text style={styles.cloudDataDescription}>
                {item.cloudDataInfo.description}
              </Text>

              <View style={styles.dataItemsContainer}>
                {item.cloudDataInfo.dataItems.map((dataItem, index) => (
                  <View key={index} style={styles.dataItem}>
                    <Text style={styles.dataItemIcon}>{dataItem.icon}</Text>
                    <Text style={styles.dataItemLabel}>{dataItem.label}</Text>
                  </View>
                ))}
              </View>

              {item.additionalInfo && (
                <Text style={styles.additionalInfoText}>
                  {item.additionalInfo}
                </Text>
              )}

              {item.websiteUrl && (
                <TouchableOpacity
                  style={styles.websiteBannerLink}
                  onPress={() =>
                    handleOpenLink(item.websiteUrl, "ComicCoin Faucet Website")
                  }
                >
                  <Text style={styles.websiteBannerText}>
                    Visit ComicCoin Faucet
                  </Text>
                  <Text style={styles.websiteBannerUrl}>{item.websiteUrl}</Text>
                  <Text style={styles.websiteBannerIcon}>↗️</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Tracking benefits for screen 4 */}
          {item.trackingBenefits && (
            <View style={styles.trackingContainer}>
              {item.trackingBenefits.map((benefit, benefitIndex) => (
                <View key={benefitIndex} style={styles.benefitItem}>
                  <View style={styles.benefitIconContainer}>
                    <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              ))}

              {item.note && <Text style={styles.noteText}>{item.note}</Text>}
            </View>
          )}
        </View>
      </View>
    );
  };

  const goToNextSlide = () => {
    if (currentIndex < WIZARD_SCREENS.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  // Function to request tracking permission
  const requestTrackingPermission = async () => {
    try {
      setIsLoading(true);

      // iOS requires a delay after the component mounts
      if (Platform.OS === "ios") {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const { status } = await requestTrackingPermissionsAsync();
      setPermissionStatus(status);
      setIsLoading(false);

      if (status === "granted") {
        // Permission granted, navigate to main app
        if (typeof onComplete === "function") {
          onComplete();
        } else if (navigation) {
          navigation.replace("index");
        } else if (router) {
          router.replace("/");
        }
      } else {
        // Permission denied, show modal
        setPermissionModalVisible(true);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error requesting tracking permission:", error);
      Alert.alert(
        "Error",
        "There was a problem requesting tracking permissions. Please try again.",
      );
    }
  };

  const completeOnboarding = async () => {
    try {
      // Mark the onboarding as completed
      await AsyncStorage.setItem("@onboarding_completed", "true");

      // Now request tracking permissions
      requestTrackingPermission();
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      // Even if there's an error saving the status, try to proceed
      requestTrackingPermission();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4f46e5", "#4338ca"]}
        style={styles.background}
      />

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={WIZARD_SCREENS}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(
              event.nativeEvent.contentOffset.x / width,
            );
            setCurrentIndex(newIndex);
          }}
          scrollEnabled={false}
        />

        {/* Navigation dots */}
        <View style={styles.pagination}>
          {WIZARD_SCREENS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Single Continue button */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={goToNextSlide}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* External link warning modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={linkModalVisible}
        onRequestClose={cancelOpenLink}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>↗️</Text>
            </View>

            <Text style={styles.modalTitle}>Open External Link</Text>

            <Text style={styles.modalText}>
              You are about to leave this app to open:
            </Text>

            <Text style={styles.modalLinkText}>{pendingUrl}</Text>

            <Text style={styles.modalText}>Continue?</Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={cancelOpenLink}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={confirmOpenLink}
              >
                <Text style={styles.modalPrimaryButtonText}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Permission Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={permissionModalVisible}
        onRequestClose={() => setPermissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>🛡️</Text>
            </View>

            <Text style={styles.modalTitle}>Permission Required</Text>

            <Text style={styles.modalText}>
              ComicCoin Public Faucet requires tracking permission to ensure
              each user can claim coins only once per day and prevent duplicate
              claims.
            </Text>

            <Text style={styles.modalText}>
              Without this permission, we cannot verify your unique identity and
              you won't be able to claim your daily ComicCoins.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSecondaryButton]}
                onPress={() => setPermissionModalVisible(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={() => {
                  setPermissionModalVisible(false);
                  // On iOS, we need to direct users to settings
                  if (Platform.OS === "ios") {
                    Alert.alert(
                      "Permission Required",
                      "Please enable tracking in your device settings to use ComicCoin Public Faucet.",
                      [
                        {
                          text: "OK",
                          onPress: () => console.log("OK Pressed"),
                        },
                      ],
                    );
                  } else {
                    // On Android, we can request again
                    requestTrackingPermission();
                  }
                }}
              >
                <Text style={styles.modalPrimaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Requesting permission...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  // Additional content styling (Screen 1)
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
  // Wallet options styling (Screen 2)
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
  // Tracking benefits styling (Screen 3) - Updated to match design
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
  // Personal Information styling (Screen 3)
  personalInfoContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#f9f5ff",
    padding: 16,
    borderRadius: 12,
  },
  personalInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b21a8",
    marginBottom: 8,
  },
  personalInfoDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  personalInfoItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: "#7c3aed",
    marginRight: 8,
  },
  personalInfoText: {
    fontSize: 14,
    color: "#4b5563",
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
  // Navigation
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
  // Cloud data styling (Screen 3)
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
    width: "48%",
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
});

export default OnboardingWizard;
