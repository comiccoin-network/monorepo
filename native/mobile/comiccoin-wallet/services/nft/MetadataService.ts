// monorepo/native/mobile/comiccoin-wallet/services/nft/MetadataService.ts
import config from "../../config";

// Types
interface NFTMetadata {
  metadata: any;
  rawAsset: {
    content: Uint8Array;
    content_type: string | null;
    content_length: number;
  };
}

// Constants
const NFT_STORAGE_API_URL = __DEV__
  ? "http://localhost:9000"
  : "https://nftstorage.com";

/**
 * Converts an IPFS URI to a gateway URL
 * @param ipfsUri - The IPFS URI to convert
 * @returns The gateway URL
 */
export const convertIPFSToGatewayURL = (ipfsUri: string): string => {
  if (!ipfsUri) return "";
  if (!ipfsUri.startsWith("ipfs://")) return ipfsUri;

  const cid = ipfsUri.replace("ipfs://", "");
  return `${NFT_STORAGE_API_URL}/ipfs/${cid}`;
};

/**
 * Fetches NFT metadata from an IPFS URI
 * @param tokenMetadataURI - The IPFS URI of the token metadata
 * @returns Promise resolving to NFT metadata and raw asset data
 * @throws Error if fetch fails
 */
export const fetchNFTMetadata = async (
  tokenMetadataURI: string,
): Promise<NFTMetadata> => {
  try {
    console.log("Fetching metadata for:", tokenMetadataURI);
    const cid = tokenMetadataURI.replace("ipfs://", "");
    const response = await fetch(`${NFT_STORAGE_API_URL}/ipfs/${cid}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const content = await response.arrayBuffer();
    const metadata = JSON.parse(new TextDecoder().decode(content));
    console.log("Parsed metadata:", metadata);

    return {
      metadata,
      rawAsset: {
        content: new Uint8Array(content),
        content_type: contentType,
        content_length: content.byteLength,
      },
    };
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    throw error;
  }
};
