// src/Components/User/More/Transaction/DetailView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
    ArrowLeft,
    AlertCircle,
    Loader2,
    Copy,
    ExternalLink,
    Clock,
    Hash,
    Send,
    Receipt,
    Coins,
    Image as ImageIcon,
    FileText,
    CircleDollarSign,
    Shield
} from 'lucide-react';

import { useWallet } from '../../../../Hooks/useWallet';
import { useBlockDataViaTransactionNonce } from '../../../../Hooks/useBlockDataViaTransactionNonce';
import { formatBytes, base64ToHex } from '../../../../Utils/byteUtils';
import NavigationMenu from "../../NavigationMenu/View";
import FooterMenu from "../../FooterMenu/View";
import walletService from '../../../../Services/WalletService';
import { useNFTMetadata } from '../../../../Hooks/useNFTMetadata';
import { convertIPFSToGatewayURL } from '../../../../Services/NFTMetadataService';

function TransactionDetailPage() {
    const { nonceString } = useParams();
    const { blockData, loading, error } = useBlockDataViaTransactionNonce(nonceString);
    const {
        currentWallet,
        logout,
        loading: serviceLoading,
        error: serviceError
    } = useWallet();

    // State for session management
    const [forceURL, setForceURL] = useState("");
    const [sessionError, setSessionError] = useState(null);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTransaction, setCurrentTransaction] = useState(null);

    const { metadata: nftMetadata, loading: nftLoading, error: nftError } = useNFTMetadata(
        currentTransaction?.type === 'token' ? currentTransaction.token_metadata_uri : null
    );

    // Session checking effect
    useEffect(() => {
        let mounted = true;

        const checkWalletSession = async () => {
            try {
                if (!mounted) return;
                setIsLoading(true);

                if (serviceLoading) {
                    return;
                }

                if (!currentWallet) {
                    if (mounted) {
                        setForceURL("/login");
                    }
                    return;
                }

                // Check session using the wallet service
                if (!walletService.checkSession()) {
                    throw new Error("Session expired");
                }

                if (mounted) {
                    setForceURL("");
                    setSessionError(null);
                }

            } catch (error) {
                console.error('TransactionDetailPage: Session check error:', error);
                if (error.message === "Session expired" && mounted) {
                    handleSessionExpired();
                } else if (mounted) {
                    setSessionError(error.message);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        checkWalletSession();
        const sessionCheckInterval = setInterval(checkWalletSession, 60000);

        return () => {
            mounted = false;
            clearInterval(sessionCheckInterval);
        };
    }, [currentWallet, serviceLoading]);

    // Transaction matching effect
    useEffect(() => {
        if (blockData?.trans && blockData.trans.length > 0) {
            const transaction = blockData.trans.find(tx => {
                return tx.timestamp === parseInt(nonceString) ||           // Match by timestamp
                       tx.nonce_string === nonceString ||                 // Match by nonce string
                       base64ToHex(tx.nonce_bytes || '') === nonceString; // Match by nonce bytes
            });
            setCurrentTransaction(transaction);
        }
    }, [blockData, nonceString]);

    const handleSessionExpired = () => {
        setIsSessionExpired(true);
        logout();
        setSessionError("Your session has expired. Please sign in again.");
        setTimeout(() => {
            setForceURL("/login");
        }, 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    if (forceURL !== "" && !serviceLoading) {
        return <Navigate to={forceURL} />;
    }

    if (serviceLoading || isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2">Loading transaction details...</span>
            </div>
        );
    }

    const renderErrorState = (errorMessage, type = "error") => (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <NavigationMenu />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className={`bg-${type === "error" ? "red" : "yellow"}-50 border-l-4 border-${type === "error" ? "red" : "yellow"}-500 p-4 rounded-r-lg`}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className={`w-6 h-6 text-${type === "error" ? "red" : "yellow"}-500 flex-shrink-0`} />
                        <div>
                            <h3 className={`text-${type === "error" ? "red" : "yellow"}-800 font-medium`}>
                                {type === "error" ? "Error Loading Transaction" : "Transaction Not Found"}
                            </h3>
                            <p className={`text-${type === "error" ? "red" : "yellow"}-700 mt-1`}>{errorMessage}</p>
                        </div>
                    </div>
                </div>
            </main>
            <FooterMenu />
        </div>
    );

    // Handle various error states
    if (sessionError) {
        return renderErrorState(sessionError);
    }

    if (error) {
        return renderErrorState(error);
    }

    if (!blockData) {
        return renderErrorState("Failed to load block data.", "warning");
    }

    if (!currentTransaction) {
        return renderErrorState(
            `Could not find transaction with nonce: ${nonceString}. Block contains ${blockData.trans?.length || 0} transaction(s)`,
            "warning"
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <NavigationMenu />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16 md:mb-0">
                {isSessionExpired && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <p className="text-yellow-800">Session expired. Redirecting to login...</p>
                        </div>
                    </div>
                )}

                <Link
                    to="/transactions"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Transactions
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-purple-800 mb-4">Transaction Details</h1>
                    <p className="text-xl text-gray-600">
                        Block #{blockData.header.number_string} • Transaction Nonce: {currentTransaction.nonce_string || formatBytes(currentTransaction.nonce_bytes)}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className={`px-6 py-4 ${
                        currentTransaction.type === 'coin' ? 'bg-blue-50' : 'bg-purple-50'
                    }`}>
                        <div className="flex items-center gap-3">
                            {currentTransaction.type === 'coin' ? (
                                <Coins className="w-6 h-6 text-blue-600" />
                            ) : (
                                <ImageIcon className="w-6 h-6 text-purple-600" />
                            )}
                            <h2 className="text-xl font-bold">
                                {currentTransaction.type === 'coin' ? 'Coin Transaction' : 'NFT Transaction'}
                            </h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">From Address</h3>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm bg-gray-50 p-2 rounded flex-1 break-all">
                                        {currentTransaction.from}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(currentTransaction.from)}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">To Address</h3>
                                <div className="flex items-center gap-2">
                                    <code className="text-sm bg-gray-50 p-2 rounded flex-1 break-all">
                                        {currentTransaction.to}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(currentTransaction.to)}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Value</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {currentTransaction.value} CC
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Transaction Fee</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {currentTransaction.fee} CC
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Chain ID</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {currentTransaction.chain_id}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Timestamp</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Date(currentTransaction.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Signature Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">V (Recovery Identifier)</h4>
                                    <code className="text-sm bg-gray-50 p-2 rounded block break-all">
                                        {formatBytes(currentTransaction.v_bytes)}
                                    </code>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">R (First Coordinate)</h4>
                                    <code className="text-sm bg-gray-50 p-2 rounded block break-all">
                                        {formatBytes(currentTransaction.r_bytes)}
                                    </code>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">S (Second Coordinate)</h4>
                                    <code className="text-sm bg-gray-50 p-2 rounded block break-all">
                                        {formatBytes(currentTransaction.s_bytes)}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {currentTransaction.type === 'token' && (
    <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">NFT Details</h3>

        {/* NFT Preview Link */}
        <div className="mb-6">
            <Link
                to={`/nft?token_id=${currentTransaction.token_id_string}&token_metadata_uri=${currentTransaction.token_metadata_uri}`}
                className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-purple-900">View NFT Details</h4>
                        <p className="text-purple-600">Click to see the full NFT preview and metadata</p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-purple-600 ml-auto rotate-180" />
                </div>
            </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Token ID</h4>
                    <p className="text-lg font-bold text-gray-900">
                        {currentTransaction.token_id_string || formatBytes(currentTransaction.token_id_bytes)}
                    </p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Token Nonce</h4>
                    <p className="text-lg font-bold text-gray-900">
                        {currentTransaction.token_nonce_string || formatBytes(currentTransaction.token_nonce_bytes)}
                    </p>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Metadata URI</h4>
                <div className="space-y-3">
                    {/* IPFS Storage Link */}
                    <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-50 p-2 rounded flex-1 break-all">
                            {currentTransaction.token_metadata_uri || 'N/A'}
                        </code>
                        {currentTransaction.token_metadata_uri && (
                            <a
                                href={convertIPFSToGatewayURL(currentTransaction.token_metadata_uri)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View on NFT Storage"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    {/* Public IPFS Gateway Link */}
                    {currentTransaction.token_metadata_uri && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>View via public IPFS gateway:</span>
                            <a
                                href={`https://ipfs.io/ipfs/${currentTransaction.token_metadata_uri.replace('ipfs://', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                            >
                                ipfs.io gateway
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* NFT Metadata Display */}
            <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">NFT Metadata</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                    {nftLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            <span className="ml-2 text-gray-600">Loading metadata...</span>
                        </div>
                    )}
                    {nftError && (
                        <div className="text-red-600 py-2">
                            Failed to load metadata: {nftError}
                        </div>
                    )}
                    {nftMetadata && (
                        <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-all text-gray-800">
                            {JSON.stringify(nftMetadata, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    </div>
)}

                        {(currentTransaction.data || currentTransaction.data_string) && (
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Data</h3>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Data Payload</h4>
                                    <code className="text-sm bg-gray-50 p-2 rounded block break-all">
                                        {currentTransaction.data_string || formatBytes(currentTransaction.data)}
                                    </code>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <FooterMenu />
        </div>
    );
}

export default TransactionDetailPage;
