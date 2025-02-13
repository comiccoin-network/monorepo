// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/dashboard/CountdownTimer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  nextClaimTime: Date;
}

export const CountdownTimer = ({ nextClaimTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReady: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = nextClaimTime.getTime() - now;

      if (difference <= 0) {
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
          isReady: true,
        };
      }

      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isReady: false,
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextClaimTime]);

  const padNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div
      className={`p-6 rounded-xl transition-all duration-300 ${
        timeLeft.isReady
          ? "bg-gradient-to-r from-green-500 to-emerald-600 animate-pulse"
          : "bg-gradient-to-r from-indigo-500 to-purple-600"
      }`}
      role="timer"
      aria-label={timeLeft.isReady ? "Ready to claim" : "Time until next claim"}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Clock
            className={`h-6 w-6 ${timeLeft.isReady ? "text-green-100" : "text-purple-100"}`}
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-white">
            {timeLeft.isReady ? "Ready to Claim!" : "Next Claim In"}
          </h2>
        </div>

        {!timeLeft.isReady ? (
          <div
            className="grid grid-cols-3 gap-2 text-center"
            aria-live="polite"
          >
            <div className="flex flex-col">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <span
                  className="text-2xl font-mono font-bold text-white"
                  aria-label={`${timeLeft.hours} hours`}
                >
                  {padNumber(timeLeft.hours)}
                </span>
              </div>
              <span className="text-xs text-purple-100 mt-1">Hours</span>
            </div>
            <div className="flex flex-col">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <span
                  className="text-2xl font-mono font-bold text-white"
                  aria-label={`${timeLeft.minutes} minutes`}
                >
                  {padNumber(timeLeft.minutes)}
                </span>
              </div>
              <span className="text-xs text-purple-100 mt-1">Minutes</span>
            </div>
            <div className="flex flex-col">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <span
                  className="text-2xl font-mono font-bold text-white"
                  aria-label={`${timeLeft.seconds} seconds`}
                >
                  {padNumber(timeLeft.seconds)}
                </span>
              </div>
              <span className="text-xs text-purple-100 mt-1">Seconds</span>
            </div>
          </div>
        ) : (
          <button
            className="px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-500"
            onClick={() => {
              /* TODO: Implement claim function */
            }}
            aria-label="Claim your coins now"
          >
            Claim Now
          </button>
        )}
      </div>
    </div>
  );
};
