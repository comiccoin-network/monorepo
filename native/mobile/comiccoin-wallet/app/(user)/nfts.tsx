// monorepo/native/mobile/comiccoin-wallet/app/(user)/nfts.tsx
import { View, Text } from "react-native";
import { nftAssetService } from "../../services/nft/MetadataService"; //TEMPORARY
import { fetchNFTMetadata } from "../../services/nft/AssetService"; //TEMPORARY
import { nftTransferService } from "../../services/nft/TransferService"; //TEMPORARY

export default function NFTs() {
  return (
    <View>
      <Text>NFTs Screen</Text>
    </View>
  );
}
