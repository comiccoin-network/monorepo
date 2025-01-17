// src/Services/nftMetadataService.jsx

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
 * Fetches NFT metadata from NFT.Storage
 * @param {string} tokenMetadataURI - The IPFS URI of the metadata
 * @returns {Promise<NFTAsset>} The NFT asset metadata and content
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
    const contentType = response.headers.get('content-type');
    const contentLength = parseInt(response.headers.get('content-length') || '0');

    return {
      filename,
      content: new Uint8Array(content),
      content_type: contentType,
      content_length: contentLength,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw error;
  }
};
