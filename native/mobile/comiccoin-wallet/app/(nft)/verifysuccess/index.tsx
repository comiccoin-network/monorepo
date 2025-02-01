// monorepo/native/mobile/comiccoin-wallet/app/(nft)/verifysuccess/index.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import transactionListService from "../../../services/transaction/ListService";
import { useWallet } from "../../../hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react-native";

type VerificationState = "verifying" | "success" | "failure";

export default function VerifySuccessScreen() {
  const { token_id, token_metadata_uri } = useLocalSearchParams();
  const { currentWallet } = useWallet();
  const noMatchCounter = useRef(0);
  const matchCounter = useRef(0);
  const [verificationState, setVerificationState] =
    useState<VerificationState>("verifying");

  const {
    data: transactions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rawTransactions", currentWallet?.address],
    queryFn: async () => {
      if (!currentWallet?.address) return [];

      const txList = await transactionListService.fetchWalletTransactions(
        currentWallet.address,
        "token",
      );
      return txList;
    },
    enabled: !!currentWallet?.address,
  });

  useEffect(() => {
    const checkTransaction = async () => {
      if (!token_id) {
        router.replace("/nfts");
        return;
      }

      if (!currentWallet?.address) {
        return;
      }

      const transferTransaction = transactions.find(
        (tx) =>
          tx.tokenId === token_id &&
          tx.from.toLowerCase() === currentWallet.address.toLowerCase(),
      );

      if (transferTransaction) {
        matchCounter.current += 1;

        if (matchCounter.current >= 3) {
          setVerificationState("success");
          clearInterval(pollingInterval);
        }
      } else {
        noMatchCounter.current += 1;

        if (noMatchCounter.current >= 10) {
          setVerificationState("failure");
          clearInterval(pollingInterval);
        }
      }
    };

    // Run initial check
    checkTransaction();

    // Set up polling interval
    const pollingInterval = setInterval(() => {
      refetch()
        .then(() => {
          checkTransaction();
        })
        .catch((err) => {
          console.log("Error during refresh:", err);
        });
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(pollingInterval);
    };
  }, [token_id, transactions, refetch, currentWallet?.address]);

  const renderVerifying = () => (
    <>
      <ActivityIndicator size="large" color="#7e22ce" />
      <Text style={styles.title}>Verifying Transaction</Text>
      <Text style={styles.subtitle}>
        Please wait while we verify your transaction. This may take a few
        moments.
      </Text>
    </>
  );

  const renderSuccess = () => (
    <>
      <View style={styles.iconContainer}>
        <CheckCircle2 size={48} color="#059669" />
      </View>
      <Text style={styles.title}>Transfer Successful!</Text>
      <Text style={styles.subtitle}>
        The transaction was successfully carried out by the ComicCoin Blockchain
        Authority.
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => router.replace("/nfts?submission_status=success")}
      >
        <Text style={styles.buttonText}>Return to Collection</Text>
        <ArrowRight size={20} color="white" />
      </Pressable>
    </>
  );

  const renderFailure = () => (
    <>
      <View style={styles.iconContainer}>
        <AlertCircle size={48} color="#DC2626" />
      </View>
      <Text style={styles.title}>Transfer Failed</Text>
      <Text style={styles.subtitle}>
        The ComicCoin Blockchain Authority was unable to carry out the
        transaction. Please verify:
      </Text>
      <View style={styles.checkList}>
        <Text style={styles.checkListItem}>
          • Your wallet is properly loaded
        </Text>
        <Text style={styles.checkListItem}>
          • You entered the correct recipient address
        </Text>
        <Text style={styles.checkListItem}>
          • You have ownership of the NFT
        </Text>
        <Text style={styles.checkListItem}>
          • You have enough balance for network fees
        </Text>
      </View>
      <Pressable
        style={[styles.button, styles.blockchainButton]}
        onPress={() => Linking.openURL("https://explorer.comiccoin.com")}
      >
        <Text style={styles.buttonText}>
          View ComicCoin Blockchain Authority
        </Text>
        <ExternalLink size={20} color="white" />
      </Pressable>
    </>
  );

  return (
    <View style={styles.container}>
      {verificationState === "verifying" && renderVerifying()}
      {verificationState === "success" && renderSuccess()}
      {verificationState === "failure" && renderFailure()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginTop: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 24,
  },
  checkList: {
    alignSelf: "stretch",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#FEE2E2", // Slightly darker red border
      },
    }),
  },
  checkListItem: {
    fontSize: 14,
    color: "#991B1B",
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    overflow: "hidden",
    ...Platform.select({
      android: {
        elevation: 0, // Remove elevation
      },
    }),
  },
  blockchainButton: {
    backgroundColor: "#DC2626",
    ...Platform.select({
      android: {
        elevation: 0, // Ensure no elevation on this variant too
      },
    }),
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
