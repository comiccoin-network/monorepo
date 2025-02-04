// app/(cointx)/transaction.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  AlertCircle,
  RotateCw,
  Copy,
} from "lucide-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useBlockTransaction } from "../../hooks/useBlockTransactionByNonce";

// Renamed to better reflect its purpose in the new structure
function TransactionStateScreen() {
  const params = useLocalSearchParams();
  const { nonce } = params;
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [hasTimeout, setHasTimeout] = useState(false);
  const maxAttempts = 30;
  const INITIAL_DELAY = 3000;
  const VERIFICATION_INTERVAL = 2000;
  const ERROR_THRESHOLD = 3; // Number of consecutive errors before showing error state
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const { blockTxData, isBlockTxLoading, blockTxError, blockTxRefetch } =
    useBlockTransaction(nonce as string);

  // Add error tracking
  useEffect(() => {
    if (blockTxError) {
      setConsecutiveErrors((prev) => prev + 1);
    } else if (blockTxData) {
      setConsecutiveErrors(0);
    }
  }, [blockTxError, blockTxData]);

  // Add timeout tracking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!blockTxData && !hasTimeout) {
        setHasTimeout(true);
      }
    }, 60000); // 1 minute timeout

    return () => clearTimeout(timeoutId);
  }, [blockTxData]);

  useEffect(() => {
    if (!nonce) {
      console.error("No transaction nonce provided");
      router.replace("/(user)/overview");
      return;
    }

    const initialTimeout = setTimeout(() => {
      if (!blockTxData && !blockTxError) {
        console.log("Starting verification after initial delay");
        blockTxRefetch();
        setVerificationAttempts(1);
      }
    }, INITIAL_DELAY);

    return () => clearTimeout(initialTimeout);
  }, [nonce]);

  useEffect(() => {
    if (
      !blockTxData &&
      !hasTimeout &&
      consecutiveErrors < ERROR_THRESHOLD &&
      verificationAttempts > 0 &&
      verificationAttempts < maxAttempts
    ) {
      console.log(
        `Starting verification interval, attempt ${verificationAttempts}/${maxAttempts}`,
      );

      const interval = setInterval(() => {
        console.log(
          `🔄 Verifying transaction attempt ${verificationAttempts + 1}/${maxAttempts}`,
        );
        blockTxRefetch();
        setVerificationAttempts((prev) => prev + 1);
      }, VERIFICATION_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [blockTxData, consecutiveErrors, hasTimeout, verificationAttempts]);

  // Handle network errors or timeout
  if (consecutiveErrors >= ERROR_THRESHOLD || hasTimeout) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={[styles.icon, styles.cautionIcon]}>
              <AlertCircle size={48} color="#D97706" />
            </View>

            <Text style={[styles.title, styles.cautionTitle]}>
              {hasTimeout ? "Verification Taking Longer" : "Network Issue"}
            </Text>

            <Text style={styles.message}>
              {hasTimeout
                ? "Your transaction has been submitted but is taking longer than usual to verify. Don't worry - your coins are safe."
                : "We're having trouble connecting to our servers. Your transaction has been submitted and your coins are safe."}
            </Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>What's happening?</Text>
              <Text style={styles.infoText}>
                Your transaction is being processed by the network. This can
                take longer during busy periods or when network conditions
                aren't optimal.
              </Text>

              <Text style={styles.infoTitle}>What should you do?</Text>
              <Text style={styles.infoText}>
                You can safely return to your overview, where you'll see your
                transaction status update automatically. Your coins are secure
                regardless of the verification status.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => router.replace("/(user)/overview")}
              >
                <ArrowLeft size={20} color="white" />
                <Text style={styles.buttonText}>Return to Overview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setConsecutiveErrors(0);
                  setHasTimeout(false);
                  blockTxRefetch();
                }}
              >
                <RotateCw size={20} color="#7C3AED" />
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Handler functions now use the new navigation structure
  const handleNavigateToOverview = () => {
    router.replace("/(user)/overview");
  };

  const handleSendMore = () => {
    router.replace("/(user)/send");
  };

  // Handle verification timeout - this is a failure state
  if (verificationAttempts >= maxAttempts && !blockTxData) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={[styles.icon, styles.warningIcon]}>
              <XCircle size={48} color="#DC2626" />
            </View>
            <Text style={styles.title}>Verification Timeout</Text>
            <Text style={styles.message}>
              The transaction has been submitted but we couldn't verify its
              status. Please check your transaction history for updates.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNavigateToOverview}
            >
              <ArrowLeft size={20} color="white" />
              <Text style={styles.buttonText}>Return to Overview</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show loading state - this is the pending state
  if (
    isBlockTxLoading ||
    (!blockTxData && verificationAttempts < maxAttempts)
  ) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>
              Verifying your transaction...
            </Text>
            <Text style={styles.subText}>This may take a few moments</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show error state.
  if (blockTxError) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <AlertCircle size={48} color="#D97706" />
              </View>

              <Text style={styles.errorTitle}>
                {hasTimeout
                  ? "Taking Longer Than Expected"
                  : "Verification Paused"}
              </Text>

              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>Transaction Submitted</Text>
                </View>

                <Text style={styles.errorMessage}>
                  Your transaction has been submitted to the network
                  successfully.
                  {hasTimeout
                    ? " The verification is taking longer than usual due to network traffic."
                    : " We're having trouble connecting to verify its status."}
                </Text>

                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Transactions typically process within 5 minutes
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Shield size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Your coins are secure during this process
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => router.replace("/(user)/overview")}
                >
                  <ArrowLeft size={20} color="white" />
                  <Text style={styles.buttonText}>
                    View in Transaction History
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.outlineButton]}
                  onPress={() => {
                    setConsecutiveErrors(0);
                    setHasTimeout(false);
                    blockTxRefetch();
                  }}
                >
                  <RotateCw size={20} color="#7C3AED" />
                  <Text style={styles.outlineButtonText}>Check Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show success state
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successAnimation}>
              <View style={styles.successCircle}>
                <CheckCircle size={48} color="#059669" />
              </View>
              <View style={styles.confettiEffect} />
            </View>

            <Text style={styles.successTitle}>Transaction Complete!</Text>
            <Text style={styles.successMessage}>
              {blockTxData.value} CC has been sent successfully
            </Text>

            <View style={styles.detailsCard}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  Transaction Details
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount Sent</Text>
                  <Text style={styles.detailValue}>{blockTxData.value} CC</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Network Fee</Text>
                  <Text style={styles.detailValue}>{blockTxData.fee} CC</Text>
                </View>
                <View style={styles.detailTotal}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>
                    {parseInt(blockTxData.value) + parseInt(blockTxData.fee)} CC
                  </Text>
                </View>
              </View>

              <View style={styles.recipientSection}>
                <Text style={styles.detailSectionTitle}>Recipient</Text>
                <View style={styles.addressBox}>
                  <Text style={styles.addressText} numberOfLines={1}>
                    {blockTxData.to}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => Clipboard.setString(blockTxData.to)}
                  >
                    <Copy size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => router.replace("/(transactions)/")}
              >
                <ArrowLeft size={20} color="white" />
                <Text style={styles.buttonText}>View Transaction History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => router.replace("/(user)/send")}
              >
                <Send size={20} color="#7C3AED" />
                <Text style={styles.outlineButtonText}>Send More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Base container styles
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", // Light purple background for brand consistency
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // Progress/Loading state styles
  progressContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  progressPercentage: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "600",
    color: "#7C3AED",
    marginTop: 40, // Position below the spinner
  },
  progressSteps: {
    width: "100%",
    gap: 16,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  stepText: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressStepComplete: {
    opacity: 1,
  },
  progressStepActive: {
    opacity: 1,
  },

  // Success state styles
  successContainer: {
    width: "100%",
    alignItems: "center",
  },
  successAnimation: {
    marginBottom: 24,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },

  // Transaction details card styles
  detailsCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
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
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 12,
  },

  // Error state styles
  errorContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D97706",
    marginBottom: 8,
    textAlign: "center",
  },
  statusCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },

  // Action buttons styles
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
  },
  outlineButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#7C3AED",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
  },
});

export default TransactionStateScreen;
