// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/burn/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Flame, User, AlertCircle, Info, Wallet } from "lucide-react-native";
import { useNFTMetadata } from "../../../hooks/useNFTMetadata";
import { useNFTTransfer } from "../../../hooks/useNFTTransfer";
import { useWallet } from "../../../hooks/useWallet";
import { useWalletTransactions } from "../../../hooks/useWalletTransactions";

const ETHEREUM_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface FormData {
  password: string;
  tokenID: string;
  tokenMetadataURI: string;
}

interface FormErrors {
  password?: string;
  tokenID?: string;
  tokenMetadataURI?: string;
  balance?: string;
  submit?: string;
}

export default function BurnNFTScreen() {
  const { token_id, token_metadata_uri } = useLocalSearchParams();
  const { currentWallet } = useWallet();
  const { statistics } = useWalletTransactions(currentWallet?.address);
  const { submitTransaction, loading: transferLoading } = useNFTTransfer(1); // chainId 1
  const { data: metadataData } = useNFTMetadata(token_metadata_uri as string);

  const [formData, setFormData] = useState<FormData>({
    password: "",
    tokenID: token_id as string,
    tokenMetadataURI: token_metadata_uri as string,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const currentBalance = statistics?.totalCoinValue || 0;
    const requiredBalance = 1; // 1 CC for network fee

    if (!formData.password) {
      newErrors.password = "Password is required to authorize burn transaction";
    }

    // Check if we have enough balance for network fee
    if (currentBalance < requiredBalance) {
      newErrors.balance = `Insufficient balance. You need ${requiredBalance} CC for the network fee, but you only have ${currentBalance} CC`;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBurn = async () => {
    if (!validateForm()) {
      return;
    }

    Alert.alert(
      "Confirm NFT Burn",
      `Are you sure you want to burn this NFT?\n\nNetwork Fee: 1 CC\nRemaining Balance: ${
        (statistics?.totalCoinValue || 0) - 1
      } CC\n\nThis action is irreversible and the NFT will be permanently destroyed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Burn",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const result = await submitTransaction(
                ETHEREUM_ZERO_ADDRESS,
                1, // network fee
                "", // no note
                currentWallet!,
                formData.password,
                formData.tokenID,
                formData.tokenMetadataURI,
              );

              if (result.success) {
                console.log("Successfully burned NFT");
                router.push(
                  `/(nft)/verifysuccess?token_id=${token_id}&token_metadata_uri=${token_metadata_uri}`,
                );
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Failed to burn NFT";

              // Handle the specific ownership error
              if (errorMessage.includes("not the current owner")) {
                Alert.alert(
                  "Burn Error",
                  "You cannot burn this NFT because you are not its current owner. This may happen if the NFT was recently transferred to another address.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.push("/nfts"),
                    },
                  ],
                );
              } else {
                Alert.alert("Error", errorMessage);
              }
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Balance Card */}
          <View style={styles.card}>
            <View style={styles.balanceHeader}>
              <View style={styles.iconContainer}>
                <Wallet size={20} color="#DC2626" />
              </View>
              <Text style={styles.balanceTitle}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {statistics?.totalCoinValue || 0} CC
              </Text>
            </View>
            <View style={styles.balanceDetails}>
              <View style={styles.feeRow}>
                <Text style={styles.feeText}>Network Fee</Text>
                <Text style={styles.feeAmount}>- 1 CC</Text>
              </View>
              <View style={styles.remainingRow}>
                <Text style={styles.remainingText}>Remaining Balance</Text>
                <Text style={styles.remainingAmount}>
                  = {(statistics?.totalCoinValue || 0) - 1} CC
                </Text>
              </View>
            </View>
          </View>

          {/* Warning Card */}
          <View style={styles.warningCard}>
            <AlertCircle size={20} color="#DC2626" />
            <Text style={styles.warningText}>
              Warning: Burning an NFT permanently destroys it. This action
              cannot be undone and the NFT will be lost forever.
            </Text>
          </View>

          {/* Input Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wallet Password</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.password && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="Enter your wallet password"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, password: text }));
                  setFormErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry
                editable={!isSubmitting}
              />
            </View>
            {formErrors.password && (
              <Text style={styles.errorText}>{formErrors.password}</Text>
            )}
            <View style={styles.infoContainer}>
              <Info size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Your wallet is encrypted and stored locally. The password is
                required to authorize this burn transaction.
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.burnButton,
              (isSubmitting || !formData.password) && styles.burnButtonDisabled,
            ]}
            onPress={handleBurn}
            disabled={isSubmitting || !formData.password}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Flame size={20} color="white" />
                <Text style={styles.burnButtonText}>Burn NFT</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  balanceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC2626",
  },
  balanceDetails: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    gap: 8,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feeText: {
    fontSize: 14,
    color: "#DC2626",
  },
  feeAmount: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
  },
  remainingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  remainingText: {
    fontSize: 14,
    color: "#4B5563",
  },
  remainingAmount: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        borderWidth: 0,
      },
      android: {
        borderWidth: 1,
        borderColor: "#FEE2E2", // Slightly darker red border for burn warning
      },
    }),
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
  },
  burnButton: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    ...Platform.select({
      android: {
        elevation: 0, // Remove any potential elevation
      },
    }),
  },
  burnButtonDisabled: {
    opacity: 0.5,
  },
  burnButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
