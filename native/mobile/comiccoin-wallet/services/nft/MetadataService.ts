// monorepo/native/mobile/comiccoin-wallet/services/nft/MetadataService.ts
import config from "../../config";
import NetInfo from "@react-native-community/netinfo";

// Types
interface NFTMetadata {
  metadata: any;
  rawAsset: {
    content: Uint8Array;
    content_type: string | null;
    content_length: number;
  };
}

class MetadataError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = "MetadataError";
    this.code = code;
    this.details = details;
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const checkNetworkConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

/**
 * Converts an IPFS URI to a gateway URL
 */
export const convertIPFSToGatewayURL = (ipfsUri: string): string => {
  if (!ipfsUri) {
    throw new MetadataError("Empty IPFS URI provided", "INVALID_URI");
  }

  if (!ipfsUri.startsWith("ipfs://")) {
    throw new MetadataError("Invalid IPFS URI format", "INVALID_URI_FORMAT", {
      uri: ipfsUri,
    });
  }

  const cid = ipfsUri.replace("ipfs://", "");
  return `${config.IPFS_GATEWAY_URL}/ipfs/${cid}`;
};

/**
 * Fetches NFT metadata from an IPFS URI with retries
 */
export const fetchNFTMetadata = async (
  tokenMetadataURI: string,
): Promise<NFTMetadata> => {
  let lastError: Error | null = null;

  // First check network connectivity
  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    throw new MetadataError("No internet connection available", "NO_NETWORK");
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const cid = tokenMetadataURI.replace("ipfs://", "");
      const url = `${config.IPFS_GATEWAY_URL}/ipfs/${cid}`;

      console.log(
        `Fetching metadata (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        url,
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new MetadataError(
          `HTTP error! status: ${response.status}`,
          "HTTP_ERROR",
          { status: response.status },
        );
      }

      const contentType = response.headers.get("content-type");
      const content = await response.arrayBuffer();

      let metadata;
      try {
        metadata = JSON.parse(new TextDecoder().decode(content));
      } catch (e) {
        throw new MetadataError(
          "Invalid JSON in metadata response",
          "INVALID_JSON",
        );
      }

      return {
        metadata,
        rawAsset: {
          content: new Uint8Array(content),
          content_type: contentType,
          content_length: content.byteLength,
        },
      };
    } catch (error) {
      lastError = error;
      console.log(
        `Error fetching NFT metadata (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        error,
      );

      if (error.name === "AbortError") {
        throw new MetadataError("Request timed out", "TIMEOUT");
      }

      // If this isn't our last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
        continue;
      }
    }
  }

  // If we get here, all retries failed
  throw new MetadataError(
    "Failed to fetch metadata after multiple attempts",
    "MAX_RETRIES_EXCEEDED",
    { originalError: lastError },
  );
};

// Helper function to get user-friendly error messages
export const getErrorMessage = (error: any): string => {
  if (error instanceof MetadataError) {
    switch (error.code) {
      case "NO_NETWORK":
        return "Unable to connect to the network. Please check your internet connection.";
      case "TIMEOUT":
        return "The request timed out. Please try again.";
      case "HTTP_ERROR":
        return `Server error (${error.details?.status}). Please try again later.`;
      case "INVALID_JSON":
        return "The metadata format is invalid.";
      case "MAX_RETRIES_EXCEEDED":
        return "Failed to load metadata after several attempts. Please try again later.";
      default:
        return error.message;
    }
  }

  if (error.message === "Network request failed") {
    return "Network connection error. Please check your internet and try again.";
  }

  return "An unexpected error occurred. Please try again.";
};
