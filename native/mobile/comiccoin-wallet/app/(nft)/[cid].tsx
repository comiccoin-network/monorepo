// monorepo/native/mobile/comiccoin-wallet/app/(user)/nft/[cid].tsx
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useNFTMetadata } from "../../hooks/useNFTMetadata";
import { convertIPFSToGatewayURL } from "../../services/nft/MetadataService";

export default function NFTDetailsScreen() {
  const { cid, metadata_uri } = useLocalSearchParams();
  const { nft, loading } = useNFTMetadata(
    cid as string,
    metadata_uri as string,
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: nft?.metadata?.name || `Comic CID: ${cid}`,
        }}
      />
      <View style={styles.container}>
        {nft?.metadata?.image && (
          <Image
            source={{ uri: convertIPFSToGatewayURL(nft.metadata.image) }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
        <View style={styles.details}>
          <Text style={styles.title}>
            {nft?.metadata?.name || `Comic CID${cid}`}
          </Text>
          {nft?.metadata?.description && (
            <Text style={styles.description}>{nft.metadata.description}</Text>
          )}
          {nft?.metadata?.attributes?.grade && (
            <View style={styles.gradeContainer}>
              <Text style={styles.label}>Grade:</Text>
              <Text style={styles.grade}>{nft.metadata.attributes.grade}</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 400,
  },
  details: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  grade: {
    fontSize: 16,
    color: "#111827",
  },
});
