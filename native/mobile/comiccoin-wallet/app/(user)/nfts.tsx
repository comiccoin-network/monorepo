// monorepo/native/mobile/comiccoin-wallet/app/(user)/nfts.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ImageIcon, ExternalLink, RotateCw } from "lucide-react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useWallet } from "../../hooks/useWallet";
import { useNFTTransactions } from "../../hooks/useNFTTransactions";
import NFTCard from "../../components/NFTCard";
import { transactionManager } from "../../services/transaction/TransactionManager";
import type { TransactionEvent } from "../../services/transaction/TransactionManager";

export default function NFTsScreen() {
  const router = useRouter();
  const { currentWallet, loading: walletLoading } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const mountCount = useRef(0);
  const lastTransactionRef = useRef<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onNFTSelect = useCallback(
    (nft: (typeof nftCollection)[0]) => {
      console.log("🎯 NFT selection initiated:", {
        tokenId: nft.tokenId,
        name: nft.metadata?.name,
        walletAddress: currentWallet?.address?.slice(0, 6),
      });

      try {
        const metadataCID = nft.tokenMetadataURI.replace("ipfs://", "");
        const navigationPath = `/(nft)/${metadataCID}`;
        const queryParams = new URLSearchParams({
          metadata_uri: nft.tokenMetadataURI,
          token_id: nft.tokenId,
        });

        console.log("🔄 Navigating to NFT detail view:", {
          path: navigationPath,
          params: queryParams.toString(),
        });

        router.push(`${navigationPath}?${queryParams.toString()}`);
      } catch (error) {
        console.log("❌ Navigation error:", {
          error: error instanceof Error ? error.message : "Unknown error",
          tokenId: nft.tokenId,
        });
      }
    },
    [currentWallet?.address, router],
  );

  // Memoize wallet address
  const walletAddress = useMemo(() => {
    if (!currentWallet?.address) {
      console.log("💼 No wallet address available");
      return undefined;
    }

    const address = currentWallet.address.toLowerCase();
    console.log("💼 Wallet address updated:", {
      address: address.slice(0, 6),
      hasWallet: true,
    });
    return address;
  }, [currentWallet?.address]);

  // Get NFT transactions data with stable reference
  const {
    transactions: nftTransactions,
    isLoading: nftLoading,
    error,
    refresh: softRefresh,
    hardRefresh,
  } = useNFTTransactions(walletAddress, {
    enabled: Boolean(walletAddress),
  });

  // Transform transactions to NFT collection with stable reference
  const nftCollection = useMemo(() => {
    try {
      console.log("🔄 Processing NFT collection", {
        transactionCount: nftTransactions.length,
      });

      return nftTransactions
        .filter((tx) => tx.tokenMetadata && tx.tokenId)
        .map((tx) => ({
          tokenId: tx.tokenId!,
          tokenMetadataURI: tx.tokenMetadataURI!,
          metadata: tx.tokenMetadata!,
          transaction: tx,
        }));
    } catch (error) {
      console.log("❌ Collection processing error:", error);
      return [];
    }
  }, [nftTransactions]);

  // Debounced refresh handler
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      console.log("🔄 Executing debounced refresh");
      hardRefresh();
    }, 1000);
  }, [hardRefresh]);

  // Handle new transactions with debouncing
  const handleNewTransaction = useCallback(
    (event: TransactionEvent) => {
      console.log("🔔 NFT transaction received", {
        type: event.transaction.type,
        direction: event.transaction.direction,
        tokenId: event.transaction.valueOrTokenID,
      });

      if (event.transaction.type !== "token") {
        console.log("⏭️ Ignoring non-token transaction");
        return;
      }

      const transactionId = `${event.timestamp}-${event.transaction.valueOrTokenID}`;

      if (lastTransactionRef.current === transactionId) {
        console.log("⏭️ Skipping duplicate token event");
        return;
      }

      console.log(
        "🔄 Triggering refresh for new token",
        event.transaction.valueOrTokenID,
      );
      lastTransactionRef.current = transactionId;
      hardRefresh();
    },
    [hardRefresh],
  );

  // Clean up resources
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Transaction subscription management
  useEffect(() => {
    if (!walletAddress) {
      console.log("📡 No wallet address for subscription");
      return;
    }

    console.log("📡 Setting up transaction subscription", {
      address: walletAddress.slice(0, 6),
    });

    try {
      const subscriberId = transactionManager.subscribe(
        walletAddress,
        handleNewTransaction,
      );
      return () => {
        console.log("📡 Cleaning up subscription");
        transactionManager.unsubscribe(walletAddress, subscriberId);
      };
    } catch (error) {
      console.log("❌ Subscription error:", error);
    }
  }, [walletAddress, handleNewTransaction]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    if (refreshingRef.current || isRefreshing) {
      console.log("⚠️ Refresh already in progress");
      return;
    }

    if (!walletAddress) {
      console.log("⚠️ No wallet address for refresh");
      return;
    }

    console.log("🔄 Starting manual refresh");
    refreshingRef.current = true;
    setIsRefreshing(true);

    try {
      await softRefresh();
      console.log("✅ Manual refresh complete");
    } catch (error) {
      console.log("❌ Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
  }, [softRefresh, isRefreshing, walletAddress]);

  // Render loading state
  if (walletLoading || nftLoading) {
    console.log("⏳ Showing loading state");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your collection...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    console.log("❌ Showing error state:", error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading collection:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
        <Pressable onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  console.log("🎨 Rendering collection view", {
    itemCount: nftCollection.length,
    isRefreshing,
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>My NFT Collection</Text>
            <Pressable
              onPress={handleRefresh}
              style={({ pressed }) => [
                styles.refreshButton,
                pressed && styles.refreshButtonPressed,
              ]}
              disabled={isRefreshing}
            >
              <RotateCw
                size={24}
                color="#7C3AED"
                style={[
                  isRefreshing && styles.rotating,
                  { opacity: isRefreshing ? 0.5 : 1 },
                ]}
              />
            </Pressable>
          </View>
          <Text style={styles.headerSubtitle}>
            Manage and showcase your digital comic book collectibles
          </Text>
        </View>

        {nftCollection.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ImageIcon size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Comics Found</Text>
            <Text style={styles.emptySubtitle}>
              Start your NFT collection by getting your comics graded
            </Text>
            <Pressable
              onPress={() => Linking.openURL("https://cpscapsule.com")}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Visit CPS Capsule</Text>
              <ExternalLink size={18} color="#7C3AED" />
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={nftCollection}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <NFTCard nft={item} onPress={() => onNFTSelect(item)} />
              </View>
            )}
            keyExtractor={(item) => item.tokenId}
            contentContainerStyle={styles.listContainer}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={Platform.OS === "android" ? 56 : 0}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
  },
  refreshButtonPressed: {
    backgroundColor: "#EDE9FE",
  },
  rotating: {
    transform: [{ rotate: "45deg" }],
  },
  listContainer: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  // Card styles
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  // Badge styles
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  receivedBadge: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  transferredBadge: {
    backgroundColor: "#DBEAFE",
    borderColor: "#BFDBFE",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  receivedText: {
    color: "#166534",
  },
  transferredText: {
    color: "#1E40AF",
  },
  // Metadata styles
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  gradeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  // Error state
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  linkText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "500",
  },
});
