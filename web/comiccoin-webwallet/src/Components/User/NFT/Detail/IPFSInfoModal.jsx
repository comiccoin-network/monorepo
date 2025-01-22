// src/Components/User/NFTs/IPFSInfoModal.jsx
import React, { useState } from 'react'
import { Info, ExternalLink, X } from 'lucide-react'

const IPFSInfoModal = ({ tokenMetadataUri, imageUri, animationUri }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Function to convert URI to IPFS gateway URL
    const getIPFSGatewayUrl = (uri) => {
        if (!uri) return null
        // Remove ipfs:// prefix if present
        const cid = uri.replace('ipfs://', '')
        return `https://ipfs.io/ipfs/${cid}`
    }

    const gatewayUrl = getIPFSGatewayUrl(tokenMetadataUri)
    const imageGatewayUrl = getIPFSGatewayUrl(imageUri)
    const animationGatewayUrl = getIPFSGatewayUrl(animationUri)

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
                <Info className="h-4 w-4 text-gray-500" />
            </button>
        )
    }

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setIsOpen(false)}
            >
                {/* Modal Content */}
                <div
                    className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">About IPFS Storage</h2>
                                <p className="text-gray-600 mt-1">Understanding decentralized storage for your NFT</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-6">
                        {/* What is IPFS Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">What is IPFS?</h3>
                            <p className="text-gray-600">
                                IPFS (InterPlanetary File System) is a decentralized storage network that ensures your
                                NFT's content remains accessible without relying on a single server or company. This
                                makes your NFT truly decentralized and permanent.
                            </p>
                        </div>

                        {/* Desktop App Section */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Store Locally with IPFS Desktop</h3>
                            <p className="text-gray-600 mb-4">
                                You can install the IPFS Desktop App to keep a local copy of your NFT's content and help
                                strengthen the network.
                            </p>
                            <a
                                href="https://docs.ipfs.tech/install/ipfs-desktop/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Install IPFS Desktop
                            </a>
                        </div>

                        {/* Network Strength Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Support the Network</h3>
                            <p className="text-gray-600">
                                As an NFT owner, you can strengthen the ComicCoin network by pinning your NFT assets
                                using IPFS Desktop. This helps ensure your NFT's long-term value and accessibility while
                                contributing to the network's robustness.
                            </p>
                        </div>

                        {/* Gateway Links Section */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <h3 className="text-lg font-semibold mb-2">View on IPFS Gateway</h3>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Metadata</p>
                                <a
                                    href={gatewayUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-700 break-all inline-flex items-center gap-1"
                                >
                                    {gatewayUrl}
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                            </div>
                            {imageGatewayUrl && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Image</p>
                                    <a
                                        href={imageGatewayUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-700 break-all inline-flex items-center gap-1"
                                    >
                                        {imageGatewayUrl}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                </div>
                            )}
                            {animationGatewayUrl && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Animation</p>
                                    <a
                                        href={animationGatewayUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-700 break-all inline-flex items-center gap-1"
                                    >
                                        {animationGatewayUrl}
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default IPFSInfoModal
