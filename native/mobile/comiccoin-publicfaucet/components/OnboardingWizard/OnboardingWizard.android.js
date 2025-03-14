// components/OnboardingWizard/OnboardingWizard.android.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  BackHandler,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COMMON_SCREENS,
  markOnboardingComplete,
  navigateAfterOnboarding,
} from "./commonScreens";
import styles from "./styles";
import ExternalLinkModal from "./ExternalLinkModal";

const { width } = Dimensions.get("window");

// For Android, we only use the first 3 common screens - no tracking page
const WIZARD_SCREENS = COMMON_SCREENS.slice(0, 3);

/**
 * Android-specific implementation of the onboarding wizard
 * Simplified to only 3 pages (no tracking page)
 */
const AndroidOnboardingWizard = ({ onComplete, navigation, router }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingUrlTitle, setPendingUrlTitle] = useState("");

  const flatListRef = useRef(null);

  // Complete onboarding and navigate to the main app
  const completeOnboarding = useCallback(async () => {
    try {
      const success = await markOnboardingComplete();
      console.log("Onboarding complete, success:", success);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }

    // Navigate to app
    navigateAfterOnboarding(onComplete, navigation, router);
  }, [onComplete, navigation, router]);

  // Handle next slide with reliable behavior
  const goToNextSlide = useCallback(() => {
    if (currentIndex < WIZARD_SCREENS.length - 1) {
      // Not the last screen, move to next screen
      const nextIndex = currentIndex + 1;

      // Use the flatListRef to scroll
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0,
        });
      }

      // Update the current index
      setCurrentIndex(nextIndex);
    } else {
      // We're on the last screen, complete onboarding
      completeOnboarding();
    }
  }, [currentIndex, completeOnboarding]);

  // Handle external link press with confirmation modal
  const handleOpenLink = (url, title = "") => {
    setPendingUrl(url);
    setPendingUrlTitle(title);
    setLinkModalVisible(true);
  };

  // Handle hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Prevent going back during onboarding
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  // Render a screen in the wizard
  const renderItem = ({ item }) => {
    // Get progress percentage for the step indicator
    const stepNumber = parseInt(item.id.replace(/\D/g, ""), 10);
    const progressPercent = (stepNumber / 3) * 100; // Adjusted to 3 total steps

    return (
      <View style={[androidStyles.slide, { width }]}>
        <View style={androidStyles.card}>
          {/* Step indicator */}
          <View style={androidStyles.stepContainer}>
            <Text style={androidStyles.stepText}>Step {stepNumber} of 3</Text>
            <View style={androidStyles.progressBar}>
              <View
                style={[
                  androidStyles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>

          {/* Icon */}
          <View style={androidStyles.iconContainer}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          {/* Title and subtitle */}
          <Text style={androidStyles.title}>{item.title}</Text>

          {item.subtitle && (
            <Text style={androidStyles.subtitle}>{item.subtitle}</Text>
          )}

          {item.description && (
            <Text style={androidStyles.description}>{item.description}</Text>
          )}

          {/* Additional content for screen 1 */}
          {item.additionalContent && (
            <View style={androidStyles.additionalContainer}>
              {item.additionalContent.map((content, contentIndex) => (
                <View key={contentIndex} style={androidStyles.additionalItem}>
                  <Text style={androidStyles.additionalTitle}>
                    {content.title}
                  </Text>
                  <Text style={androidStyles.additionalDescription}>
                    {content.description}
                  </Text>

                  {content.websiteUrl && (
                    <TouchableOpacity
                      style={androidStyles.websiteLink}
                      onPress={() =>
                        handleOpenLink(content.websiteUrl, "Website")
                      }
                    >
                      <Text style={androidStyles.websiteLinkText}>
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
            <View style={androidStyles.optionsContainer}>
              {item.walletOptions.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={androidStyles.optionButton}
                  onPress={() =>
                    handleOpenLink(
                      option.url,
                      optionIndex === 0 ? "Play Store" : "Web Browser",
                    )
                  }
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={androidStyles.optionText}>{option.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Cloud data info for screen 3 */}
          {item.cloudDataInfo && (
            <View style={androidStyles.cloudDataContainer}>
              <Text style={androidStyles.cloudDataTitle}>
                {item.cloudDataInfo.title}
              </Text>
              <Text style={androidStyles.cloudDataDescription}>
                {item.cloudDataInfo.description}
              </Text>

              <View style={androidStyles.dataItemsContainer}>
                {item.cloudDataInfo.dataItems.map((dataItem, index) => (
                  <View key={index} style={androidStyles.dataItem}>
                    <Text style={styles.dataItemIcon}>{dataItem.icon}</Text>
                    <Text style={androidStyles.dataItemLabel}>
                      {dataItem.label}
                    </Text>
                  </View>
                ))}
              </View>

              {item.additionalInfo && (
                <Text style={androidStyles.additionalInfoText}>
                  {item.additionalInfo}
                </Text>
              )}
            </View>
          )}

          {/* Continue button */}
          <View style={androidStyles.buttonContainer}>
            <TouchableOpacity
              style={androidStyles.continueButton}
              onPress={goToNextSlide}
              activeOpacity={0.7}
            >
              <Text style={androidStyles.continueButtonText}>
                {currentIndex === WIZARD_SCREENS.length - 1
                  ? "Get Started"
                  : "Continue"}
              </Text>
            </TouchableOpacity>

            {/* Pagination dots */}
            <View style={androidStyles.dotsContainer}>
              {WIZARD_SCREENS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    androidStyles.dot,
                    index === currentIndex && androidStyles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={androidStyles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4f46e5"
        translucent={true}
      />

      <LinearGradient
        colors={["#4f46e5", "#4338ca"]}
        style={androidStyles.background}
      />

      <FlatList
        ref={flatListRef}
        data={WIZARD_SCREENS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // Disable user scrolling entirely
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* External link modal */}
      <ExternalLinkModal
        visible={linkModalVisible}
        onClose={() => setLinkModalVisible(false)}
        url={pendingUrl}
        title={pendingUrlTitle}
      />
    </View>
  );
};

// Android-specific styles that match iOS design
const androidStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4f46e5", // Purple background
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  slide: {
    width: width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    maxWidth: 500,
    elevation: 5, // Android shadow
  },
  // Step indicator and progress bar
  stepContainer: {
    width: "100%",
    marginBottom: 16,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7c3aed", // Purple
    textAlign: "center",
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3e8ff", // Light purple
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 4,
  },
  // Icon
  iconContainer: {
    backgroundColor: "#f3f4ff", // Very light blue/purple
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7c3aed", // Purple
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7c3aed", // Purple
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563", // Dark gray
    textAlign: "center",
    marginBottom: 24,
  },
  // Button styles
  buttonContainer: {
    width: "100%",
    marginTop: 24,
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 100, // Fully rounded
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    elevation: 2, // Android shadow
    marginBottom: 20,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  // Pagination dots
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb", // Light gray
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#7c3aed", // Purple
  },
  // Additional content styling
  additionalContainer: {
    width: "100%",
    marginBottom: 16,
  },
  additionalItem: {
    marginBottom: 16,
  },
  additionalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed", // Purple
    marginBottom: 8,
  },
  additionalDescription: {
    fontSize: 16,
    color: "#4b5563", // Dark gray
    marginBottom: 8,
    lineHeight: 24,
  },
  websiteLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  websiteLinkText: {
    fontSize: 16,
    color: "#7c3aed", // Purple
    textDecorationLine: "underline",
  },
  // Wallet options
  optionsContainer: {
    width: "100%",
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2, // Android shadow
  },
  optionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  // Cloud data section
  cloudDataContainer: {
    width: "100%",
    marginBottom: 16,
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
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4ff", // Very light purple
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  dataItemLabel: {
    fontSize: 14,
    color: "#7c3aed", // Purple
    marginLeft: 8,
  },
  additionalInfoText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6b7280", // Gray
    textAlign: "center",
    marginBottom: 16,
  },
  websiteBannerLink: {
    backgroundColor: "#7c3aed", // Purple
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  websiteBannerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  websiteBannerUrl: {
    color: "#e0e7ff", // Very light purple
    fontSize: 14,
  },
  websiteBannerIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
    color: "white",
    fontSize: 16,
  },
});

export default AndroidOnboardingWizard;
