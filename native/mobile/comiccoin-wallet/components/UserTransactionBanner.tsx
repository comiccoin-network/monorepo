// monorepo/native/mobile/comiccoin-wallet/components/UserTransactionBanner.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet, Platform } from "react-native";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
} from "lucide-react-native";
import { walletTransactionEventEmitter } from "../utils/eventEmitter";
import { LatestBlockTransaction } from "../services/transaction/LatestBlockTransactionSSEService";

interface TransactionNotification {
  type: string;
  direction: string;
  valueOrTokenID: number;
  timestamp: number;
  walletAddress: string;
}

const UserTransactionBanner = () => {
  const [notification, setNotification] =
    useState<TransactionNotification | null>(null);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    const listener = (data: {
      walletAddress: string;
      transaction: LatestBlockTransaction;
    }) => {
      console.log("📢 New transaction detected in banner:", data);

      setNotification({
        ...data.transaction,
        walletAddress: data.walletAddress,
      });

      // Slide in animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        // Hold the banner for 5 seconds
        Animated.delay(5000),
        // Slide out animation
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Clear notification after animation completes
        setNotification(null);
      });
    };

    walletTransactionEventEmitter.on("newTransaction", listener);

    return () => {
      walletTransactionEventEmitter.off("newTransaction", listener);
    };
  }, [slideAnim]);

  if (!notification) {
    return null;
  }

  const getTransactionIcon = () => {
    if (notification.direction === "TO") {
      return <ArrowDownCircle size={24} color="#059669" strokeWidth={2} />;
    } else if (notification.direction === "outgoing") {
      return <ArrowUpCircle size={24} color="#DC2626" strokeWidth={2} />;
    }
    return <AlertCircle size={24} color="#D97706" strokeWidth={2} />;
  };

  const getTransactionColor = () => {
    switch (notification.direction) {
      case "TO":
        return "#059669";
      case "outgoing":
        return "#DC2626";
      default:
        return "#D97706";
    }
  };

  const getTransactionText = () => {
    const value =
      notification.type === "nft"
        ? `NFT #${notification.valueOrTokenID}`
        : `${notification.valueOrTokenID} CC`;

    return notification.direction === "TO"
      ? `Received ${value}`
      : `Sent ${value}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        {getTransactionIcon()}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: getTransactionColor() }]}>
            {getTransactionText()}
          </Text>
          <Text style={styles.subtitle}>Transaction confirmed</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
});

export default UserTransactionBanner;
