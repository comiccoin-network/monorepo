// src/Services/NFTAssetService.jsx

/**
 * @typedef {Object} NFTAsset
 * @property {string} filename - The name of the file being retrieved
 * @property {Uint8Array} content - The raw file content in bytes
 * @property {string} content_type - The MIME type of the file
 * @property {number} content_length - The length of the content in bytes
 */

class NFTAssetService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_NFTSTORAGE_API_URL;
  }

  /**
   * Extract filename from Content-Disposition header
   * @param {string} contentDisposition - The Content-Disposition header value
   * @returns {string} - The extracted filename or default
   */
  extractFilename(contentDisposition) {
    if (!contentDisposition) return 'default-filename';

    if (contentDisposition.includes('filename*=')) {
      const parts = contentDisposition.split('filename*=');
      if (parts.length > 1) {
        return parts[1].replace(/["']/g, '');
      }
    }

    // Try regular filename
    const filenameMatch = contentDisposition.match(/filename=['"]?([^'"]+)/);
    if (filenameMatch) {
      return filenameMatch[1];
    }

    return 'default-filename';
  }

  /**
   * Fetches an NFT asset from IPFS
   * @param {string} cid - The IPFS CID
   * @returns {Promise<NFTAsset>} - The NFT asset data
   */
  async getNFTAsset(cid) {
    if (!cid) {
      throw new Error('CID is required');
    }

    const endpoint = `${this.baseUrl}/ipfs/${cid}`;

    try {
      console.debug('Fetching from IPFS gateway:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get response headers
      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      const filename = this.extractFilename(contentDisposition);

      // Get content as ArrayBuffer to mirror Golang's byte slice
      const content = await response.arrayBuffer();
      const contentLength = content.byteLength;

      const asset = {
        filename,
        content: new Uint8Array(content),
        content_type: contentType,
        content_length: contentLength,
      };

      console.debug('Fetched file content:', {
        filename: asset.filename,
        content_type: asset.content_type,
        content_length: asset.content_length,
      });

      return asset;
    } catch (error) {
      console.error('Failed to fetch NFT asset:', error);
      throw new Error(`Failed to fetch NFT asset: ${error.message}`);
    }
  }
}

// Create singleton instance
const nftAssetService = new NFTAssetService();
export default nftAssetService;
