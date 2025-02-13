// src/components/dashboard/ClaimsList.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Coins, ArrowUpRight } from "lucide-react";

interface Claim {
  id: string;
  timestamp: Date;
  amount: number;
  address: string;
  status: "completed" | "pending";
  hash: string;
}

interface ClaimsListProps {
  claims: Claim[];
  isPersonal?: boolean;
}

export const ClaimsList = ({ claims, isPersonal = false }: ClaimsListProps) => {
  const router = useRouter();

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleClaimClick = (id: string) => {
    router.push(`/user/transactions/${id}`);
  };

  return (
    <div className="space-y-2">
      {claims.map((claim) => (
        <div
          key={claim.id}
          onClick={() => handleClaimClick(claim.id)}
          className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-900">
                {isPersonal
                  ? "You claimed"
                  : `${formatAddress(claim.address)} claimed`}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(claim.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-purple-600">
              {claim.amount} CC
            </span>
            <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );
};
