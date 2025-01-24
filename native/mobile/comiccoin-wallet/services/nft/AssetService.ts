// monorepo/native/mobile/comiccoin-wallet/services/nft/AssetService.ts
import config from "../../config";

interface NFTAsset {
  filename: string;
  content_type: string | null;
  content_length: number;
  getContent: () => Promise<string>; // Changed to return base64 string directly
}

class NFTAssetService {
  private baseUrl: string;
  private readonly CHUNK_SIZE = 256 * 1024; // 256KB chunks

  constructor() {
    this.baseUrl = __DEV__ ? "http://localhost:9000" : "https://nftstorage.com";
  }

  async getNFTAsset(cid: string): Promise<NFTAsset> {
    if (!cid) throw new Error("CID is required");

    const endpoint = `${this.baseUrl}/ipfs/${cid}`;
    console.log("Fetching NFT asset from endpoint:", endpoint);

    try {
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
      const contentLength = Number(response.headers.get("content-length"));

      console.log("Response headers:", {
        contentType,
        contentLength,
        status: response.status,
      });

      // Instead of loading everything at once, return a function that can process the data
      const getContent = async (): Promise<string> => {
        // Get the response body as an array buffer
        const arrayBuffer = await response.clone().arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Process in chunks to avoid memory limits
        let base64String = "";
        for (let i = 0; i < uint8Array.length; i += this.CHUNK_SIZE) {
          const chunk = uint8Array.slice(i, i + this.CHUNK_SIZE);
          const binary = chunk.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            "",
          );
          base64String += btoa(binary);
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
      console.error("Failed to fetch NFT asset:", error);
      throw error;
    }
  }
}

export default new NFTAssetService();
