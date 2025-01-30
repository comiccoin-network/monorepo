// monorepo/native/mobile/comiccoin-wallet/services/nft/AssetService.ts
import config from "../../config";

interface NFTAsset {
  filename: string;
  content_type: string | null;
  content_length: number;
  getContent: () => Promise<string>;
}

interface FetchOptions {
  onProgress?: (progress: number) => void;
}

class NFTAssetService {
  private readonly CHUNK_SIZE = 256 * 1024; // 256KB chunks for processing

  async getNFTAsset(
    cid: string,
    options: FetchOptions = {},
  ): Promise<NFTAsset> {
    if (!cid) throw new Error("CID is required");

    const endpoint = `${config.IPFS_GATEWAY_URL}/ipfs/${cid}`;
    console.log("Fetching NFT asset from endpoint:", endpoint);

    try {
      // Fetch the initial response
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      const contentLength = Number(response.headers.get("content-length")) || 0;

      console.log("Response headers:", {
        contentType,
        contentLength,
        status: response.status,
      });

      // Store the initial response buffer
      const responseBuffer = await response.arrayBuffer();

      // Create a getContent function that processes the stored buffer
      const getContent = async (): Promise<string> => {
        // Create a Uint8Array from the buffer for processing
        const uint8Array = new Uint8Array(responseBuffer);
        let base64String = "";
        let processedLength = 0;

        // Process the data in chunks to avoid memory issues
        for (let i = 0; i < uint8Array.length; i += this.CHUNK_SIZE) {
          const chunk = uint8Array.slice(i, i + this.CHUNK_SIZE);
          const binary = chunk.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            "",
          );
          base64String += btoa(binary);

          processedLength += chunk.length;

          // Report progress if callback is provided
          if (options.onProgress && contentLength > 0) {
            const progress = (processedLength / contentLength) * 100;
            options.onProgress(Math.min(progress, 99.9));
          }
        }

        // Report completion
        if (options.onProgress) {
          options.onProgress(100);
        }

        return base64String;
      };

      return {
        filename: `${cid}.${contentType?.split("/")[1] || "bin"}`,
        content_type: contentType,
        content_length: contentLength,
        getContent,
      };
    } catch (error) {
      console.log("Failed to fetch NFT asset:", error);
      throw error;
    }
  }
}

export default new NFTAssetService();
