"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Coins,
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface TransactionDetail {
  id: string;
  timestamp: Date;
  amount: number;
  from: string;
  to: string;
  hash: string;
  status: "completed" | "pending";
  blockNumber?: number;
  gasUsed?: number;
  networkFee?: number;
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTransaction = async () => {
      try {
        // Mock data
        const mockTransaction: TransactionDetail = {
          id: params.id as string,
          timestamp: new Date(),
          amount: 500,
          from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          to: "0x123f681aD6E5914e58774E56686dfE01234a6542",
          hash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
          status: "completed",
          blockNumber: 12345678,
          gasUsed: 21000,
          networkFee: 0.0021,
        };
        setTransaction(mockTransaction);
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [params.id]);

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Transaction not found
        </h2>
        <Link
          href="/user/dashboard"
          className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-2">
          {transaction.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
          )}
          <span
            className={`font-medium ${
              transaction.status === "completed"
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {transaction.status === "completed" ? "Completed" : "Pending"}
          </span>
        </div>
      </div>

      {/* Transaction Details Card */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden">
        {/* Amount Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-2">
              <Coins className="w-8 h-8" />
              {transaction.amount.toLocaleString()} CC
            </div>
            <div className="text-purple-200">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          {/* Transaction Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">
              Transaction Hash
            </label>
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
              <code className="text-sm text-purple-700">
                {transaction.hash}
              </code>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(transaction.hash)}
                  className="p-1 hover:bg-purple-100 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <a
                  href={`https://etherscan.io/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-purple-100 rounded"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              </div>
            </div>
          </div>

          {/* From/To Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">From</label>
              <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <code className="text-sm text-purple-700">
                  {formatAddress(transaction.from)}
                </code>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(transaction.from)}
                    className="p-1 hover:bg-purple-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <a
                    href={`https://etherscan.io/address/${transaction.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-purple-100 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">To</label>
              <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <code className="text-sm text-purple-700">
                  {formatAddress(transaction.to)}
                </code>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(transaction.to)}
                    className="p-1 hover:bg-purple-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <a
                    href={`https://etherscan.io/address/${transaction.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-purple-100 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Block Number
              </label>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-700">
                  {transaction.blockNumber}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Gas Used
              </label>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-700">
                  {transaction.gasUsed?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">
                Network Fee
              </label>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-700">
                  {transaction.networkFee} ETH
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/user/dashboard"
          className="flex items-center text-purple-600 hover:text-purple-700"
        >
          Return to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
