// components/OnboardingWizard/OnboardingWizard.ios.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import {
  COMMON_SCREENS,
  IOS_TRACKING_SCREEN,
  markOnboardingComplete,
  navigateAfterOnboarding,
} from "./commonScreens";
import styles from "./styles";
import ExternalLinkModal from "./ExternalLinkModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Full list of screens for iOS
const WIZARD_SCREENS = [...COMMON_SCREENS, IOS_TRACKING_SCREEN];

/**
 * iOS-specific implementation of the onboarding wizard
 * Enhanced with better safe area handling and responsive design
 */
const IOSOnboardingWizard = ({ onComplete, navigation, router }) => {
  // Get safe area insets to handle notch and home indicator
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingUrlTitle, setPendingUrlTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef(null);

  // Determine if we're on a smaller device (like iPhone SE)
  const isSmallDevice = height < 700;

  // Extra adjustment for very small devices
  const isVerySmallDevice = height < 600;

  // Calculate content scaling factor for smaller screens
  const contentScaleFactor = isVerySmallDevice ? 0.8 : isSmallDevice ? 0.9 : 1;

  // Request tracking permission but don't block completion
  const requestTrackingPermission = async () => {
    try {
      setIsLoading(true);

      // iOS requires a delay after component mounts
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Request tracking permission - this will show the system dialog
      await requestTrackingPermissionsAsync();

      // Whether permission was granted or not, complete onboarding
      await completeOnboarding();
    } catch (error) {
      console.error("Error requesting tracking permission:", error);
      // If there's an error requesting permission, still complete onboarding
      await completeOnboarding();
    } finally {
      setIsLoading(false);
    }
  };

  // Complete onboarding and navigate to the main app
  const completeOnboarding = useCallback(async () => {
    // Mark onboarding as complete
    const success = await markOnboardingComplete();

    // Navigate to app regardless of permission status
    navigateAfterOnboarding(onComplete, navigation, router);
  }, [onComplete, navigation, router]);

  // Handle next slide
  const goToNextSlide = useCallback(() => {
    if (currentIndex < WIZARD_SCREENS.length - 1) {
      // Calculate the next index
      const nextIndex = currentIndex + 1;

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
    } else {
      // We're on the last screen, request permission and then complete onboarding
      requestTrackingPermission();
    }
  }, [currentIndex, WIZARD_SCREENS.length, requestTrackingPermission]);

  // Handle external link press with confirmation modal
  const handleOpenLink = (url, title = "") => {
    setPendingUrl(url);
    setPendingUrlTitle(title);
    setLinkModalVisible(true);
  };

  // Render a single screen of the wizard
  const renderItem = ({ item }) => {
    const progressPercent = parseInt(item.id.replace(/\D/g, ""), 10) * 25;

    return (
      <View style={[styles.slide, { width }]}>
        <View
          style={[
            styles.cardContainer,
            {
              paddingTop: isSmallDevice ? 16 : 20,
              paddingBottom: isSmallDevice ? 90 : 100, // Extra padding for the button and dots
              marginTop: insets.top > 0 ? insets.top * 0.5 : 0,
              marginBottom: insets.bottom,
              maxHeight: isVerySmallDevice ? height * 0.95 : undefined,
            },
          ]}
        >
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {item.id.replace(/\D/g, "")} of 4
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>

          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              isSmallDevice && styles.iconContainerSmall,
            ]}
          >
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          {/* Title and subtitle */}
          <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>
            {item.title}
          </Text>

          {item.subtitle && (
            <Text
              style={[styles.subtitle, isSmallDevice && styles.subtitleSmall]}
            >
              {item.subtitle}
            </Text>
          )}

          {item.description && (
            <Text
              style={[
                styles.description,
                isSmallDevice && styles.descriptionSmall,
              ]}
            >
              {item.description}
            </Text>
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

          {/* Tracking benefits for screen 4 (iOS only) */}
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

          {/* Continue button - fixed to bottom of card with pagination dots */}
          <View style={styles.continueButtonContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.loadingText}>Setting up...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={goToNextSlide}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>
                  {currentIndex === WIZARD_SCREENS.length - 1
                    ? "Get Started"
                    : "Continue"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Pagination dots inside button container */}
            <View style={styles.buttonPagination}>
              {WIZARD_SCREENS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.buttonPaginationDot,
                    index === currentIndex && styles.buttonPaginationDotActive,
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />
      <LinearGradient
        colors={["#4f46e5", "#4338ca"]}
        style={styles.background}
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
        bounces={false}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Removed external pagination dots since they're now inside the button container */}

      {/* External link warning modal */}
      <ExternalLinkModal
        visible={linkModalVisible}
        onClose={() => setLinkModalVisible(false)}
        url={pendingUrl}
        title={pendingUrlTitle}
      />
    </View>
  );
};

export default IOSOnboardingWizard;
