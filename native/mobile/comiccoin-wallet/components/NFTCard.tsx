// monorepo/native/mobile/comiccoin-wallet/components/NFTCard.tsx
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import type { TokenMetadata } from "../services/transaction/OwnedTokenListService";

interface NFT {
  tokenId: string;
  tokenMetadataURI: string;
  metadata: TokenMetadata;
  transaction: any; // Type from OwnedTokenTransaction if needed
}

interface NFTCardProps {
  nft: NFT;
  onPress?: () => void;
}

const NFTCard = ({ nft, onPress }: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Helper for NFT images
  const getNFTImageUrl = useCallback((nft: NFT) => {
    if (!nft?.metadata?.image) {
      console.log("🖼️ No image found for NFT:", {
        tokenId: nft.tokenId,
        metadata: !!nft.metadata,
      });
      return null;
    }

    const imageUrl = nft.metadata.image;
    const finalUrl = imageUrl.startsWith("ipfs://")
      ? imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
      : imageUrl;

    console.log("🖼️ Processed NFT image URL:", {
      tokenId: nft.tokenId,
      originalUrl: imageUrl,
      finalUrl,
    });

    return finalUrl;
  }, []);

  const imageUrl = getNFTImageUrl(nft);

  // Handle image error
  const handleImageError = () => {
    console.log("❌ Image loading error:", {
      tokenId: nft.tokenId,
      imageUrl,
    });
    setImageError(true);
  };

  // Find grade attribute
  const gradeAttribute = nft.metadata?.attributes?.find(
    (attr) => attr.trait_type.toLowerCase() === "grade",
  );

  return (
    <Pressable
      onPress={() => {
        console.log("👆 NFT Card pressed:", {
          tokenId: nft.tokenId,
          name: nft.metadata?.name,
        });
        onPress?.();
      }}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={imageUrl}
            style={styles.image}
            contentFit="cover"
            transition={200}
            onError={handleImageError}
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
        {gradeAttribute && (
          <Text style={styles.grade}>Grade: {gradeAttribute.value}</Text>
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
