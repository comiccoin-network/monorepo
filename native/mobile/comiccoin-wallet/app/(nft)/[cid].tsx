// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/[cid].tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { Image as ImageIcon, AlertCircle, Play } from "lucide-react-native";
import { useNFTMetadata } from "../../hooks/useNFTMetadata";
import { useNFTAsset } from "../../hooks/useNFTAsset";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { arrayBufferToBase64 } from "../../utils/base64Utils";
import nftAssetService from "../../services/nft/AssetService";

export default function NFTDetailsScreen() {
  const router = useRouter();
  const { cid, metadata_uri } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("image");

  // Remove the isImageLoading state since we'll use isChildLoading instead
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);
  const [isChildLoading, setIsChildLoading] = useState(false);

  // Fetch metadata first
  const {
    data: metadataData,
    isLoading: metadataLoading,
    error: metadataError,
  } = useNFTMetadata(metadata_uri as string);

  const metadata = metadataData?.metadata;
  const imageCid = metadata?.image
    ? metadata.image.replace("ipfs://", "")
    : null;

  // Handle child loading state changes
  const handleLoadingChange = useCallback((isLoading: boolean) => {
    console.log("Child loading state changed:", isLoading);
    setIsChildLoading(isLoading);
  }, []);

  // Render loading state only for metadata loading
  if (metadataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading NFT details...</Text>
      </View>
    );
  }

  // Render error state
  if (metadataError || imageLoadError) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error Loading NFT</Text>
        <Text style={styles.errorText}>
          {metadataError?.message || imageLoadError}
        </Text>
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
          <View style={styles.mediaContainer}>
            <MediaTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              metadata={metadata}
            />

            <View style={styles.mediaContent}>
              {activeTab === "image" && (
                <ImageDisplay
                  cid={imageCid || ""}
                  onLoadingChange={handleLoadingChange}
                />
              )}

              {activeTab === "animation" && animationAssetData?.asset && (
                <Video
                  source={{
                    uri: `data:${animationAssetData.asset.content_type};base64,${arrayBufferToBase64(
                      animationAssetData.asset.content,
                    )}`,
                  }}
                  style={styles.mediaImage}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  onError={(error) => {
                    console.error("Video loading error:", error);
                  }}
                />
              )}

              {/* Remove the isImageLoading condition since we now use isChildLoading */}
              {isChildLoading && (
                <View style={styles.mediaLoading}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ImageDisplay = ({
  cid,
  onLoadingChange,
}: {
  cid: string;
  onLoadingChange?: (isLoading: boolean) => void;
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageRendering, setIsImageRendering] = useState(false);

  const isMounted = useRef(true);
  const hasStartedRender = useRef(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Notify parent component of loading state changes
  useEffect(() => {
    const isInLoadingState =
      isLoading || (isImageRendering && !hasStartedRender.current);
    onLoadingChange?.(isInLoadingState);
  }, [isLoading, isImageRendering, onLoadingChange]);

  // Cleanup function
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  // Reset render timeout when image URI changes
  useEffect(() => {
    if (imageUri && isImageRendering) {
      renderTimeoutRef.current = setTimeout(() => {
        if (isMounted.current && isImageRendering) {
          console.log("Render timeout reached, forcing completion");
          setIsImageRendering(false);
          onLoadingChange?.(false);
        }
      }, 10000);
    }
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [imageUri, isImageRendering, onLoadingChange]);

  // Main image loading logic
  useEffect(() => {
    const loadImage = async () => {
      if (!cid) {
        setError("No image CID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setImageUri(null);
        hasStartedRender.current = false;

        console.log("Starting image data load for CID:", cid);
        const asset = await nftAssetService.getNFTAsset(cid);

        if (!isMounted.current) return;

        console.log("Got asset, loading content...");
        const base64Data = await asset.getContent();

        if (!isMounted.current) return;

        console.log("Content loaded, creating URI...");
        const uri = `data:${asset.content_type || "image/png"};base64,${base64Data}`;

        setImageUri(uri);
        setIsImageRendering(true);

        console.log("URI set, waiting for image to render...");
      } catch (err) {
        if (!isMounted.current) return;

        console.error("Error loading image:", {
          error: err,
          message: err instanceof Error ? err.message : "Unknown error",
          cid,
        });
        setError(err instanceof Error ? err.message : "Failed to load image");
        setIsImageRendering(false);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    loadImage();
  }, [cid]);

  if (isLoading || (isImageRendering && !hasStartedRender.current)) {
    return (
      <View style={styles.mediaLoading}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>
          {isLoading ? "Loading image data..." : "Preparing image..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.mediaPlaceholder}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.placeholderText}>{error}</Text>
      </View>
    );
  }

  if (!imageUri) {
    return (
      <View style={styles.mediaPlaceholder}>
        <ImageIcon size={48} color="#E5E7EB" />
        <Text style={styles.placeholderText}>No image available</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={styles.mediaImage}
      resizeMode="contain"
      onLoadStart={() => {
        console.log("Image render starting");
        hasStartedRender.current = true;
      }}
      onLoad={() => {
        console.log("Image rendered successfully");
        if (isMounted.current) {
          setIsImageRendering(false);
          if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
          }
        }
      }}
      onError={(error) => {
        console.error("Image rendering error:", error.nativeEvent.error);
        if (isMounted.current) {
          setError("Failed to render image");
          setIsImageRendering(false);
          if (renderTimeoutRef.current) {
            clearTimeout(renderTimeoutRef.current);
          }
        }
      }}
    />
  );
};

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
