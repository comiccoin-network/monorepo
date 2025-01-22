// src/Services/NFTMetadataService.jsx
const NFT_STORAGE_API_URL = process.env.REACT_APP_NFTSTORAGE_API_URL || 'http://localhost:9000'

export const convertIPFSToGatewayURL = (ipfsUri) => {
    if (!ipfsUri) return ''
    if (!ipfsUri.startsWith('ipfs://')) return ipfsUri
    const cid = ipfsUri.replace('ipfs://', '')
    return `${NFT_STORAGE_API_URL}/ipfs/${cid}`
}

export const fetchNFTMetadata = async (tokenMetadataURI) => {
    try {
        console.log('Fetching metadata for:', tokenMetadataURI)
        const cid = tokenMetadataURI.replace('ipfs://', '')
        const response = await fetch(`${NFT_STORAGE_API_URL}/ipfs/${cid}`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get('content-type')
        const content = await response.arrayBuffer()
        const metadata = JSON.parse(new TextDecoder().decode(content))
        console.log('Parsed metadata:', metadata)

        return {
            metadata,
            rawAsset: {
                content: new Uint8Array(content),
                content_type: contentType,
                content_length: content.byteLength,
            },
        }
    } catch (error) {
        console.error('Error fetching NFT metadata:', error)
        throw error
    }
}
