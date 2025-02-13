// src/components/dashboard/StatsCard.tsx
"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: StatsCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-purple-800">{title}</h2>
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <div className="text-3xl font-bold text-purple-700">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {trend && (
          <div
            className={`text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
};
