// components/OnboardingWizard/OnboardingWizard.ios.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get("window");

// Full list of screens for iOS
const WIZARD_SCREENS = [...COMMON_SCREENS, IOS_TRACKING_SCREEN];

/**
 * iOS-specific implementation of the onboarding wizard
 */
const IOSOnboardingWizard = ({ onComplete, navigation, router }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingUrlTitle, setPendingUrlTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const flatListRef = useRef(null);

  // Request tracking permission (iOS-specific)
  const requestTrackingPermission = async () => {
    try {
      setIsLoading(true);

      // iOS requires a delay after component mounts
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { status } = await requestTrackingPermissionsAsync();
      setPermissionStatus(status);
      setIsLoading(false);

      if (status === "granted") {
        // Permission granted, navigate to main app
        navigateAfterOnboarding(onComplete, navigation, router);
      } else {
        // Permission denied, show modal
        setPermissionModalVisible(true);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error requesting tracking permission:", error);
      Alert.alert(
        "Error",
        "There was a problem requesting permissions. Please try again.",
      );
    }
  };

  // Check tracking permission status on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const status = await getTrackingPermissionsAsync();
        setPermissionStatus(status.status);
      } catch (error) {
        console.error("Error checking tracking permission:", error);
      }
    };

    checkPermission();
  }, []);

  // Complete onboarding and request tracking permission
  const completeOnboarding = useCallback(async () => {
    const success = await markOnboardingComplete();

    if (success) {
      // For iOS, request tracking permission
      requestTrackingPermission();
    } else {
      // Even if saving fails, try to proceed
      requestTrackingPermission();
    }
  }, []);

  // Handle next slide with improved reliability
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
      // We're on the last screen, complete onboarding
      completeOnboarding();
    }
  }, [currentIndex, WIZARD_SCREENS.length, completeOnboarding]);

  // Handle external link press with confirmation modal
  const handleOpenLink = (url, title = "") => {
    setPendingUrl(url);
    setPendingUrlTitle(title);
    setLinkModalVisible(true);
  };

  // Render a single screen of the wizard
  const renderItem = ({ item }) => {
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
        </View>
      </View>
    );
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

        {/* Continue button */}
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
      <ExternalLinkModal
        visible={linkModalVisible}
        onClose={() => setLinkModalVisible(false)}
        url={pendingUrl}
        title={pendingUrlTitle}
      />

      {/* Permission Modal (iOS only) */}
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
                  Alert.alert(
                    "Permission Required",
                    "Please enable tracking in your device settings to use ComicCoin Public Faucet.",
                    [
                      {
                        text: "OK",
                        onPress: () =>
                          navigateAfterOnboarding(
                            onComplete,
                            navigation,
                            router,
                          ),
                      },
                    ],
                  );
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

export default IOSOnboardingWizard;
