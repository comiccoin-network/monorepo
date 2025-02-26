// src/components/dashboard/ClaimStreak.tsx
"use client";

import React from "react";
import { Flame } from "lucide-react";

interface ClaimStreakProps {
  currentStreak: number;
  nextMilestone: number;
  bonusAmount: number;
}

export const ClaimStreak = ({
  currentStreak,
  nextMilestone,
  bonusAmount,
}: ClaimStreakProps) => {
  const progress = (currentStreak / nextMilestone) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800">Claim Streak</h3>
        <Flame className="h-6 w-6 text-orange-500" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-3xl font-bold text-orange-500">
          {currentStreak}
        </div>
        <div className="text-sm text-gray-600">days</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-orange-500 rounded-full h-2 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">
        {nextMilestone - currentStreak} days until {bonusAmount} CC bonus!
      </p>
    </div>
  );
};
