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
import { useNFTAsset, prefetchNFTAsset } from "../../hooks/useNFTAsset";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { arrayBufferToBase64 } from "../../utils/base64Utils";
import { useQueryClient } from "@tanstack/react-query";
import * as Progress from "react-native-progress";

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
  const [error, setError] = useState<string | null>(null);
  const [isImageRendering, setIsImageRendering] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [loadingState, setLoadingState] = useState<
    "preparing" | "downloading" | "rendering"
  >("preparing");

  const queryClient = useQueryClient();
  const isMounted = useRef(true);
  const hasStartedRender = useRef(false);

  // Use the NFTAsset hook with progress tracking
  const { data: assetData, isLoading: isAssetLoading } = useNFTAsset(cid, {
    enabled: !!cid,
    onProgress: (progress) => {
      if (isMounted.current) {
        setDownloadProgress(progress);
        if (progress > 0) {
          setLoadingState("downloading");
        }
      }
    },
  });

  // Effect to handle asset data changes
  useEffect(() => {
    const loadImageFromAsset = async () => {
      if (!assetData?.asset || !isMounted.current) return;

      try {
        setLoadingState("rendering");
        const base64Data = await assetData.asset.getContent();

        if (!isMounted.current) return;

        const uri = `data:${assetData.asset.content_type || "image/png"};base64,${base64Data}`;
        setImageUri(uri);
        setIsImageRendering(true);
      } catch (err) {
        console.error("Error loading image from asset:", err);
        setError(err instanceof Error ? err.message : "Failed to load image");
      }
    };

    loadImageFromAsset();
  }, [assetData]);

  // Notify parent of loading state changes
  useEffect(() => {
    const isInLoadingState = isAssetLoading || isImageRendering;
    onLoadingChange?.(isInLoadingState);
  }, [isAssetLoading, isImageRendering, onLoadingChange]);

  // Loading overlay that shows progress
  const LoadingOverlay = () => (
    <View style={styles.mediaLoading}>
      <View style={styles.loadingContent}>
        <View style={styles.progressCircleContainer}>
          <Progress.Circle
            size={100}
            indeterminate={downloadProgress === 0}
            progress={downloadProgress / 100}
            color="#7C3AED"
            borderWidth={5}
            strokeCap="round"
            showsText={true}
            formatText={(progress) => `${Math.round(downloadProgress)}%`}
            textStyle={styles.progressText}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressState}>
            {loadingState === "preparing"
              ? "Preparing..."
              : loadingState === "downloading"
                ? "Downloading..."
                : "Processing..."}
          </Text>
          {loadingState === "downloading" && (
            <Text style={styles.progressPercentage}>
              {Math.round(downloadProgress)}% Complete
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  // Error state
  if (error) {
    return (
      <View style={styles.mediaPlaceholder}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.placeholderText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mediaContent}>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.mediaImage}
          resizeMode="contain"
          onLoadStart={() => {
            hasStartedRender.current = true;
          }}
          onLoad={() => {
            if (isMounted.current) {
              setIsImageRendering(false);
              setLoadingState("preparing");
            }
          }}
          onError={(error) => {
            if (isMounted.current) {
              setError("Failed to render image");
              setIsImageRendering(false);
            }
          }}
        />
      )}

      {/* Show loading overlay while downloading or rendering */}
      {(isAssetLoading || isImageRendering) && <LoadingOverlay />}
    </View>
  );
};

// Add Progress Bar component
const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
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
