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
import { useNFTCollection } from "../../hooks/useNFTCollection";
import { Image } from "expo-image";
import { walletTransactionEventEmitter } from "../../utils/eventEmitter";
import NFTCard from "../../components/NFTCard";

export default function NFTsScreen() {
  const router = useRouter();
  const { currentWallet, loading: walletLoading } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  const mountCount = useRef(0);

  // Debug mounting
  useEffect(() => {
    mountCount.current += 1;
    console.log("🎭 NFTs Screen mounted", {
      mountCount: mountCount.current,
      hasWallet: !!currentWallet,
      walletLoading,
    });

    return () => {
      console.log("🎭 NFTs Screen unmounting", {
        mountCount: mountCount.current,
      });
    };
  }, [currentWallet, walletLoading]);

  // Memoize wallet address with debug
  const walletAddress = useMemo(() => {
    const address = currentWallet?.address || null;
    console.log("💼 Wallet address memo updated:", {
      address,
      hasWallet: !!currentWallet,
    });
    return address;
  }, [currentWallet?.address]);

  // Get NFT collection data
  const {
    nftCollection,
    loading: nftLoading,
    error,
    refresh: refreshCollection,
  } = useNFTCollection(walletAddress);

  // Debug state changes
  useEffect(() => {
    console.log("🔄 NFTs Screen state update:", {
      walletAddress,
      nftCount: nftCollection.length,
      isLoading: nftLoading,
      isRefreshing,
      hasError: !!error,
      timestamp: new Date().toISOString(),
    });
  }, [walletAddress, nftCollection, nftLoading, isRefreshing, error]);

  // Log NFT collection data with more detail
  useEffect(() => {
    if (nftCollection.length > 0) {
      console.log("📦 NFT Collection details:", {
        count: nftCollection.length,
        tokens: nftCollection.map((nft) => ({
          tokenId: nft.tokenId,
          hasMetadata: !!nft.metadata,
        })),
      });
    } else {
      console.log("📦 NFT Collection is empty", {
        walletAddress,
        loading: nftLoading,
        isRefreshing,
      });
    }
  }, [nftCollection, walletAddress, nftLoading, isRefreshing]);

  // Effect to handle transaction events with debug
  useEffect(() => {
    if (!walletAddress) {
      console.log("🎧 Skip transaction listener - no wallet");
      return;
    }

    const handleNewTransaction = async (data: {
      walletAddress: string;
      transaction: {
        type: string;
        timestamp: number;
        valueOrTokenID: string;
        to: string;
      };
    }) => {
      console.log("📨 New transaction received:", {
        matchesWallet: data.walletAddress === walletAddress,
        type: data.transaction.type,
        isRefreshing: refreshingRef.current,
      });

      if (
        data.walletAddress === walletAddress &&
        data.transaction.type === "token" &&
        !refreshingRef.current
      ) {
        console.log("🔍 Processing relevant transaction");
        refreshingRef.current = true;
        setIsRefreshing(true);

        try {
          await refreshCollection();
          console.log("✅ Transaction-triggered refresh complete");
        } catch (error) {
          console.error("❌ Transaction-triggered refresh failed:", error);
        } finally {
          setIsRefreshing(false);
          refreshingRef.current = false;
        }
      }
    };

    console.log("🎧 Setting up transaction listener in NFTs screen", {
      walletAddress,
    });
    walletTransactionEventEmitter.on("newTransaction", handleNewTransaction);

    return () => {
      console.log("🔌 Removing transaction listener from NFTs screen", {
        walletAddress,
      });
      walletTransactionEventEmitter.off("newTransaction", handleNewTransaction);
    };
  }, [walletAddress, refreshCollection]);

  // Handle manual refresh with debug
  const handleRefresh = useCallback(async () => {
    if (refreshingRef.current || isRefreshing) {
      console.log("⚠️ Refresh skipped - already in progress", {
        refreshingRef: refreshingRef.current,
        isRefreshing,
      });
      return;
    }

    console.log("🔄 Starting manual refresh", {
      walletAddress,
    });
    refreshingRef.current = true;
    setIsRefreshing(true);

    try {
      await refreshCollection();
      console.log("✅ Manual refresh complete");
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    } finally {
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
  }, [refreshCollection, isRefreshing]);

  // Redirect to login if no wallet with debug
  useEffect(() => {
    console.log("🔐 Checking wallet status:", {
      hasWallet: !!currentWallet,
      isLoading: walletLoading,
    });

    if (!currentWallet && !walletLoading) {
      console.log("🔄 Redirecting to login - no wallet");
      router.replace("/login");
    }
  }, [currentWallet, walletLoading, router]);

  // Handle NFT selection
  const onNFTSelect = useCallback(
    (nft: NFT) => {
      console.log("🎯 NFT selected:", {
        tokenId: nft.tokenId,
        walletAddress: currentWallet?.address,
      });

      // Emit selection event
      walletTransactionEventEmitter.emit("nftSelected", {
        walletAddress: currentWallet?.address,
        tokenId: nft.tokenId,
        timestamp: Date.now(),
      });

      // Navigate to NFT detail screen
      const metadataCID = nft.tokenMetadataURI.replace("ipfs://", "");
      router.push(
        `/(nft)/${metadataCID}?metadata_uri=${encodeURIComponent(
          nft.tokenMetadataURI,
        )}&token_id=${nft.tokenId}`,
      );
    },
    [currentWallet?.address, router],
  );

  // Loading state
  if (walletLoading || nftLoading) {
    console.log("⏳ Rendering loading state", {
      walletLoading,
      nftLoading,
    });
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your collection...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    console.log("❌ Rendering error state:", {
      error: error.message,
    });
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading collection: {error.message}
        </Text>
        <Pressable onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  console.log("🎨 Rendering NFT collection view", {
    collectionLength: nftCollection.length,
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
