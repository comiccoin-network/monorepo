// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/[cid].tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Image } from "expo-image";
import { Image as ImageIcon, AlertCircle, Play } from "lucide-react-native";
import { useNFTMetadata } from "../../hooks/useNFTMetadata";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

// Placeholder image blur hash for better loading experience
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export default function NFTDetailsScreen() {
  const { cid, metadata_uri } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("image");
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Fetch metadata using the custom hook
  const {
    data: metadataData,
    isLoading: metadataLoading,
    error: metadataError,
  } = useNFTMetadata(metadata_uri as string);

  // Extract metadata and construct image URI
  const metadata = metadataData?.metadata;
  const imageCid = metadata?.image
    ? metadata.image.replace("ipfs://", "")
    : null;
  const baseUrl = __DEV__ ? "http://localhost:9000" : "https://nftstorage.com";
  const imageUri = imageCid ? `${baseUrl}/ipfs/${imageCid}` : null;

  // Handle image loading lifecycle
  const handleImageLoadStart = useCallback(() => {
    setIsImageLoading(true);
    setImageLoadError(null);
  }, []);

  const handleImageLoadSuccess = useCallback(() => {
    setIsImageLoading(false);
    setImageLoadError(null);
  }, []);

  const handleImageLoadError = useCallback((error: any) => {
    setIsImageLoading(false);
    setImageLoadError(error?.message || "Failed to load image");
  }, []);

  // Render loading state for metadata
  if (metadataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading NFT details...</Text>
      </View>
    );
  }

  // Render metadata error state
  if (metadataError) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error Loading NFT</Text>
        <Text style={styles.errorText}>{metadataError.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: metadata?.name || `Comic #${cid}`,
          headerBackTitle: "Collection",
        }}
      />
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.mediaContent}>
            {activeTab === "image" && (
              <View style={styles.mediaContainer}>
                {imageUri ? (
                  <>
                    <Image
                      style={styles.mediaImage}
                      source={{ uri: imageUri }}
                      placeholder={blurhash}
                      contentFit="contain"
                      transition={1000}
                      onLoadStart={handleImageLoadStart}
                      onLoad={handleImageLoadSuccess}
                      onError={handleImageLoadError}
                      cachePolicy="memory-disk"
                    />
                    {isImageLoading && (
                      <View style={styles.mediaLoading}>
                        <ActivityIndicator size="large" color="#7C3AED" />
                        <Text style={styles.loadingText}>Loading image...</Text>
                      </View>
                    )}
                    {imageLoadError && (
                      <View style={styles.errorContainer}>
                        <AlertCircle size={48} color="#EF4444" />
                        <Text style={styles.errorTitle}>
                          Error Loading Image
                        </Text>
                        <Text style={styles.errorText}>{imageLoadError}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.mediaPlaceholder}>
                    <ImageIcon size={48} color="#9CA3AF" />
                    <Text style={styles.placeholderText}>
                      No image available
                    </Text>
                  </View>
                )}
              </View>
            )}
            <MediaTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              metadata={metadata}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const MediaTabs = ({ activeTab, onTabChange, metadata }) => {
  const tabs = [
    {
      id: "image",
      icon: ImageIcon,
      label: "Cover",
      show: !!metadata?.image,
    },
    {
      id: "animation",
      icon: Play,
      label: "Animation",
      show: !!metadata?.animation_url,
    },
  ].filter((tab) => tab.show);

  if (tabs.length <= 1) return null;

  return (
    <View style={styles.tabContainer}>
      {tabs.map(({ id, icon: Icon, label }) => (
        <Pressable
          key={id}
          onPress={() => onTabChange(id)}
          style={[styles.tab, activeTab === id && styles.activeTab]}
        >
          <Icon size={16} color={activeTab === id ? "#7C3AED" : "#6B7280"} />
          <Text
            style={[styles.tabLabel, activeTab === id && styles.activeTabLabel]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  mediaContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    margin: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#7C3AED",
  },
  mediaContent: {
    aspectRatio: 3 / 4,
    backgroundColor: "#F9FAFB",
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(243, 244, 246, 0.97)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(243, 244, 246, 0.97)",
    justifyContent: "center",
    alignItems: "center",
  },

  mediaImage: {
    width: "100%",
    height: "100%",
  },
  hidden: {
    display: "none",
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  attributesContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  attributesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  attributeItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  attributeLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  mediaPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 2,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 200,
  },
  progressText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  progressPercentage: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressCircleContainer: {
    marginBottom: 16,
  },
  progressState: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7C3AED",
    marginBottom: 4,
  },
});
