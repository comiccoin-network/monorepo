// monorepo/native/mobile/comiccoin-wallet/components/NFTCard.tsx
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import { NFT } from "../hooks/useNFTCollection";

interface NFTCardProps {
  nft: NFT;
  onPress?: () => void;
}

const NFTCard = ({ nft, onPress }: NFTCardProps) => {
  // Helper for NFT images
  const getNFTImageUrl = useCallback((nft: NFT) => {
    if (!nft?.metadata?.image) return null;
    const imageUrl = nft.metadata.image;
    return imageUrl.startsWith("ipfs://")
      ? imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
      : imageUrl;
  }, []);

  const [imageError, setImageError] = useState(false);
  const imageUrl = getNFTImageUrl(nft);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={imageUrl}
            style={styles.image}
            contentFit="cover"
            transition={200}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholder}>
            <ImageIcon size={48} color="#E9D5FF" />
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>
          {nft.metadata?.name || `NFT #${nft.tokenId}`}
        </Text>
        {nft.metadata?.attributes?.grade && (
          <Text style={styles.grade}>
            Grade: {nft.metadata.attributes.grade}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
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
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  grade: {
    fontSize: 14,
    color: "#6B7280",
  },
});

// Export the component and its props type for reuse
export type { NFTCardProps };
export default NFTCard;
