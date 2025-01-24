// monorepo/native/mobile/comiccoin-wallet/app/(user)/send.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AlertCircle,
  Send,
  Loader2,
  Info,
  Wallet,
  Coins,
} from "lucide-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useWallet } from "../../hooks/useWallet";
import { useWalletTransactions } from "../../hooks/useWalletTransactions";
import { useCoinTransfer } from "../../hooks/useCoinTransfer";

// Define navigation types for type safety
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define form data structure
interface FormData {
  recipientAddress: string;
  amount: string;
  note: string;
  password: string;
}

const SendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentWallet, loading: serviceLoading } = useWallet();
  const { statistics } = useWalletTransactions(currentWallet?.address);
  const { submitTransaction, loading: transactionLoading } = useCoinTransfer(1);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    recipientAddress: "",
    amount: "",
    note: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData | "submit", string>>
  >({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.recipientAddress) {
      newErrors.recipientAddress = "Recipient address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipientAddress)) {
      newErrors.recipientAddress = "Invalid wallet address format";
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (
      isNaN(Number(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Please enter a valid amount";
    } else if (
      parseFloat(formData.amount) > (statistics?.totalCoinValue || 0)
    ) {
      newErrors.amount = "Insufficient balance";
    }

    if (!formData.password) {
      newErrors.password = "Password is required to authorize transaction";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, statistics?.totalCoinValue]);

  // Handle form input changes
  const handleInputChange = useCallback(
    (name: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [formErrors],
  );

  // Handle transaction confirmation
  const handleConfirmTransaction = useCallback(async () => {
    try {
      if (!currentWallet) return;

      await submitTransaction(
        formData.recipientAddress,
        formData.amount,
        formData.note,
        currentWallet,
        formData.password,
      );

      Alert.alert("Success", "Transaction submitted successfully!");
      navigation.navigate("Dashboard");
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : "Transaction failed",
      }));
      setShowConfirmation(false);
    }
  }, [formData, currentWallet, navigation, submitTransaction]);

  // Loading state
  if (serviceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  // Redirect to login if no wallet is found
  if (!currentWallet) {
    navigation.replace("Login");
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Send ComicCoins</Text>
            <Text style={styles.subtitle}>Transfer CC to another wallet</Text>
          </View>

          {/* Form Error Display */}
          {Object.keys(formErrors).length > 0 && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#DC2626" />
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>Transaction Error</Text>
                {Object.values(formErrors).map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Main Form Card */}
          <View style={styles.card}>
            {/* Balance Section */}
            <View style={styles.balanceContainer}>
              <View style={styles.balanceIconContainer}>
                <Wallet size={20} color="#7C3AED" />
              </View>
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceValue}>
                  {statistics?.totalCoinValue || 0} CC
                </Text>
              </View>
            </View>

            {/* Important Notice */}
            <View style={styles.noticeContainer}>
              <AlertCircle size={20} color="#D97706" />
              <Text style={styles.noticeText}>
                All transactions are final and cannot be undone. Please verify
                all details before sending.
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Recipient Address Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Pay To <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.recipientAddress && styles.inputError,
                  ]}
                  value={formData.recipientAddress}
                  onChangeText={(value) =>
                    handleInputChange("recipientAddress", value)
                  }
                  placeholder="Enter recipient's wallet address"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Amount Field */}
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>
                    Amount <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.balanceIndicator}>
                    <Coins size={16} color="#6B7280" />
                    <Text style={styles.balanceIndicatorText}>
                      Balance: {statistics?.totalCoinValue || 0} CC
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, formErrors.amount && styles.inputError]}
                  value={formData.amount}
                  onChangeText={(value) => handleInputChange("amount", value)}
                  placeholder="Enter amount"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
                {formData.amount && (
                  <View style={styles.feeContainer}>
                    <Text style={styles.feeText}>Network Fee: 1 CC</Text>
                    <Text style={styles.totalText}>
                      Total: {(parseFloat(formData.amount) + 1).toFixed(2)} CC
                    </Text>
                  </View>
                )}
              </View>

              {/* Note Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  value={formData.note}
                  onChangeText={(value) => handleInputChange("note", value)}
                  placeholder="Add a message to this transaction"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Wallet Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.password && styles.inputError,
                  ]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  placeholder="Enter your wallet password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (validateForm()) {
                    setShowConfirmation(true);
                  }
                }}
                disabled={transactionLoading}
              >
                {transactionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Send size={20} color="white" />
                    <Text style={styles.submitButtonText}>Send Coins</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Transaction</Text>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Send Amount</Text>
                <Text style={styles.modalValue}>- {formData.amount} CC</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>Network Fee</Text>
                <Text style={styles.modalValue}>- 1 CC</Text>
              </View>
              <View style={[styles.modalDetailRow, styles.modalTotal]}>
                <Text style={styles.modalLabel}>Total Deduction</Text>
                <Text style={styles.modalTotalValue}>
                  - {(parseFloat(formData.amount) + 1).toFixed(2)} CC
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmTransaction}
              >
                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 8,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
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
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorContent: {
    marginLeft: 12,
    flex: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#991B1B",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceIconContainer: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  balanceContent: {
    marginLeft: 12,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  transactionCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  refreshButton: {
    marginLeft: "auto",
    padding: 12,
  },
  // Loading and error states
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: "#991B1B",
    flex: 1,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    color: "#92400E",
    flex: 1,
  },
});

export default SendScreen;
