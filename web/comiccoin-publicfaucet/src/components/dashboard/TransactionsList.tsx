// src/components/dashboard/TransactionsList.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Coins, ExternalLink, CheckCircle2, Clock } from "lucide-react";

interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  from: string;
  to: string;
  hash: string;
  status: "completed" | "pending";
}

interface TransactionsListProps {
  transactions: Transaction[];
  isPersonal?: boolean;
}

export const TransactionsList = ({
  transactions,
  isPersonal = false,
}: TransactionsListProps) => {
  const router = useRouter();

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleTransactionClick = (txId: string) => {
    router.push(`/user/transactions/${txId}`);
  };

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          onClick={() => handleTransactionClick(tx.id)}
          className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-all cursor-pointer border border-purple-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {tx.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {isPersonal ? "Claimed" : `${formatAddress(tx.from)} claimed`}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-purple-600" />
                <span className="font-bold text-purple-700">
                  {tx.amount.toLocaleString()} CC
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
