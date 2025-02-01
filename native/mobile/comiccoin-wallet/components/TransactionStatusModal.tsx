// monorepo/native/mobile/comiccoin-wallet/components/TransactionStatusModal.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import { walletTransactionEventEmitter } from "../utils/eventEmitter";

interface TransactionStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  transactionData: {
    amount: number;
    recipientAddress: string;
    walletAddress: string;
  };
}

const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  isVisible,
  onClose,
  transactionData,
}) => {
  // Core state management
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [message, setMessage] = useState("Processing your transaction...");
  const [canClose, setCanClose] = useState(false);

  // Modal lifecycle management
  const modalState = useRef({
    initialized: false,
    hasSucceeded: false,
    timeoutId: null as NodeJS.Timeout | null,
  });

  // Lifecycle logging
  useEffect(() => {
    console.log(`
🔄 Component Lifecycle Update
================================
📍 Status: ${status}
👁️ Visible: ${isVisible}
🔒 Can Close: ${canClose}
✨ Initialized: ${modalState.current.initialized}
✅ Success: ${modalState.current.hasSucceeded}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);
  }, [status, isVisible, canClose]);

  // Handle successful transaction
  const handleTransactionSuccess = useCallback(() => {
    modalState.current.hasSucceeded = true;
    setStatus("success");
    setMessage("Transaction completed successfully!");
    setCanClose(true);
  }, []);

  // Transaction matching logic
  const handleTransaction = useCallback(
    (data: {
      walletAddress: string;
      transaction: {
        direction: string;
        valueOrTokenID: number;
      };
    }) => {
      // Skip processing if already succeeded
      if (modalState.current.hasSucceeded) {
        console.log("Transaction already succeeded, skipping processing");
        return;
      }

      console.log(`
📥 Received Transaction Event
================================
🎯 Checking Transaction Match Conditions:

1. Wallet Address Match:
   Expected: ${transactionData.walletAddress}
   Received: ${data.walletAddress}
   Matches?: ${data.walletAddress === transactionData.walletAddress}

2. Transaction Direction:
   Expected: FROM
   Received: ${data.transaction.direction}
   Matches?: ${data.transaction.direction === "FROM"}

3. Amount Match:
   Expected: ${transactionData.amount} (${typeof transactionData.amount})
   Received: ${data.transaction.valueOrTokenID} (${typeof data.transaction.valueOrTokenID})
   Strict Match?: ${data.transaction.valueOrTokenID === transactionData.amount}

⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

      const walletMatch = data.walletAddress === transactionData.walletAddress;
      const directionMatch = data.transaction.direction === "FROM";
      const amountMatch =
        data.transaction.valueOrTokenID === transactionData.amount;

      console.log(`
🔍 Match Results:
================================
✓ Wallet Match: ${walletMatch}
✓ Direction Match: ${directionMatch}
✓ Amount Match: ${amountMatch}
✓ All Conditions Met: ${walletMatch && directionMatch && amountMatch}
================================`);

      if (walletMatch && directionMatch && amountMatch) {
        console.log("🎉 Transaction match found - updating status to success");
        handleTransactionSuccess();
      }
    },
    [transactionData, handleTransactionSuccess],
  );

  // Modal visibility and listener management
  useEffect(() => {
    // Skip if modal isn't visible
    if (!isVisible) {
      console.log(`
🚫 Modal not visible - skipping listener setup
================================
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);
      return;
    }

    console.log(`
🎯 Setting up transaction listener
================================
💰 Amount: ${transactionData?.amount}
🏦 To: ${transactionData?.recipientAddress?.slice(0, 6)}...
⚡ Listener Active: ${Boolean(walletTransactionEventEmitter.listenerCount("newTransaction"))}
✨ Initialized: ${modalState.current.initialized}
✅ Success: ${modalState.current.hasSucceeded}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

    // Only initialize state if not already done
    if (!modalState.current.initialized) {
      modalState.current.initialized = true;
      modalState.current.hasSucceeded = false;
      setStatus("pending");
      setMessage("Processing your transaction...");
      setCanClose(false);
    }

    // Set up error timeout only if not succeeded
    if (!modalState.current.hasSucceeded && !modalState.current.timeoutId) {
      modalState.current.timeoutId = setTimeout(() => {
        if (!modalState.current.hasSucceeded) {
          console.log("⏰ Transaction timeout - updating status to error");
          setStatus("error");
          setMessage(
            "Transaction is taking longer than expected. Please check your transaction history for updates.",
          );
          setCanClose(true);
        }
      }, 30000);
    }

    // Subscribe to transaction events
    walletTransactionEventEmitter.on("newTransaction", handleTransaction);

    // Cleanup function
    return () => {
      console.log(`
🧹 Cleaning up transaction listener
================================
📍 Status: ${status}
✨ Initialized: ${modalState.current.initialized}
✅ Success: ${modalState.current.hasSucceeded}
🔄 Active Listeners: ${walletTransactionEventEmitter.listenerCount("newTransaction")}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

      if (modalState.current.timeoutId) {
        clearTimeout(modalState.current.timeoutId);
        modalState.current.timeoutId = null;
      }

      walletTransactionEventEmitter.off("newTransaction", handleTransaction);
    };
  }, [isVisible, handleTransaction, transactionData]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (canClose) {
      console.log(`
🚪 Modal closing
================================
📍 Final Status: ${status}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

      // Reset state for next use
      modalState.current.initialized = false;
      modalState.current.hasSucceeded = false;
      onClose();
    }
  }, [canClose, status, onClose]);

  // Helper function to render the appropriate icon based on status
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
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
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

          {canClose && (
            <TouchableOpacity
              style={[
                styles.closeButton,
                status === "success"
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>
                {status === "success" ? "Done" : "Close"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Styles for the modal components
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
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  successButton: {
    backgroundColor: "#059669",
  },
  errorButton: {
    backgroundColor: "#DC2626",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TransactionStatusModal;
