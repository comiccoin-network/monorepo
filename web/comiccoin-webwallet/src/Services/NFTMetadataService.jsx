// src/Services/nftMetadataService.jsx

/**
 * @typedef {Object} NFTMetadataAttribute
 * @property {string} trait_type
 * @property {string|number} value
 */

/**
 * @typedef {Object} NFTMetadata
 * @property {string} image
 * @property {string} external_url
 * @property {string} description
 * @property {string} name
 * @property {NFTMetadataAttribute[]} attributes
 * @property {string} background_color
 * @property {string} animation_url
 * @property {string} youtube_url
 */

/**
 * @typedef {Object} NFTAsset
 * @property {string} filename
 * @property {Uint8Array} content
 * @property {string} content_type
 * @property {number} content_length
 */

const NFT_STORAGE_API_URL = process.env.REACT_APP_NFTSTORAGE_API_URL || 'http://localhost:9000';

/**
 * Extracts CID from IPFS URI by removing the 'ipfs://' prefix
 * @param {string} tokenMetadataURI - The IPFS URI (e.g., 'ipfs://bafkrei...')
 * @returns {string} The extracted CID
 */
const extractCIDFromURI = (tokenMetadataURI) => {
  if (!tokenMetadataURI) {
    throw new Error('Token metadata URI is required');
  }

  if (!tokenMetadataURI.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format. Must start with "ipfs://"');
  }

  return tokenMetadataURI.replace('ipfs://', '');
};

/**
 * Converts an IPFS URI to a gateway URL
 * @param {string} ipfsUri - The IPFS URI (e.g., 'ipfs://bafkrei...')
 * @returns {string} The full gateway URL
 */
export const convertIPFSToGatewayURL = (ipfsUri) => {
  if (!ipfsUri) return '';
  if (!ipfsUri.startsWith('ipfs://')) return ipfsUri; // Return as-is if not IPFS URI
  const cid = ipfsUri.replace('ipfs://', '');
  return `${NFT_STORAGE_API_URL}/ipfs/${cid}`;
};

/**
 * Parses binary content into NFT metadata
 * @param {Uint8Array} content
 * @returns {NFTMetadata}
 */
const parseMetadata = (content) => {
  try {
    const text = new TextDecoder().decode(content);
    const metadata = JSON.parse(text);
    return metadata;
  } catch (error) {
    throw new Error(`Failed to parse metadata: ${error.message}`);
  }
};

/**
 * Fetches NFT metadata from NFT.Storage
 * @param {string} tokenMetadataURI - The IPFS URI of the metadata
 * @returns {Promise<{ rawAsset: NFTAsset, metadata: NFTMetadata }>} The NFT asset metadata and content
 */
export const fetchNFTMetadata = async (tokenMetadataURI) => {
  try {
    const cid = extractCIDFromURI(tokenMetadataURI);
    const response = await fetch(`${NFT_STORAGE_API_URL}/ipfs/${cid}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get filename from Content-Disposition header or fallback to 'metadata.json'
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/["']/g, '')
      : 'metadata.json';

    const content = await response.arrayBuffer();
    const contentUint8 = new Uint8Array(content);
    const contentType = response.headers.get('content-type');
    const contentLength = parseInt(response.headers.get('content-length') || '0');

    // Create the raw asset object
    const rawAsset = {
      filename,
      content: contentUint8,
      content_type: contentType,
      content_length: contentLength,
    };

    // Parse the metadata
    const metadata = parseMetadata(contentUint8);

    return {
      rawAsset,
      metadata,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw error;
  }
};
