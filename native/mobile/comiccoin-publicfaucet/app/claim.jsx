// app/claim.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "../components/AppHeader";
import { useClaimCoins } from "../api/endpoints/claimCoinsApi";
import { useGetFaucet } from "../api/endpoints/faucetApi";
import * as Animatable from "react-native-animatable"; // Make sure to install this package

// Animated confetti component
const ConfettiPiece = ({ index }) => {
  const size = Math.random() * 10 + 5;
  const left = Math.random() * 100;
  const duration = Math.random() * 3000 + 2000;
  const delay = Math.random() * 500;

  // Random color
  const colors = ["#8347FF", "#4c1d95", "#e879f9", "#f0abfc", "#6366f1"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animatable.View
      animation="fadeOutDown"
      duration={duration}
      delay={delay}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left: `${left}%`,
        top: -10,
      }}
    />
  );
};

// Confetti animation for successful claims
const ClaimConfetti = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.confettiContainer}>
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

// Loading spinner component
const LoadingSpinner = () => <ActivityIndicator size="small" color="white" />;

export default function ClaimCoinsScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Track if redirection is scheduled
  const redirectionScheduledRef = useRef(false);

  // Get faucet data to display daily reward amount
  const { data: faucet, isLoading: isFaucetLoading } = useGetFaucet();

  // Set up claim coins mutation
  const {
    mutateAsync: claimCoins,
    isLoading: isClaimingCoins,
    isError,
    error,
  } = useClaimCoins();

  // Get the daily reward amount from faucet data
  const dailyReward = faucet?.daily_coins_reward || 2; // Fallback to 2 if not available yet

  // Effect to handle redirection after successful claim
  useEffect(() => {
    if (claimSuccess && !redirectionScheduledRef.current) {
      redirectionScheduledRef.current = true;

      // Redirect to dashboard after a delay to show the success animation
      const redirectTimer = setTimeout(() => {
        router.back();
      }, 2500); // Wait 2.5 seconds to show confetti animation

      // Cleanup timer if component unmounts
      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [claimSuccess, router]);

  // Function to handle coin claiming
  const handleClaimCoins = async () => {
    // Clear any previous error
    setErrorMessage(null);

    try {
      // Attempt to claim coins
      await claimCoins();

      // Show confetti animation
      setShowConfetti(true);
      setClaimSuccess(true);

      // Show success alert
      Alert.alert("Success!", `You've claimed ${dailyReward} ComicCoins!`, [
        { text: "Great!", style: "default" },
      ]);
    } catch (err) {
      console.error("Error claiming coins:", err);

      // Extract detailed error message from response
      let message = "Unable to claim coins";

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMessage(message);

      // Show error alert
      Alert.alert("Claim Failed", message, [{ text: "OK", style: "cancel" }]);
    }
  };

  return (
    <View style={styles.container}>
      {/* We don't need to add AppHeader since the Stack navigation will automatically add a header with back button */}

      {/* Confetti animation for successful claims */}
      <ClaimConfetti visible={showConfetti} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          {/* Info box */}
          <View style={styles.infoBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="cash-outline" size={24} color="#8347FF" />
            </View>
            <Text style={styles.infoText}>
              Your daily reward is ready to be collected. Claim now and start
              exploring premium content!
            </Text>
          </View>

          {/* Error message display */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle"
                size={20}
                color="#EF4444"
                style={styles.errorIcon}
              />
              <View>
                <Text style={styles.errorTitle}>Claim failed</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            </View>
          )}

          {/* Claim Card */}
          <View style={styles.claimCard}>
            {/* Success state */}
            {claimSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>Claim Successful!</Text>
                <Text style={styles.successMessage}>
                  Congratulations! {dailyReward} ComicCoins have been added to
                  your wallet.
                </Text>
                <Text style={styles.redirectingText}>
                  Redirecting to dashboard...
                </Text>
              </View>
            ) : (
              <>
                {/* Reward Header */}
                <View style={styles.rewardHeader}>
                  <View style={styles.iconCirclePurple}>
                    <Ionicons name="gift-outline" size={24} color="#8347FF" />
                  </View>
                  <View>
                    <Text style={styles.rewardTitle}>Daily Reward Ready!</Text>
                    <Text style={styles.rewardSubtitle}>
                      Claim your {dailyReward} ComicCoins today
                    </Text>
                  </View>
                </View>

                {/* Reward Display */}
                <View style={styles.rewardDisplay}>
                  <Text style={styles.rewardLabel}>Today's Reward</Text>
                  <View style={styles.rewardAmount}>
                    <View style={styles.iconCirclePurpleSmall}>
                      <Ionicons name="cash" size={20} color="#8347FF" />
                    </View>
                    <View>
                      <Text style={styles.rewardValue}>
                        {isFaucetLoading ? (
                          <ActivityIndicator size="small" color="#8347FF" />
                        ) : (
                          `${dailyReward} CC`
                        )}
                      </Text>
                      <Text style={styles.rewardUnit}>ComicCoins</Text>
                    </View>
                  </View>
                </View>

                {/* Claim Button */}
                <TouchableOpacity
                  style={[
                    styles.claimButton,
                    (isClaimingCoins || isFaucetLoading) &&
                      styles.claimButtonDisabled,
                  ]}
                  onPress={handleClaimCoins}
                  disabled={isClaimingCoins || isFaucetLoading}
                >
                  {isClaimingCoins ? (
                    <View style={styles.buttonContent}>
                      <LoadingSpinner />
                      <Text style={styles.claimButtonText}>
                        Claiming your coins...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="cash" size={20} color="white" />
                      <Text style={styles.claimButtonText}>
                        Claim {dailyReward} ComicCoins
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Next Claim Time Information */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="time-outline" size={20} color="#8347FF" />
              <Text style={styles.infoCardTitle}>When can I claim again?</Text>
            </View>
            <Text style={styles.infoCardText}>
              You can claim ComicCoins once every 24 hours. After claiming,
              you'll need to wait until tomorrow to claim again.
            </Text>
          </View>

          {/* Additional help information */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="cash-outline" size={20} color="#8347FF" />
              <Text style={styles.infoCardTitle}>What are ComicCoins?</Text>
            </View>
            <Text style={styles.infoCardText}>
              ComicCoins (CC) are our platform's digital currency. You can use
              them to unlock premium comics, purchase special editions, or trade
              with other collectors. Check your total balance on the dashboard.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 16,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  confettiContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
    pointerEvents: "none",
  },
  infoBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    backgroundColor: "#F3F4FF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B91C1C",
  },
  errorMessage: {
    fontSize: 12,
    color: "#B91C1C",
    marginTop: 4,
  },
  claimCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  successIconContainer: {
    backgroundColor: "#D1FAE5",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 8,
  },
  successMessage: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  redirectingText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCirclePurple: {
    backgroundColor: "#F3F4FF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconCirclePurpleSmall: {
    backgroundColor: "#F3F4FF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  rewardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  rewardDisplay: {
    backgroundColor: "#F3F4FF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  rewardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  rewardAmount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8347FF",
  },
  rewardUnit: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  claimButton: {
    backgroundColor: "#8347FF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  claimButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  claimButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8347FF",
    marginLeft: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});
