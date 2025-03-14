// screens/ClaimScreen.js - With Android optimizations
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  LayoutAnimation,
  UIManager,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "../components/AppHeader";
import { useClaimCoins } from "../api/endpoints/claimCoinsApi";
import { useGetFaucet } from "../api/endpoints/faucetApi";
import { useDashboard } from "../hooks/useDashboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// Enable layout animation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Device detection
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 667; // iPhone SE or similar
const isLargeDevice = height > 844; // Pro Max models or larger
const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";

// Create a platform-specific Touchable component
const Touchable = ({
  children,
  style,
  onPress,
  disabled = false,
  ...props
}) => {
  if (isAndroid) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple("#d4c1ff", false)}
        useForeground={true}
        disabled={disabled}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const ClaimScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dashboard, refetch: refetchDashboard } = useDashboard();
  const { claimCoins, isLoading, isSuccess, error, amount } = useClaimCoins();
  const [claimState, setClaimState] = useState("ready"); // ready, claiming, success, failed
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const amountRef = useRef(0);

  // Set proper status bar for Android
  useEffect(() => {
    if (isAndroid) {
      StatusBar.setBackgroundColor("#7e22ce");
      StatusBar.setBarStyle("light-content");
    }
  }, []);

  // Save the amount on success for animations
  useEffect(() => {
    if (isSuccess && amount) {
      amountRef.current = amount;
      setClaimState("success");

      // Trigger success animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      // Trigger haptic feedback on success
      if (isIOS) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Configure smooth layout animation - different for iOS vs Android
      if (isIOS) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      } else {
        // Android-specific smoother animation
        LayoutAnimation.configureNext({
          duration: 500,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
        });
      }

      // Refresh dashboard data after successful claim
      refetchDashboard();
    }
  }, [isSuccess, amount, fadeAnim, slideAnim]);

  // Show error alert if claim fails
  useEffect(() => {
    if (error) {
      setClaimState("failed");

      // Platform-specific error alert
      if (isAndroid) {
        Alert.alert(
          "Claim Failed",
          error.message ||
            "Unable to claim coins at this time. Please try again later.",
          [{ text: "OK" }],
          { cancelable: true },
        );
      } else {
        Alert.alert(
          "Claim Failed",
          error.message ||
            "Unable to claim coins at this time. Please try again later.",
        );
      }
    }
  }, [error]);

  // Handle the claim button press
  const handleClaim = async () => {
    if (isLoading || claimState === "success") return;

    // Animation for button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger haptic feedback
    if (isIOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setClaimState("claiming");
    try {
      await claimCoins();
    } catch (err) {
      console.error("Error claiming coins:", err);
      setClaimState("failed");
    }
  };

  // Handle returning to dashboard after claim
  const handleReturnToDashboard = () => {
    router.back();
  };

  // Animation styles for the coins
  const coinsContainerStyle = {
    opacity: fadeAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  // Get faucet data to know how many coins the user will get
  const { data: faucetData } = useGetFaucet();

  // Render the claim button based on claim state
  const renderClaimButton = () => {
    if (claimState === "success") {
      return (
        <Touchable
          style={styles.returnButton}
          onPress={handleReturnToDashboard}
        >
          <View style={styles.buttonInnerContainer}>
            <Text style={styles.returnButtonText}>
              {isAndroid ? "RETURN TO DASHBOARD" : "Return to Dashboard"}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
          </View>
        </Touchable>
      );
    }

    const buttonDisabled = isLoading || claimState === "claiming";
    const buttonContent = buttonDisabled ? (
      <View style={styles.buttonInnerContainer}>
        <ActivityIndicator
          size="small"
          color="white"
          style={isAndroid ? styles.androidLoader : undefined}
        />
        <Text style={styles.claimButtonText}>
          {isAndroid ? "CLAIMING..." : "Claiming..."}
        </Text>
      </View>
    ) : (
      <View style={styles.buttonInnerContainer}>
        <FontAwesome5
          name="coins"
          size={20}
          color="white"
          style={styles.buttonIcon}
        />
        <Text style={styles.claimButtonText}>
          {isAndroid ? "CLAIM DAILY COINS" : "Claim Daily Coins"}
        </Text>
      </View>
    );

    if (isAndroid) {
      return (
        <View style={styles.androidButtonWrapper}>
          <TouchableNativeFeedback
            onPress={handleClaim}
            disabled={buttonDisabled}
            background={TouchableNativeFeedback.Ripple("#8347FF", false)}
            useForeground={true}
          >
            <Animated.View
              style={[
                styles.claimButton,
                buttonDisabled && styles.claimButtonDisabled,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {buttonContent}
            </Animated.View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.claimButton,
            buttonDisabled && styles.claimButtonDisabled,
          ]}
          onPress={handleClaim}
          disabled={buttonDisabled}
          activeOpacity={0.9}
        >
          {buttonContent}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render loader when dashboard data is not available
  if (!dashboard) {
    return (
      <View style={styles.container}>
        <AppHeader title="Claim Coins" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#8347FF"
            style={isAndroid ? styles.androidLoader : undefined}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Claim Coins" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          // Add bottom padding for safe area on iOS
          isIOS && { paddingBottom: Math.max(insets.bottom, 20) },
          // Add specific padding for Android
          isAndroid && { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={isIOS} // Enable bounce effect only on iOS
        overScrollMode={isAndroid ? "never" : undefined} // Android specific
      >
        {/* Faucet Info Card */}
        <View style={styles.faucetInfoCard}>
          <View style={styles.faucetInfoHeader}>
            <Text style={styles.faucetInfoTitle}>Faucet Balance</Text>
            <View style={styles.faucetBalancePill}>
              <FontAwesome5
                name="coins"
                size={14}
                color="#7e22ce"
                style={styles.coinIcon}
              />
              <Text style={styles.faucetBalanceText}>
                {dashboard.faucetBalance.toLocaleString()} CC
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.faucetInfoContent}>
            <Text style={styles.faucetInfoText}>
              You can claim free ComicCoins once every 24 hours.
            </Text>
          </View>
        </View>

        {/* Main Content Box */}
        <View style={styles.mainContentBox}>
          <LinearGradient
            colors={
              claimState === "success"
                ? ["#10B981", "#059669"]
                : ["#8347FF", "#7e22ce"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {claimState === "success" ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color="white" />
                </View>
                <Text style={styles.successTitle}>Claim Successful!</Text>
                <Animated.View
                  style={[styles.coinsContainer, coinsContainerStyle]}
                >
                  <Text style={styles.coinsAmount}>
                    +{amountRef.current.toLocaleString()} CC
                  </Text>
                  <Text style={styles.coinsLabel}>added to your balance</Text>
                </Animated.View>
              </View>
            ) : (
              <View style={styles.readyContainer}>
                <FontAwesome5
                  name="coins"
                  size={48}
                  color="white"
                  style={styles.coinIconLarge}
                />
                <Text style={styles.readyTitle}>Ready to Claim</Text>
                <Text style={styles.readySubtitle}>
                  Claim your free ComicCoins now!
                </Text>
                <View style={styles.readyInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color="white"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      Available once every 24 hours
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="gift-outline"
                      size={20}
                      color="white"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoText}>
                      {faucetData?.daily_coins_reward
                        ? `${faucetData.daily_coins_reward} CC per claim`
                        : "Claim your daily coins"}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Claim Button Section */}
        <View style={styles.buttonContainer}>{renderClaimButton()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  androidLoader: {
    transform: [{ scale: 1.2 }], // Slightly larger for Android
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "500",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  faucetInfoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2, // Android shadow
      },
    }),
  },
  faucetInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faucetInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  faucetBalancePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  coinIcon: {
    marginRight: 4,
  },
  faucetBalanceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7e22ce",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "500",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  faucetInfoContent: {
    padding: 16,
  },
  faucetInfoText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
        lineHeight: 22, // Better readability on Android
      },
    }),
  },
  mainContentBox: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4, // Android shadow
      },
    }),
  },
  gradientBackground: {
    borderRadius: 12,
    padding: 24,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  successIconContainer: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "700",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  coinsContainer: {
    alignItems: "center",
  },
  coinsAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "800",
      },
      android: {
        fontFamily: "sans-serif-black",
        fontWeight: "normal", // Android handles font weight differently
        letterSpacing: 1, // Better readability for large numbers on Android
      },
    }),
  },
  coinsLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  readyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  coinIconLarge: {
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "700",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  readySubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 24,
    textAlign: "center",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  readyInfo: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "white",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  buttonContainer: {
    marginBottom: 24,
  },
  androidButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  claimButton: {
    backgroundColor: "#8347FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4, // Android shadow
        minHeight: 56, // Material Design recommend touch target size
      },
    }),
  },
  buttonInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  claimButtonDisabled: {
    backgroundColor: "#C4B5FD",
    // Platform-specific styling
    ...Platform.select({
      android: {
        elevation: 0, // No elevation when disabled
      },
    }),
  },
  buttonIcon: {
    marginRight: 8,
  },
  claimButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
        textTransform: "uppercase", // Material Design style uppercase buttons
        letterSpacing: 0.5, // Material Design letter spacing
        fontSize: 16,
      },
    }),
  },
  returnButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4, // Android shadow
        minHeight: 56, // Material Design recommend touch target size
      },
    }),
  },
  returnButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
        textTransform: "uppercase", // Material Design style uppercase buttons
        letterSpacing: 0.5, // Material Design letter spacing
        fontSize: 16,
      },
    }),
  },
});

export default ClaimScreen;
