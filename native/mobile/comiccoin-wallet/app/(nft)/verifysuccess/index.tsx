// monorepo/native/mobile/comiccoin-wallet/app/(nft)/verifysuccess/index.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import transactionListService from "../../../services/transaction/ListService";
import { useWallet } from "../../../hooks/useWallet";
import { useQuery } from "@tanstack/react-query";

export default function VerifySuccessScreen() {
  const { token_id, token_metadata_uri } = useLocalSearchParams();
  const { currentWallet } = useWallet();
  const noMatchCounter = useRef(0);
  const matchCounter = useRef(0);

  const {
    data: transactions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rawTransactions", currentWallet?.address],
    queryFn: async () => {
      console.log(
        "\n📥 Fetching raw transactions for:",
        currentWallet?.address,
      );
      if (!currentWallet?.address) return [];

      const txList = await transactionListService.fetchWalletTransactions(
        currentWallet.address,
        "token",
      );
      console.log("Raw transactions received:", txList.length);
      return txList;
    },
    enabled: !!currentWallet?.address,
  });

  useEffect(() => {
    console.log("\n⏰ Setting up verification polling");

    const checkTransaction = async () => {
      console.log("\n📋 Running transaction check");

      if (!token_id) {
        console.log("❌ No token_id found in params, redirecting to /nfts");
        router.replace("/nfts");
        return;
      }

      if (!currentWallet?.address) {
        console.log("⚠️ No wallet loaded, waiting for wallet");
        return;
      }

      // Look for a transaction where we transferred this NFT (we were the sender)
      const transferTransaction = transactions.find(
        (tx) =>
          tx.tokenId === token_id &&
          tx.from.toLowerCase() === currentWallet.address.toLowerCase(),
      );

      if (transferTransaction) {
        matchCounter.current += 1;
        console.log(
          "✅ Found transfer transaction (attempt " +
            matchCounter.current +
            "/3):",
          {
            txTokenId: transferTransaction.tokenId,
            txTimestamp: new Date(
              transferTransaction.timestamp * 1000,
            ).toISOString(),
            txFrom: transferTransaction.from,
            txTo: transferTransaction.to,
          },
        );

        if (matchCounter.current >= 3) {
          console.log("✅ Verification complete - NFT transfer confirmed");
          router.replace("/nfts?submission_status=success");
        }
      } else {
        noMatchCounter.current += 1;
        console.log(
          "⚠️ No transfer found - attempt:",
          noMatchCounter.current + "/10",
        );

        if (noMatchCounter.current >= 10) {
          console.log("❌ Max attempts reached without finding transfer");
          router.replace("/nfts?submission_status=failure");
        }
      }
    };

    // Run initial check
    checkTransaction();

    // Set up polling interval
    const pollingInterval = setInterval(() => {
      console.log("\n🔄 Polling interval triggered");
      refetch()
        .then(() => {
          console.log("Transactions refreshed, running check");
          checkTransaction();
        })
        .catch((err) => {
          console.error("Error during refresh:", err);
        });
    }, 5000);

    // Cleanup
    return () => {
      console.log("\n🧹 Cleaning up - clearing polling interval");
      clearInterval(pollingInterval);
    };
  }, [token_id, transactions, refetch, currentWallet?.address]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7e22ce" />
      <Text style={styles.title}>Verifying Transaction</Text>
      <Text style={styles.subtitle}>
        Please wait while we verify your transaction. This may take a few
        moments.
      </Text>
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
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    maxWidth: "80%",
  },
});
