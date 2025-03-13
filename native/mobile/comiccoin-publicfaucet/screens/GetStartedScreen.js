// screens/GetStartedScreen.js with iOS improvements and no bounce effect
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetFaucet } from "../api/endpoints/faucetApi";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingWizard from "../components/OnboardingWizard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700; // iPhone SE or similar

const GetStartedScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets(); // Get safe area insets

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Use the hook to fetch faucet data
  const {
    data: faucet,
    isLoading: isFaucetLoading,
    error: faucetError,
  } = useGetFaucet({
    chainId: 1,
    enabled: true,
    refetchInterval: 60000,
  });

  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // const onboardingCompleted = false; // DEVELOPERS NOTE: Uncomment this line and comment the code below if you want to force the wizard. This is for development purposes only.
        const onboardingCompleted = await AsyncStorage.getItem(
          "@onboarding_completed",
        );
        setShowOnboarding(onboardingCompleted !== "true");
        setIsCheckingOnboarding(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setShowOnboarding(true);
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Function to handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Handle navigation functions
  const handleLoginPress = () => {
    router.push("/login");
  };

  const handleRegisterPress = () => {
    router.push("/register");
  };

  // Show loading indicator while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // Show onboarding wizard if needed
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // The main GetStartedScreen component
  return (
    <View style={styles.container}>
      <Header currentRoute="/" />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          // Add bottom padding to account for safe area
          { paddingBottom: Math.max(40, insets.bottom + 20) },
        ]}
        bounces={false} // Disable the rubber/bounce effect
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never" // Prevents content adjustment that can cause bounce
        showsVerticalScrollIndicator={false} // Cleaner iOS appearance
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={["#4f46e5", "#4338ca"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.heroBanner,
            // Add extra top padding for devices with notches
            { paddingTop: insets.top > 0 ? insets.top + 16 : 48 },
          ]}
        >
          <View style={styles.heroContent}>
            <Text
              style={[styles.heroTitle, isSmallDevice && styles.heroTitleSmall]}
            >
              Welcome to ComicCoin Public Faucet
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                isSmallDevice && styles.heroSubtitleSmall,
              ]}
            >
              Join our community of comic collectors and creators today and get
              free ComicCoins!
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          <Text
            style={[
              styles.sectionTitle,
              isSmallDevice && styles.sectionTitleSmall,
            ]}
          >
            Choose Your Path
          </Text>

          <View style={styles.cardsContainer}>
            {/* Registration Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={handleRegisterPress}
              disabled={isLoading}
              activeOpacity={0.7} // Better iOS touch feedback
            >
              <View style={styles.iconContainer}>
                <Feather
                  name="user-plus"
                  size={isSmallDevice ? 24 : 28}
                  color="#7c3aed"
                />
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  isSmallDevice && styles.cardTitleSmall,
                ]}
              >
                New to ComicCoin?
              </Text>
              <Text
                style={[styles.cardText, isSmallDevice && styles.cardTextSmall]}
              >
                Create your ComicCoin Public Faucet account to join our
                community of comic enthusiasts. Get access to exclusive features
                and claim your daily ComicCoins.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>Register Now</Text>
                <Feather name="arrow-right" size={18} color="#7c3aed" />
              </View>
            </TouchableOpacity>

            {/* Login Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={handleLoginPress}
              disabled={isLoading}
              activeOpacity={0.7} // Better iOS touch feedback
            >
              <View style={styles.iconContainer}>
                <Feather
                  name="log-in"
                  size={isSmallDevice ? 24 : 28}
                  color="#7c3aed"
                />
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  isSmallDevice && styles.cardTitleSmall,
                ]}
              >
                Already Have an Account?
              </Text>
              <Text
                style={[styles.cardText, isSmallDevice && styles.cardTextSmall]}
              >
                Sign in with your existing credentials to continue your journey.
                Access your collections and claim your daily rewards.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>Sign In</Text>
                <Feather name="arrow-right" size={18} color="#7c3aed" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <LightFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f3ff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroBanner: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: isSmallDevice ? 10 : 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  heroTitleSmall: {
    fontSize: 24,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  heroSubtitleSmall: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  mainContent: {
    padding: 24,
    paddingHorizontal: isSmallDevice ? 16 : 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: 24,
  },
  sectionTitleSmall: {
    fontSize: 20,
    marginBottom: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16, // More iOS-friendly rounded corners
    padding: isSmallDevice ? 16 : 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 2,
    borderColor: "#f3e8ff",
  },
  iconContainer: {
    backgroundColor: "#f9f5ff",
    alignSelf: "center",
    padding: 16,
    borderRadius: 50, // Perfect circle on all devices
    marginBottom: isSmallDevice ? 16 : 24,
    width: isSmallDevice ? 56 : 64,
    height: isSmallDevice ? 56 : 64,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: 12,
  },
  cardTitleSmall: {
    fontSize: 18,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  cardTextSmall: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAction: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed",
    marginRight: 8,
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
});

export default GetStartedScreen;
