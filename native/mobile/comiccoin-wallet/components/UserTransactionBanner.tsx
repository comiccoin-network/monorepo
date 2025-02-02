// monorepo/native/mobile/comiccoin-wallet/components/UserTransactionBanner.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Animated, StyleSheet, Platform } from "react-native";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  Flame,
} from "lucide-react-native";
import { useWallet } from "../hooks/useWallet";
import { transactionManager } from "../services/transaction/TransactionManager";
import type { TransactionEvent } from "../services/transaction/TransactionManager";

interface BannerNotification {
  type: string;
  direction: string;
  valueOrTokenID: number;
  timestamp: number;
  to?: string;
}

const BURN_ADDRESSES = [
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
  "0x0000000000000000000000000000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000000000000000000000000000dead",
].map((addr) => addr.toLowerCase());

export function UserTransactionBanner() {
  const { currentWallet } = useWallet();
  const [notification, setNotification] = useState<BannerNotification | null>(
    null,
  );
  const [slideAnim] = useState(new Animated.Value(-100));
  const notificationTimeoutRef = React.useRef<NodeJS.Timeout>();

  const animateBanner = useCallback(() => {
    console.log("🎬 Starting banner animation sequence");

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(5000),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log("🎭 Banner animation complete", {
        finalPosition: -100,
        notificationCleared: true,
      });
      notificationTimeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 100);
    });
  }, [slideAnim]);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const handleTransaction = useCallback(
    (event: TransactionEvent) => {
      console.log("🔔 Transaction received by banner:", {
        type: event.transaction.type,
        direction: event.transaction.direction,
        value: event.transaction.valueOrTokenID,
        timestamp: new Date(event.timestamp).toLocaleTimeString(),
        to: event.transaction.to?.slice(0, 6),
      });

      const newNotification = {
        type: event.transaction.type,
        direction: event.transaction.direction,
        valueOrTokenID: event.transaction.valueOrTokenID,
        timestamp: event.timestamp,
        to: event.transaction.to,
      };

      console.log("🔄 Updating banner notification state");
      setNotification(newNotification);
      console.log("▶️ Triggering banner animation");
      animateBanner();
    },
    [animateBanner],
  );

  useEffect(() => {
    console.log("🎯 Banner mount check:", {
      hasWallet: !!currentWallet,
      walletAddress: currentWallet?.address?.slice(0, 6) || "none",
    });

    if (!currentWallet?.address) {
      console.log("⚠️ Banner: No wallet available for subscription");
      return;
    }

    console.log("🔄 Banner: Initializing transaction subscription", {
      address: currentWallet.address.slice(0, 6),
      timestamp: new Date().toISOString(),
    });

    let subscriberId: string;
    try {
      subscriberId = transactionManager.subscribe(
        currentWallet.address,
        handleTransaction,
      );
      console.log("✅ Banner: Successfully subscribed to transactions", {
        subscriberId,
        address: currentWallet.address.slice(0, 6),
      });
    } catch (error) {
      console.error("❌ Banner: Failed to subscribe to transactions", error);
      return;
    }

    return () => {
      console.log("🧹 Banner: Starting cleanup process", {
        subscriberId,
        address: currentWallet.address.slice(0, 6),
      });

      try {
        transactionManager.unsubscribe(currentWallet.address, subscriberId);
        console.log("✅ Banner: Successfully unsubscribed");
      } catch (error) {
        console.error("❌ Banner: Error during unsubscribe:", error);
      }
    };
  }, [currentWallet?.address, handleTransaction]);

  if (!notification) {
    return null;
  }

  const isBurnTransaction =
    notification.to && BURN_ADDRESSES.includes(notification.to.toLowerCase());

  const renderTransactionIcon = () => {
    if (isBurnTransaction) {
      return <Flame size={24} color="#DC2626" strokeWidth={2} />;
    }
    switch (notification.direction) {
      case "TO":
        return <ArrowDownCircle size={24} color="#059669" strokeWidth={2} />;
      case "FROM":
        return <ArrowUpCircle size={24} color="#DC2626" strokeWidth={2} />;
      default:
        return <AlertCircle size={24} color="#D97706" strokeWidth={2} />;
    }
  };

  const getTransactionColor = () => {
    if (isBurnTransaction) return "#DC2626";
    switch (notification.direction) {
      case "TO":
        return "#059669";
      case "FROM":
        return "#DC2626";
      default:
        return "#D97706";
    }
  };

  const getTransactionText = () => {
    const value =
      notification.type === "token"
        ? `NFT #${notification.valueOrTokenID}`
        : `${notification.valueOrTokenID} CC`;

    if (isBurnTransaction) return `Burned ${value}`;
    return notification.direction === "TO"
      ? `Received ${value}`
      : `Sent ${value}`;
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.content}>
        {renderTransactionIcon()}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: getTransactionColor() }]}>
            {getTransactionText()}
          </Text>
          <Text style={styles.subtitle}>
            {isBurnTransaction ? "Burn confirmed" : "Transaction confirmed"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

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
