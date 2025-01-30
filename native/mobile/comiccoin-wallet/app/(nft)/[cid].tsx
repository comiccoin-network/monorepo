// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/[cid].tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Platform,
  StyleSheet,
  Clipboard,
  Linking,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  Play,
  Youtube,
  Copy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  SendHorizontal,
  Flame,
  FileText,
  Star,
} from "lucide-react-native";
import { useNFTMetadata } from "../../hooks/useNFTMetadata";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { convertIPFSToGatewayURL } from "../../services/nft/MetadataService";
import WebView from "react-native-webview";

// Blur hash for image placeholder
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

// ShareButton component with clipboard functionality
const ShareButton = ({ tokenMetadataUri }) => {
  const [shareState, setShareState] = useState("idle");

  const handleShare = async () => {
    if (!tokenMetadataUri) return;
    setShareState("copying");
    try {
      await Clipboard.setString(tokenMetadataUri);
      setShareState("success");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (error) {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 3000);
    }
  };

  const getIconColor = () => {
    switch (shareState) {
      case "success":
        return "#16A34A";
      case "error":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  return (
    <Pressable
      onPress={handleShare}
      disabled={shareState === "copying"}
      style={styles.shareButton}
    >
      {shareState === "copying" && (
        <ActivityIndicator size="small" color="#6B7280" />
      )}
      {shareState === "success" && (
        <CheckCircle2 size={20} color={getIconColor()} />
      )}
      {shareState === "error" && <XCircle size={20} color={getIconColor()} />}
      {shareState === "idle" && <Copy size={20} color={getIconColor()} />}
    </Pressable>
  );
};

const VideoPlayer = ({ src, style }) => {
  // Track our own source state since player.currentSrc might be undefined
  const [currentSource, setCurrentSource] = useState(src);

  // Initialize the video player with debug logging
  const player = useVideoPlayer(src, (player) => {
    console.log("Configuring video player for:", src);
    player.volume = 1.0;
    player.aspectMode = "fit";

    // Enable detailed debugging
    if (__DEV__) {
      player.debug = true;
      // Log all player properties
      console.log("Player initial state:", {
        volume: player.volume,
        aspectMode: player.aspectMode,
        loading: player.loading,
        error: player.error,
        currentTime: player.currentTime,
        duration: player.duration,
      });
    }
  });

  // Enhanced state tracking
  const { isLoading } = useEvent(player, "loadingChange", {
    isLoading: player.loading || false,
  });
  const { error } = useEvent(player, "error", {
    error: player.error,
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing || false,
  });

  // Update current source if it changes
  useEffect(() => {
    setCurrentSource(src);
  }, [src]);

  // Comprehensive debug information
  const debugInfo = __DEV__
    ? {
        source: currentSource,
        playerSource: player.currentSrc,
        loading: isLoading,
        playing: isPlaying,
        error: error?.message,
        timestamp: new Date().toISOString(),
      }
    : null;

  // Error display with full context
  if (error) {
    console.error("Video player error:", { error, debugInfo });
    return (
      <View style={[styles.videoContainer, style]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={32} color="#EF4444" />
          <Text style={styles.errorText}>
            {Platform.OS === "ios"
              ? "This video format may not be supported on iOS. Please try downloading the file or viewing on another device."
              : "Unable to play this video format. Please try downloading the file."}
          </Text>
          {__DEV__ && (
            <Text style={styles.debugText}>
              Error details: {error.message}
              {"\n"}Source: {currentSource}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.videoContainer, style]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      <VideoView
        style={styles.videoPlayer}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        resizeMode="contain"
      />

      {__DEV__ && (
        <View style={styles.debugOverlay}>
          <Text style={styles.debugText}>
            {isLoading ? "Loading..." : isPlaying ? "Playing" : "Not Playing"}
            {"\n"}Source: {currentSource || "No source"}
          </Text>
        </View>
      )}
    </View>
  );
};

// Add these styles to your StyleSheet
const videoStyles = {
  videoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: "#000",
  },
  debugOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
  },
  debugText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
    }),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(243, 244, 246, 0.97)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },
};

// Attribute display component
const AttributeItem = ({ trait_type, value }) => (
  <View style={styles.attributeItem}>
    <Text style={styles.attributeLabel}>{trait_type}</Text>
    <Text style={styles.attributeValue}>{value.toString()}</Text>
  </View>
);

// Main component
export default function NFTDetailsScreen() {
  const { cid, metadata_uri, token_id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("image");
  const [isImageLoading, setIsImageLoading] = useState(true);

  // console.log("token_id ->", token_id);

  const {
    data: metadataData,
    isLoading: metadataLoading,
    error: metadataError,
  } = useNFTMetadata(metadata_uri);

  const metadata = metadataData?.metadata;

  // Youtube URL conversion utility
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
      : null;
  };

  const getMediaContent = () => {
    if (!metadata) return null;

    switch (activeTab) {
      case "image":
        return metadata.image ? (
          <View style={styles.mediaContainer}>
            {isImageLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            )}
            <Image
              source={{ uri: convertIPFSToGatewayURL(metadata.image) }}
              style={styles.mediaContent}
              contentFit="contain"
              placeholder={blurhash}
              transition={1000}
              onLoadStart={() => setIsImageLoading(true)}
              onLoad={() => setIsImageLoading(false)}
            />
          </View>
        ) : null;

      case "animation":
        if (metadata.animation_url) {
          const videoUrl = convertIPFSToGatewayURL(metadata.animation_url);
          console.log("Processing video URL:", videoUrl); // Debug URL conversion

          return (
            <View style={styles.mediaContainer}>
              <VideoPlayer src={videoUrl} style={styles.mediaContent} />
            </View>
          );
        }
        return null;

      case "youtube":
        return metadata.youtube_url ? (
          <View style={styles.mediaContainer}>
            <WebView
              source={{ uri: getYoutubeEmbedUrl(metadata.youtube_url) }}
              style={styles.mediaContent}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
            />
          </View>
        ) : null;

      default:
        return null;
    }
  };

  // Loading state
  if (metadataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading NFT details...</Text>
      </View>
    );
  }

  // Error state
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
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Preview Section */}
            <View style={styles.previewCard}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <View style={styles.iconContainer}>
                    <ImageIcon size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.sectionTitle}>NFT Detail</Text>
                </View>
                <ShareButton tokenMetadataUri={metadata_uri} />
              </View>

              {/* Media Tabs */}
              <View style={styles.tabContainer}>
                {[
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
                  {
                    id: "youtube",
                    icon: Youtube,
                    label: "Video",
                    show: !!metadata?.youtube_url,
                  },
                ]
                  .filter((tab) => tab.show)
                  .map(({ id, icon: Icon, label }) => (
                    <Pressable
                      key={id}
                      onPress={() => setActiveTab(id)}
                      style={[styles.tab, activeTab === id && styles.activeTab]}
                    >
                      <Icon
                        size={16}
                        color={activeTab === id ? "#7C3AED" : "#6B7280"}
                      />
                      <Text
                        style={[
                          styles.tabLabel,
                          activeTab === id && styles.activeTabLabel,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
              </View>

              {/* Media Content */}
              {getMediaContent()}
            </View>

            {/* NFT Details Section */}
            <View style={styles.detailsCard}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <View style={styles.iconContainer}>
                    <FileText size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.sectionTitle}>Details</Text>
                </View>
              </View>

              <Text style={styles.nftTitle}>
                {metadata?.name || `Comic #${cid}`}
              </Text>
              {metadata?.description && (
                <Text style={styles.description}>{metadata.description}</Text>
              )}
            </View>

            {/* Actions Section */}
            <View style={styles.actionsCard}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <View style={styles.iconContainer}>
                    <TrendingUp size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.sectionTitle}>Actions</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, styles.transferButton]}
                  onPress={() =>
                    router.push(
                      "/transfer?token_id=" +
                        token_id +
                        "&token_metadata_uri=" +
                        encodeURIComponent(metadata_uri) +
                        "&cid=" +
                        cid,
                    )
                  }
                >
                  <SendHorizontal size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Transfer</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.burnButton]}
                  onPress={() =>
                    router.push(
                      "/burn?token_id=" +
                        token_id +
                        "&token_metadata_uri=" +
                        encodeURIComponent(metadata_uri) +
                        "&cid=" +
                        cid,
                    )
                  }
                >
                  <Flame size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Burn</Text>
                </Pressable>
              </View>
            </View>

            {/* Attributes Section */}
            {metadata?.attributes && metadata.attributes.length > 0 && (
              <View style={styles.attributesCard}>
                <View style={styles.headerContainer}>
                  <View style={styles.titleContainer}>
                    <View style={styles.iconContainer}>
                      <Star size={20} color="#7C3AED" />
                    </View>
                    <Text style={styles.sectionTitle}>Attributes</Text>
                  </View>
                </View>

                <View style={styles.attributesGrid}>
                  {metadata.attributes.map((attr, index) => (
                    <AttributeItem
                      key={index}
                      trait_type={attr.trait_type}
                      value={attr.value}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  previewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#F3E8FF",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  mediaContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mediaContent: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(243, 244, 246, 0.97)",
    justifyContent: "center",
    alignItems: "center",
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
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#7C3AED",
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
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
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  nftTitle: {
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
    lineHeight: 24,
  },
  actionsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  transferButton: {
    backgroundColor: "#7C3AED",
  },
  burnButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  attributesCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  attributesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  attributeItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F3E8FF",
    padding: 12,
    borderRadius: 8,
  },
  attributeLabel: {
    fontSize: 14,
    color: "#7C3AED",
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  ...videoStyles,
});
