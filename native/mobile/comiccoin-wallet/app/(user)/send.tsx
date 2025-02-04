// monorepo/native/mobile/comiccoin-wallet/app/(user)/send.tsx
import React, { useState, useCallback, useEffect } from "react";
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
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
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
import walletService from "../../services/wallet/WalletService";
import { base64ToHex } from "../../utils/byteUtils";

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FormData {
  recipientAddress: string;
  amount: string;
  note: string;
  password: string;
}

const SendScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();
  const { currentWallet, logout, loading: serviceLoading } = useWallet();
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
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletSession = async () => {
      try {
        if (serviceLoading) return;

        if (!currentWallet) {
          navigation.replace("Login");
          return;
        }

        if (!walletService.checkSession()) {
          throw new Error("Session expired");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Session expired") {
          handleSessionExpired();
        } else {
          setGeneralError(
            error instanceof Error ? error.message : "Unknown error occurred",
          );
        }
      }
    };

    checkWalletSession();
    const sessionCheckInterval = setInterval(checkWalletSession, 60000);

    return () => clearInterval(sessionCheckInterval);
  }, [currentWallet, serviceLoading, navigation]);

  const handleSessionExpired = () => {
    setIsSessionExpired(true);
    logout();
    setGeneralError("Your session has expired. Please sign in again.");
    setTimeout(() => {
      navigation.replace("Login");
    }, 3000);
  };

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

  const handleInputChange = useCallback(
    (name: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [formErrors],
  );

  const handleConfirmTransaction = async () => {
    try {
      const result = await submitTransaction(
        formData.recipientAddress,
        formData.amount,
        formData.note,
        currentWallet,
        formData.password,
      );

      if (result.success) {
        setShowConfirmation(false);

        // Use the complete path with /index
        router.push({
          pathname: "/(cointx)/transaction",
          params: { nonce: result.nonce.string },
        });
      }
    } catch (error) {
      setShowConfirmation(false);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Transaction failed",
      );
    }
  };

  if (serviceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  if (!currentWallet) {
    navigation.replace("Login");
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Send ComicCoins</Text>
              <Text style={styles.subtitle}>Transfer CC to another wallet</Text>
            </View>

            {/* Error Messages */}
            {(generalError || isSessionExpired) && (
              <View
                style={[
                  styles.alertContainer,
                  isSessionExpired ? styles.warningAlert : styles.errorAlert,
                ]}
              >
                <AlertCircle
                  size={20}
                  color={isSessionExpired ? "#D97706" : "#DC2626"}
                />
                <Text
                  style={[
                    styles.alertText,
                    isSessionExpired ? styles.warningText : styles.errorText,
                  ]}
                >
                  {isSessionExpired
                    ? "Session expired. Redirecting to login..."
                    : generalError}
                </Text>
              </View>
            )}

            {/* Form Errors */}
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
                  {formData.amount && (
                    <View style={styles.balanceBreakdown}>
                      <View style={styles.balanceRow}>
                        <Text style={styles.deductionLabel}>
                          Amount to Send
                        </Text>
                        <Text style={styles.deductionValue}>
                          - {formData.amount} CC
                        </Text>
                      </View>
                      <View style={styles.balanceRow}>
                        <Text style={styles.deductionLabel}>Network Fee</Text>
                        <Text style={styles.deductionValue}>- 1 CC</Text>
                      </View>
                      <View style={[styles.balanceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Remaining Balance</Text>
                        <Text style={styles.totalValue}>
                          ={" "}
                          {(
                            statistics?.totalCoinValue -
                            parseFloat(formData.amount || "0") -
                            1
                          ).toFixed(2)}{" "}
                          CC
                        </Text>
                      </View>
                    </View>
                  )}
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

              {/* Transaction Fee Notice */}
              <View style={styles.infoContainer}>
                <Info size={20} color="#2563EB" />
                <Text style={styles.infoText}>
                  A network fee of 1 CC will be added to your transaction to
                  ensure timely processing.
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
                  {formErrors.recipientAddress && (
                    <View style={styles.fieldError}>
                      <AlertCircle size={16} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>
                        {formErrors.recipientAddress}
                      </Text>
                    </View>
                  )}
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
                    style={[
                      styles.input,
                      formErrors.amount && styles.inputError,
                    ]}
                    value={formData.amount}
                    onChangeText={(value) => handleInputChange("amount", value)}
                    placeholder="Enter amount"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                  {formErrors.amount ? (
                    <View style={styles.fieldError}>
                      <AlertCircle size={16} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>
                        {formErrors.amount}
                      </Text>
                    </View>
                  ) : formData.amount ? (
                    <View style={styles.feeContainer}>
                      <Text style={styles.feeText}>Network Fee: 1 CC</Text>
                      <Text style={styles.totalText}>
                        Total: {(parseFloat(formData.amount) + 1).toFixed(2)} CC
                      </Text>
                    </View>
                  ) : null}
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
                  <Text style={styles.helperText}>
                    This message will be visible to the recipient.
                  </Text>
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
                    onChangeText={(value) =>
                      handleInputChange("password", value)
                    }
                    placeholder="Enter your wallet password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                  />
                  {formErrors.password && (
                    <View style={styles.fieldError}>
                      <AlertCircle size={16} color="#DC2626" />
                      <Text style={styles.fieldErrorText}>
                        {formErrors.password}
                      </Text>
                    </View>
                  )}
                  <View style={styles.passwordHelper}>
                    <Info size={16} color="#6B7280" />
                    <Text style={styles.helperText}>
                      Your wallet is encrypted and stored locally. Password
                      required for authorization.
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    Keyboard.dismiss();
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
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!transactionLoading) {
            setShowConfirmation(false);
          }
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (!transactionLoading) {
              setShowConfirmation(false);
            }
          }}
          style={styles.modalOverlay}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Transaction Status Header */}
            <View style={styles.modalHeader}>
              {transactionLoading ? (
                <>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.modalHeaderTitle}>
                    Processing Transaction
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    Please wait while we process your transaction...
                  </Text>
                </>
              ) : (
                <>
                  <Send size={32} color="#7C3AED" />
                  <Text style={styles.modalHeaderTitle}>
                    Review Transaction
                  </Text>
                  <Text style={styles.modalHeaderSubtitle}>
                    Please verify all details before confirming
                  </Text>
                </>
              )}
            </View>

            {/* Transaction Amount Card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>You're sending</Text>
              <Text style={styles.amountValue}>{formData.amount} CC</Text>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Network Fee</Text>
                <Text style={styles.feeValue}>1 CC</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  {(parseFloat(formData.amount) + 1).toFixed(2)} CC
                </Text>
              </View>
            </View>

            {/* Recipient Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsLabel}>To Address</Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {formData.recipientAddress}
                </Text>
              </View>
              {formData.note && (
                <>
                  <Text style={[styles.detailsLabel, styles.noteLabel]}>
                    Message
                  </Text>
                  <Text style={styles.noteText}>{formData.note}</Text>
                </>
              )}
            </View>

            {/* Warning Notice */}
            <View style={styles.warningContainer}>
              <AlertCircle size={16} color="#D97706" />
              <Text style={styles.warningText}>
                This action cannot be undone. The transaction will be submitted
                to the network immediately.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalCancelButton,
                  transactionLoading && styles.disabledButton,
                ]}
                onPress={() => setShowConfirmation(false)}
                disabled={transactionLoading}
              >
                <Text
                  style={[
                    styles.modalCancelButtonText,
                    transactionLoading && styles.disabledButtonText,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalConfirmButton,
                  transactionLoading && styles.disabledButton,
                ]}
                onPress={handleConfirmTransaction}
                disabled={transactionLoading}
              >
                {transactionLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" size="small" />
                    <Text style={styles.loadingButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <>
                    <Send size={16} color="white" />
                    <Text style={styles.modalConfirmButtonText}>
                      Confirm & Send
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
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
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
  },
  alertContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
  },
  warningAlert: {
    backgroundColor: "#FEF3C7",
  },
  alertText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    color: "#991B1B",
  },
  warningText: {
    color: "#92400E",
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
  balanceContainer: {
    padding: 16,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceIconContainer: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  balanceContent: {
    marginTop: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#2563EB",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  balanceBreakdown: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  deductionLabel: {
    fontSize: 12,
    color: "#DC2626",
  },
  deductionValue: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
  noticeContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  noticeText: {
    marginLeft: 12,
    flex: 1,
    color: "#92400E",
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    color: "#1E40AF",
    fontSize: 14,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  required: {
    color: "#DC2626",
  },
  balanceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  balanceIndicatorText: {
    fontSize: 12,
    color: "#6B7280",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  noteInput: {
    height: 100,
    textAlignVertical: "top",
  },
  fieldError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#DC2626",
  },
  feeContainer: {
    marginTop: 4,
  },
  feeText: {
    fontSize: 12,
    color: "#DC2626",
  },
  totalText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  passwordHelper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  modalDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#DC2626",
  },
  modalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
  },
  recipientContainer: {
    marginBottom: 16,
  },
  recipientAddress: {
    fontSize: 16,
    color: "#111827",
    marginTop: 4,
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 16,
    color: "#111827",
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  modalCancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  modalConfirmButton: {
    backgroundColor: "#7C3AED",
  },
  modalConfirmButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalHeaderTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeaderSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  amountCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  feeValue: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  addressContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressText: {
    fontSize: 14,
    color: "#111827",
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
    }),
  },
  noteLabel: {
    marginTop: 16,
  },
  noteText: {
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default SendScreen;
