// src/components/dashboard/NetworkStats.tsx
"use client";

import React from "react";
import { TrendingUp, Users, Coins } from "lucide-react";

interface NetworkStatsProps {
  uniqueClaimers24h: number;
  totalVolume24h: number;
  avgClaimAmount: number;
}

export const NetworkStats = ({
  uniqueClaimers24h,
  totalVolume24h,
  avgClaimAmount,
}: NetworkStatsProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        Network Activity (24h)
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Unique Claimers</span>
          </div>
          <div className="text-xl font-bold text-purple-700">
            {uniqueClaimers24h.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Volume</span>
          </div>
          <div className="text-xl font-bold text-purple-700">
            {totalVolume24h.toLocaleString()} CC
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">Avg Claim</span>
          </div>
          <div className="text-xl font-bold text-purple-700">
            {avgClaimAmount.toLocaleString()} CC
          </div>
        </div>
      </div>
    </div>
  );
};
