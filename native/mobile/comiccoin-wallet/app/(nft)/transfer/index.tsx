// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/transfer/index.tsx
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
import { useLocalSearchParams } from "expo-router";
import { SendHorizontal, User } from "lucide-react-native";
import { useNFTMetadata } from "../../../hooks/useNFTMetadata";

export default function TransferNFTScreen() {
  const { token_id, token_metadata_uri } = useLocalSearchParams();
  const [recipient, setRecipient] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");

  const { data: metadataData } = useNFTMetadata(token_metadata_uri);
  const metadata = metadataData?.metadata;

  const validateAddress = (address: string) => {
    // TODO: Implement proper address validation
    return address.length > 0;
  };

  const handleTransfer = async () => {
    if (!validateAddress(recipient)) {
      setError("Please enter a valid recipient address");
      return;
    }

    Alert.alert(
      "Transfer NFT",
      `Are you sure you want to transfer ${metadata?.name || `Comic #${token_id}`} to ${recipient}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          onPress: async () => {
            setIsTransferring(true);
            setError("");
            try {
              // TODO: Implement transfer transaction
              await new Promise((resolve) => setTimeout(resolve, 1000));
              Alert.alert("Success", "NFT has been transferred successfully");
            } catch (error) {
              setError("Failed to transfer NFT. Please try again.");
            } finally {
              setIsTransferring(false);
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient Address</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Enter recipient's address"
                value={recipient}
                onChangeText={(text) => {
                  setRecipient(text);
                  setError("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isTransferring}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Pressable
            style={[
              styles.transferButton,
              isTransferring && styles.transferButtonDisabled,
            ]}
            onPress={handleTransfer}
            disabled={isTransferring || !recipient}
          >
            {isTransferring ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <SendHorizontal size={20} color="white" />
                <Text style={styles.transferButtonText}>Transfer NFT</Text>
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
    gap: 24,
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  transferButton: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  transferButtonDisabled: {
    opacity: 0.5,
  },
  transferButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
