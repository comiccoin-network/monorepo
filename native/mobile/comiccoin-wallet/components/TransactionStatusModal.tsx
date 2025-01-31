// monorepo/native/mobile/comiccoin-wallet/components/UserNavigationBar.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle, XCircle, Loader } from "lucide-react-native";
import { walletTransactionEventEmitter } from "../utils/eventEmitter";

interface TransactionStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  transactionData: {
    amount: string;
    recipientAddress: string;
    walletAddress: string;
  };
}

const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  isVisible,
  onClose,
  transactionData,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [message, setMessage] = useState("Processing your transaction...");

  useEffect(() => {
    if (!isVisible) return;

    // Reset state when modal opens
    setStatus("pending");
    setMessage("Processing your transaction...");

    const handleTransaction = (data: {
      walletAddress: string;
      transaction: any;
    }) => {
      if (data.walletAddress === transactionData.walletAddress) {
        // Check if this is our transaction by matching amount and direction
        if (
          data.transaction.direction === "outgoing" &&
          data.transaction.valueOrTokenID === parseFloat(transactionData.amount)
        ) {
          setStatus("success");
          setMessage("Transaction completed successfully!");

          // Navigate to overview after a short delay
          setTimeout(() => {
            onClose();
            router.replace("/overview");
          }, 2000);
        }
      }
    };

    // Set up error timeout (e.g., 30 seconds)
    const timeoutId = setTimeout(() => {
      if (status === "pending") {
        setStatus("error");
        setMessage(
          "Transaction is taking longer than expected. Please check your transaction history for updates.",
        );
      }
    }, 30000);

    walletTransactionEventEmitter.on("newTransaction", handleTransaction);

    return () => {
      clearTimeout(timeoutId);
      walletTransactionEventEmitter.off("newTransaction", handleTransaction);
    };
  }, [isVisible, transactionData, status]);

  const renderIcon = () => {
    switch (status) {
      case "pending":
        return (
          <View style={styles.iconContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        );
      case "success":
        return (
          <View style={[styles.iconContainer, styles.successContainer]}>
            <CheckCircle size={40} color="#059669" />
          </View>
        );
      case "error":
        return (
          <View style={[styles.iconContainer, styles.errorContainer]}>
            <XCircle size={40} color="#DC2626" />
          </View>
        );
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {renderIcon()}

          <Text style={styles.title}>
            {status === "pending"
              ? "Sending Coins"
              : status === "success"
                ? "Transaction Complete"
                : "Transaction Status"}
          </Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.details}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{transactionData.amount} CC</Text>

            <Text style={styles.detailLabel}>To Address</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {transactionData.recipientAddress}
            </Text>
          </View>

          {status === "error" && (
            <Text style={styles.errorMessage}>
              Don't worry - your coins are safe. You can check your transaction
              history for the latest status.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successContainer: {
    backgroundColor: "#DCFCE7",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  details: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
    marginTop: 16,
  },
});

export default TransactionStatusModal;
