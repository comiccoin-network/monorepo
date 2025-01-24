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
} from "lucide-react-native";
import { useWallet } from "../../hooks/useWallet";
import { useNFTCollection } from "../../hooks/useNFTCollection";
import { convertIPFSToGatewayURL } from "../../services/nft/MetadataService";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const imageUrl = getNFTImageUrl(nft);

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/nft?token_id=${nft.tokenId}&token_metadata_uri=${lastTx.tokenMetadataURI}`,
        )
      }
      style={styles.cardContainer}
    >
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

  const { nftCollection, loading: nftLoading } = useNFTCollection(
    currentWallet?.address || null,
  );

  const filteredNFTs = (nftCollection || []).filter(
    (nft: NFT) =>
      !searchTerm ||
      nft.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.tokenId.toString().includes(searchTerm),
  );

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My NFT Collection</Text>
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
            {searchTerm
              ? "Try adjusting your search"
              : "Start your collection by getting your comics graded"}
          </Text>
          <Pressable
            onPress={() => Linking.openURL("https://cpscapsule.com")}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>
              Submit Comics for Grading
            </Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 4,
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
});
