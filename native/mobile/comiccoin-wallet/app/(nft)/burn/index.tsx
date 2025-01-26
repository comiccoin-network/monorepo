// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/burn/index.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Flame, AlertCircle } from "lucide-react-native";
import { useNFTMetadata } from "../../../hooks/useNFTMetadata";

export default function BurnNFTScreen() {
  const { token_id, token_metadata_uri } = useLocalSearchParams();
  const [isBurning, setIsBurning] = useState(false);

  const { data: metadataData } = useNFTMetadata(token_metadata_uri);
  const metadata = metadataData?.metadata;

  const handleBurn = async () => {
    Alert.alert(
      "Burn NFT",
      `Are you sure you want to burn ${metadata?.name || `Comic #${token_id}`}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Burn",
          style: "destructive",
          onPress: async () => {
            setIsBurning(true);
            try {
              // TODO: Implement burn transaction
              await new Promise((resolve) => setTimeout(resolve, 1000));
              Alert.alert("Success", "NFT has been burned successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to burn NFT. Please try again.");
            } finally {
              setIsBurning(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <AlertCircle size={24} color="#DC2626" />
          <Text style={styles.warningTitle}>Warning</Text>
          <Text style={styles.warningText}>
            Burning an NFT permanently destroys it. This action cannot be
            undone.
          </Text>
        </View>

        <Pressable
          style={[styles.burnButton, isBurning && styles.burnButtonDisabled]}
          onPress={handleBurn}
          disabled={isBurning}
        >
          {isBurning ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Flame size={20} color="white" />
              <Text style={styles.burnButtonText}>Burn NFT</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
  },
  warningText: {
    fontSize: 16,
    color: "#7F1D1D",
    textAlign: "center",
    lineHeight: 24,
  },
  burnButton: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
