// monorepo/native/mobile/comiccoin-wallet/app/(user)/nfts.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  Pressable,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ImageIcon,
  Search,
  Tag,
  Clock,
  Coins,
  CheckCircle,
  ExternalLink,
  RotateCw,
} from "lucide-react-native";
import { useWallet } from "../../hooks/useWallet";
import { useNFTCollection } from "../../hooks/useNFTCollection";
import { convertIPFSToGatewayURL } from "../../services/nft/MetadataService";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

interface NFT {
  tokenId: string;
  tokenMetadataURI: string;
  transactions: Array<{
    to: string;
    timestamp: string;
    tokenMetadataURI: string;
  }>;
  metadata?: {
    name?: string;
    image?: string;
    description?: string;
    attributes?: {
      grade?: string;
    };
  };
  asset?: {
    content: Uint8Array;
    content_type: string;
  };
}

const NFTCard = ({ nft, currentWallet }: { nft: NFT; currentWallet: any }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const lastTx = nft.transactions[0];
  const isReceived =
    lastTx.to.toLowerCase() === currentWallet.address.toLowerCase();

  const getNFTImageUrl = (nft: NFT): string | null => {
    if (!nft) return null;
    if (nft.metadata?.image) return convertIPFSToGatewayURL(nft.metadata.image);
    return null;
  };

  // For debugging purposes only.
  // console.log("NFTCard --> nft:", nft);
  // console.log("NFTCard --> nft.tokenId:", nft.tokenId);

  const imageUrl = getNFTImageUrl(nft);

  // Extract the CID from the token.
  const metadataCID = nft.tokenMetadataURI.replace("ipfs://", "");

  // console.log("NFTCard --> nft.metadataCID:", metadataCID);
  //
  const url = `/(nft)/${metadataCID}?metadata_uri=${encodeURIComponent(lastTx.tokenMetadataURI)}&token_id=${nft.tokenId}`;
  // console.log("NFTCard --> url:", url);

  // For testing purposes only!
  // const url = `/(nft)/verifysuccess?token_id=${nft.tokenId}&token_metadata_uri=${encodeURIComponent(lastTx.tokenMetadataURI)}`;
  // console.log("NFTCard --> url:", url);

  return (
    <Pressable onPress={() => router.push(url)} style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <ImageIcon size={48} color="#E9D5FF" />
          </View>
        )}

        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              isReceived ? styles.receivedBadge : styles.transferredBadge,
            ]}
          >
            <View style={styles.badgeContent}>
              {isReceived && <CheckCircle size={14} color="#166534" />}
              <Text
                style={[
                  styles.badgeText,
                  isReceived ? styles.receivedText : styles.transferredText,
                ]}
              >
                {isReceived ? "In Collection" : "Transferred"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title}>
          {nft.metadata?.name || `Comic #${nft.tokenId}`}
        </Text>
        <View style={styles.metadataContainer}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.dateText}>
            {new Date(lastTx.timestamp).toLocaleDateString()}
          </Text>
          {nft.metadata?.attributes?.grade && (
            <>
              <View style={styles.separator} />
              <View style={styles.gradeContainer}>
                <Coins size={14} color="#EAB308" />
                <Text style={styles.gradeText}>
                  Grade: {nft.metadata.attributes.grade}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default function NFTListScreen() {
  const router = useRouter();
  const { currentWallet, loading: serviceLoading } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    nftCollection,
    loading: nftLoading,
    refresh,
  } = useNFTCollection(currentWallet?.address || null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredNFTs = (nftCollection || []).filter((nft: NFT) => {
    const searchTermLower = searchTerm.toLowerCase();
    const nftName = nft.metadata?.name || "";
    const tokenId = nft.tokenId?.toString() || "";

    return (
      !searchTerm ||
      nftName.toLowerCase().includes(searchTermLower) ||
      tokenId.includes(searchTermLower)
    );
  });

  useEffect(() => {
    if (!currentWallet && !serviceLoading) {
      router.replace("/login");
    }
  }, [currentWallet, serviceLoading]);

  if (serviceLoading || nftLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your collection...</Text>
      </View>
    );
  }

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

        {(searchTerm || filteredNFTs.length > 0) && (
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              placeholder="Search your comic collection..."
              style={styles.searchInput}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {filteredNFTs.length === 0 ? (
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
            data={filteredNFTs}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <NFTCard nft={item} currentWallet={currentWallet} />
              </View>
            )}
            keyExtractor={(item) => item.tokenId}
            contentContainerStyle={styles.listContainer}
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
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "white",
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listContainer: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
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
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  receivedBadge: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  transferredBadge: {
    backgroundColor: "#DBEAFE",
    borderColor: "#BFDBFE",
  },
  receivedText: {
    color: "#166534",
    fontWeight: "500",
  },
  transferredText: {
    color: "#1E40AF",
    fontWeight: "500",
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
  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gradeText: {
    fontSize: 14,
    color: "#6B7280",
  },
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
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
