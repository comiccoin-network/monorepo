// components/OnboardingWizard/OnboardingWizard.android.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  COMMON_SCREENS,
  ANDROID_COMPLETION_SCREEN,
  markOnboardingComplete,
  navigateAfterOnboarding,
} from "./commonScreens";
import styles from "./styles";
import ExternalLinkModal from "./ExternalLinkModal";

const { width } = Dimensions.get("window");

// Full list of screens for Android
const WIZARD_SCREENS = [...COMMON_SCREENS, ANDROID_COMPLETION_SCREEN];

/**
 * Android-specific implementation of the onboarding wizard
 */
const AndroidOnboardingWizard = ({ onComplete, navigation, router }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingUrlTitle, setPendingUrlTitle] = useState("");

  const flatListRef = useRef(null);
  const completionTimeoutRef = useRef(null);

  // Complete onboarding and navigate to the main app
  const completeOnboarding = useCallback(async () => {
    const success = await markOnboardingComplete();

    // Navigate to app regardless of success
    navigateAfterOnboarding(onComplete, navigation, router);
  }, [onComplete, navigation, router]);

  // Handle next slide with reliable behavior
  const goToNextSlide = useCallback(() => {
    // Clear any existing timers to prevent multiple calls
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }

    if (currentIndex < WIZARD_SCREENS.length - 1) {
      // Calculate the next index
      const nextIndex = currentIndex + 1;
      const nextScreen = WIZARD_SCREENS[nextIndex];

      // Use the flatListRef to directly scroll first
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0,
        });
      }

      // Update the state after initiating the scroll
      setCurrentIndex(nextIndex);

      // If next screen is completion screen, complete onboarding after a delay
      if (nextScreen.isCompletionScreen) {
        completionTimeoutRef.current = setTimeout(() => {
          completeOnboarding();
        }, 800);
      }
    } else {
      // We're on the last screen, complete onboarding
      completeOnboarding();
    }
  }, [currentIndex, WIZARD_SCREENS, completeOnboarding]);

  // Handle external link press with confirmation modal
  const handleOpenLink = (url, title = "") => {
    setPendingUrl(url);
    setPendingUrlTitle(title);
    setLinkModalVisible(true);
  };

  // Render a screen in the wizard
  const renderItem = ({ item }) => {
    // For Android completion screen, render a special view
    if (item.isCompletionScreen) {
      return (
        <View style={[styles.slide, { width }]}>
          <View style={[styles.slideContent, styles.completionSlide]}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>Step 4 of 4</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "100%" }]} />
              </View>
            </View>

            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="large" color="#7c3aed" />
            </View>
          </View>
        </View>
      );
    }

    // For regular screens, render standard content
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.slideContent}>
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {item.id.replace(/\D/g, "")} of 4
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(parseInt(item.id.replace(/\D/g, ""), 10) / 4) * 100}%`,
                  },
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
          {item.subtitle && (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          )}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

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
                      optionIndex === 0 ? "Play Store" : "Web Browser",
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
        </View>
      </View>
    );
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

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
          scrollEnabled={false} // Disable user scrolling entirely
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
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

        {/* Continue button - Hide on completion screen */}
        {!(
          currentIndex === WIZARD_SCREENS.length - 1 &&
          WIZARD_SCREENS[currentIndex].isCompletionScreen
        ) && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={goToNextSlide}
            >
              <Text style={styles.continueButtonText}>
                {currentIndex === WIZARD_SCREENS.length - 2
                  ? "Get Started"
                  : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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

export default AndroidOnboardingWizard;
