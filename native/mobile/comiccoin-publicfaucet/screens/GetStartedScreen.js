// screens/GetStartedScreen.js
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetFaucet } from "../api/endpoints/faucetApi";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingWizard from "../components/OnboardingWizard";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  isAvailable,
} from "expo-tracking-transparency";

const GetStartedScreen = () => {
  const router = useRouter();
  const [isPermissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isTrackingAvailable, setIsTrackingAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
        const onboardingCompleted = false;
        // const onboardingCompleted = await AsyncStorage.getItem(
        //   "@onboarding_completed",
        // );
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

  // Check if tracking transparency is available on this device
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await isAvailable();
      setIsTrackingAvailable(available);

      if (available) {
        // Check current permission status on mount
        try {
          const status = await getTrackingPermissionsAsync();
          setPermissionStatus(status.status);
        } catch (error) {
          console.error("Error checking tracking permissions:", error);
        }
      }
    };

    checkAvailability();
  }, []);

  // Function to handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Function to request tracking permission
  const requestTrackingPermission = async (destination) => {
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
        // Permission granted, navigate to destination
        router.push(destination);
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

  // Handle login button press
  const handleLoginPress = () => {
    // If tracking isn't available on this device, just navigate directly
    if (!isTrackingAvailable) {
      router.push("/login");
      return;
    }

    // If permission already granted, navigate directly
    if (permissionStatus === "granted") {
      router.push("/login");
      return;
    }

    requestTrackingPermission("/login");
  };

  // Handle register button press
  const handleRegisterPress = () => {
    // If tracking isn't available on this device, just navigate directly
    if (!isTrackingAvailable) {
      router.push("/register");
      return;
    }

    // If permission already granted, navigate directly
    if (permissionStatus === "granted") {
      router.push("/register");
      return;
    }

    requestTrackingPermission("/register");
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

  // The rest of your GetStartedScreen component remains unchanged
  return (
    <View style={styles.container}>
      <Header currentRoute="/" />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Requesting permission...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
      >
        {/* Your existing content here */}
        <LinearGradient
          colors={["#4f46e5", "#4338ca"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Welcome to ComicCoin Public Faucet
            </Text>
            <Text style={styles.heroSubtitle}>
              Join our community of comic collectors and creators today and get
              free ComicCoins!
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Choose Your Path</Text>

          <View style={styles.cardsContainer}>
            {/* Registration Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={handleRegisterPress}
              disabled={isLoading}
            >
              <View style={styles.iconContainer}>
                <Feather name="user-plus" size={28} color="#7c3aed" />
              </View>
              <Text style={styles.cardTitle}>New to ComicCoin?</Text>
              <Text style={styles.cardText}>
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
            >
              <View style={styles.iconContainer}>
                <Feather name="log-in" size={28} color="#7c3aed" />
              </View>
              <Text style={styles.cardTitle}>Already Have an Account?</Text>
              <Text style={styles.cardText}>
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

      {/* Permission Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPermissionModalVisible}
        onRequestClose={() => setPermissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="alert-triangle" size={40} color="#7c3aed" />
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
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setPermissionModalVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
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
                    if (permissionStatus === "denied") {
                      requestTrackingPermission(router.pathname);
                    }
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Keep all your existing styles
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
  heroBanner: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  mainContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: 24,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
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
    borderRadius: 9999,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
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
    maxWidth: 400,
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
    padding: 16,
    borderRadius: 9999,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
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
  primaryButton: {
    backgroundColor: "#7c3aed",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#f3e8ff",
  },
  secondaryButtonText: {
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
});

export default GetStartedScreen;
