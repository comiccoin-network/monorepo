// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/dashboard/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  nextClaimTime: string; // ISO timestamp
  canClaim: boolean;
}

export function CountdownTimer({
  nextClaimTime,
  canClaim,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date().getTime();
      const next = new Date(nextClaimTime).getTime();
      const difference = next - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [nextClaimTime]);

  if (canClaim) {
    return (
      <div className="bg-green-50 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-green-800">
            Ready to Claim!
          </h2>
          <Clock className="h-6 w-6 text-green-600" />
        </div>
        <div className="text-green-600">
          Your next batch of ComicCoins is ready to be claimed!
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-purple-800">Next Claim In</h2>
        <Clock className="h-6 w-6 text-purple-600" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-700">
            {timeLeft.hours}
          </div>
          <div className="text-sm text-gray-600">hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-700">
            {timeLeft.minutes}
          </div>
          <div className="text-sm text-gray-600">minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-700">
            {timeLeft.seconds}
          </div>
          <div className="text-sm text-gray-600">seconds</div>
        </div>
      </div>
    </div>
  );
}
