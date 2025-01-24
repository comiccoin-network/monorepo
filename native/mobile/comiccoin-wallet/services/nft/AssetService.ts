// monorepo/native/mobile/comiccoin-wallet/services/nft/AssetService.ts
import config from "../../config";

interface FetchOptions {
  onProgress?: (progress: number) => void;
}

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

  async getNFTAsset(
    cid: string,
    options: FetchOptions = {},
  ): Promise<NFTAsset> {
    if (!cid) throw new Error("CID is required");

    const endpoint = `${this.baseUrl}/ipfs/${cid}`;
    console.log(
      " monorepo/native/mobile/comiccoin-wallet/services/nft/AssetService.ts --> getNFTAsset --> endpoint:",
      endpoint,
    );

    try {
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
      const contentLength = Number(response.headers.get("content-length")) || 0;
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          if (contentLength && options.onProgress) {
            options.onProgress((receivedLength / contentLength) * 100);
          }
        }
      }

      // Combine chunks
      const content = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        content.set(chunk, position);
        position += chunk.length;
      }

      return {
        filename: this.extractFilename(
          response.headers.get("content-disposition"),
        ),
        content,
        content_type: contentType,
        content_length: receivedLength,
      };
    } catch (error) {
      console.error("Failed to fetch NFT asset:", error);
      throw error;
    }
  }
}

const nftAssetService = new NFTAssetService();
export default nftAssetService;
