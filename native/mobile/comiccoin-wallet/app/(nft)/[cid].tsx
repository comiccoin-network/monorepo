// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/[cid].tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  Image as ImageIcon,
  AlertCircle,
  Play,
  Star,
  SendHorizontal,
  Flame,
} from "lucide-react-native";
import { useNFTMetadata } from "../../hooks/useNFTMetadata";
import { useNFTAsset } from "../../hooks/useNFTAsset";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { arrayBufferToBase64 } from "../../utils/base64Utils";

export default function NFTDetailsScreen() {
  const router = useRouter();
  const { cid, metadata_uri } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("image");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // Fetch metadata first
  const {
    data: metadataData,
    isLoading: metadataLoading,
    error: metadataError,
  } = useNFTMetadata(metadata_uri as string);

  const metadata = metadataData?.metadata;

  // Extract image CID from metadata
  const imageCid = metadata?.image
    ? metadata.image.replace("ipfs://", "")
    : null;

  // Fetch image asset only when we have the CID
  const {
    data: imageAssetData,
    isLoading: imageLoading,
    error: imageError,
  } = useNFTAsset(imageCid, {
    enabled: !!imageCid && activeTab === "image",
  });

  const imageAsset = imageAssetData?.asset;

  const getAssetSource = useCallback((asset) => {
    if (!asset?.content || !asset?.content_type) {
      console.log("Missing asset content or content type");
      return null;
    }

    try {
      console.log("Processing asset for display...");
      const base64Data = arrayBufferToBase64(asset.content);
      console.log("Successfully processed asset");
      return {
        uri: `data:${asset.content_type};base64,${base64Data}`,
      };
    } catch (error) {
      console.error("Error processing asset:", error);
      setImageLoadError("Failed to process image data");
      return null;
    }
  }, []);

  // Render loading state
  if (metadataLoading || (imageLoading && activeTab === "image")) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>
          {metadataLoading ? "Loading NFT details..." : "Loading image..."}
        </Text>
      </View>
    );
  }

  // Render error state
  if (metadataError || imageError || imageLoadError) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error Loading NFT</Text>
        <Text style={styles.errorText}>
          {metadataError?.message || imageError?.message || imageLoadError}
        </Text>
      </View>
    );
  }

  // In the render section, add more detailed error handling for the image:
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
          <View style={styles.mediaContainer}>
            <MediaTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              metadata={metadata}
            />

            <View style={styles.mediaContent}>
              {activeTab === "image" && (
                <>
                  {imageAsset ? (
                    <Image
                      source={getAssetSource(imageAsset)}
                      style={[
                        styles.mediaImage,
                        isImageLoading && styles.hidden,
                      ]}
                      resizeMode="contain"
                      onLoadStart={() => {
                        console.log("Image load starting");
                        setIsImageLoading(true);
                        setImageLoadError(null);
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully");
                        setIsImageLoading(false);
                      }}
                      onError={(error) => {
                        console.error("Image loading error:", error);
                        setIsImageLoading(false);
                        setImageLoadError("Failed to load image");
                      }}
                    />
                  ) : (
                    <View style={styles.mediaPlaceholder}>
                      <ImageIcon size={48} color="#E5E7EB" />
                      <Text style={styles.placeholderText}>
                        No image available
                      </Text>
                    </View>
                  )}
                  {isImageLoading && (
                    <View style={styles.mediaLoading}>
                      <ActivityIndicator size="large" color="#7C3AED" />
                      <Text style={styles.loadingText}>Loading image...</Text>
                    </View>
                  )}
                </>
              )}

              {activeTab === "animation" && animationAssetData?.asset && (
                <Video
                  source={getAssetSource(animationAssetData.asset)}
                  style={styles.mediaImage}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  onError={(error) => {
                    console.error("Video loading error:", error);
                  }}
                />
              )}

              {isImageLoading && (
                <View style={styles.mediaLoading}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                </View>
              )}
            </View>
          </View>

          {/* Rest of the component remains the same ... */}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
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
  mediaLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
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
});

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
