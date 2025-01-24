// monorepo/native/mobile/comiccoin-wallet/services/nft/AssetService.ts
import config from "../../config";

interface NFTAsset {
  filename: string;
  content: Uint8Array;
  content_type: string | null;
  content_length: number;
}

class NFTAssetService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = __DEV__ ? "http://localhost:9000" : "https://nftstorage.com";
  }

  private extractFilename(contentDisposition: string | null): string {
    if (!contentDisposition) return "default-filename";

    if (contentDisposition.includes("filename*=")) {
      const parts = contentDisposition.split("filename*=");
      if (parts.length > 1) {
        return parts[1].replace(/["']/g, "");
      }
    }

    const filenameMatch = contentDisposition.match(/filename=['"]?([^'"]+)/);
    if (filenameMatch) {
      return filenameMatch[1];
    }

    return "default-filename";
  }

  async getNFTAsset(cid: string): Promise<NFTAsset> {
    if (!cid) {
      throw new Error("CID is required");
    }

    const endpoint = `${this.baseUrl}/ipfs/${cid}`;

    try {
      console.debug("Fetching from IPFS gateway:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      const contentDisposition = response.headers.get("content-disposition");
      const filename = this.extractFilename(contentDisposition);

      const content = await response.arrayBuffer();
      const contentLength = content.byteLength;

      const asset: NFTAsset = {
        filename,
        content: new Uint8Array(content),
        content_type: contentType,
        content_length: contentLength,
      };

      console.debug("Fetched file content:", {
        filename: asset.filename,
        content_type: asset.content_type,
        content_length: asset.content_length,
      });

      return asset;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch NFT asset:", error);
      throw new Error(`Failed to fetch NFT asset: ${errorMessage}`);
    }
  }
}

const nftAssetService = new NFTAssetService();
export default nftAssetService;
