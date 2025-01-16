import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

import { useBlockDataViaTransactionNonce } from '../../../../Hooks/useBlockDataViaTransactionNonce';
import { formatBytes, base64ToHex } from '../../../../Utils/byteUtils';
import NavigationMenu from "../../NavigationMenu/View";
import FooterMenu from "../../FooterMenu/View";

function TransactionDetailPage() {
    const { nonceString } = useParams();
    const { blockData, loading, error } = useBlockDataViaTransactionNonce(nonceString);
    const [currentTransaction, setCurrentTransaction] = useState(null);

    useEffect(() => {
        console.log('Current blockData:', blockData);
        console.log('Nonce String from URL:', nonceString);

        if (blockData?.trans && blockData.trans.length > 0) {
            console.log('Transactions:', blockData.trans);

            // First try to find by timestamp since the nonce looks like a timestamp
            const transaction = blockData.trans.find(tx => {
                console.log('Transaction data:', {
                    timestamp: tx.timestamp,
                    urlNonce: parseInt(nonceString),
                    nonceBytesHex: tx.nonce_bytes ? base64ToHex(tx.nonce_bytes) : null,
                    nonceString: tx.nonce_string
                });

                // Try different matching strategies
                return tx.timestamp === parseInt(nonceString) ||           // Match by timestamp
                       tx.nonce_string === nonceString ||                 // Match by nonce string
                       base64ToHex(tx.nonce_bytes || '') === nonceString; // Match by nonce bytes
            });

            console.log('Found transaction:', transaction);
            setCurrentTransaction(transaction);
        }
    }, [blockData, nonceString]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2">Loading transaction details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
                <NavigationMenu />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-red-800 font-medium">Error Loading Transaction</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                </main>
                <FooterMenu />
            </div>
        );
    }

    if (!blockData) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
                <NavigationMenu />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-yellow-800 font-medium">No Block Data</h3>
                                <p className="text-yellow-700 mt-1">Failed to load block data.</p>
                            </div>
                        </div>
                    </div>
                </main>
                <FooterMenu />
            </div>
        );
    }

    // DEVELOPERS NOTE: Only stops here
    console.log("currentTransaction --------------->", currentTransaction);

    if (!currentTransaction) { // It skips here
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
                <NavigationMenu />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-yellow-800 font-medium">Transaction Not Found</h3>
                                <p className="text-yellow-700 mt-1">
                                    Could not find transaction with nonce: {nonceString}
                                </p>
                                <p className="text-yellow-700 mt-1">
                                    Block contains {blockData.trans?.length || 0} transaction(s)
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
                <FooterMenu />
            </div>
        );
    }

    // DEVELOPERS NOTE: DOES NOT GO HERE
    console.log("currentTransaction ===============>", currentTransaction);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
            <NavigationMenu />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16 md:mb-0">
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
                                {currentTransaction.type === 'coin' ? 'Coin Transfer' : 'NFT Transaction'}
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
                                    <div className="md:col-span-2">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Metadata URI</h4>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm bg-gray-50 p-2 rounded flex-1 break-all">
                                                {currentTransaction.token_metadata_uri || 'N/A'}
                                            </code>
                                            {currentTransaction.token_metadata_uri && (
                                                <a
                                                    href={currentTransaction.token_metadata_uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
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
