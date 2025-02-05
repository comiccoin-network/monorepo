import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { WalletMinimal, Send, QrCode, MoreHorizontal, Clock, Coins, Wallet, ArrowRight, ArrowUpRight, ArrowDownLeft, Ticket } from 'lucide-react';

function BottomTabBar() {
  // The location hook and path checking logic remains the same
  const ignorePathsArr = [
    "/",
    "/pick-data-directory",
    "/startup",
    "/create-your-first-wallet",
    "/wallets",
    "/wallet/add",
    "/send-processing",
    "/send-success",
  ];
  const location = useLocation();
  var arrayLength = ignorePathsArr.length;
  for (var i = 0; i < arrayLength; i++) {
    if (location.pathname === ignorePathsArr[i]) {
      return null;
    }
  }

  return (
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg" aria-label="Primary navigation">
        {/* Updated grid-cols-4 to grid-cols-5 to accommodate the new tab */}
        <div className="grid grid-cols-5 h-20">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center space-y-2 ${location.pathname.includes("dashboard") && "bg-purple-50"}`}
            aria-label="Overview tab, currently selected"
            aria-current="page"
          >
            <Wallet className="w-7 h-7 text-purple-600" aria-hidden="true" />
            <span className="text-sm text-purple-600">Overview</span>
          </Link>
          <Link
            to="/send"
            className={`flex flex-col items-center justify-center space-y-2 ${location.pathname.includes("send") && "bg-purple-50"}`}
            aria-label="Send tab"
          >
            <Send className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">Send</span>
          </Link>
          <Link
            to="/receive"
            className={`flex flex-col items-center justify-center space-y-2 ${location.pathname.includes("receive") && "bg-purple-50"}`}
            aria-label="Receive tab"
          >
            <QrCode className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">Receive</span>
          </Link>
          {/* Added new NFTs tab */}
          <Link
            to="/nfts"
            className={`flex flex-col items-center justify-center space-y-2 ${location.pathname.includes("nfts") && "bg-purple-50"}`}
            aria-label="NFTs tab"
          >
            <Ticket className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">NFTs</span>
          </Link>
          <Link
            to="/more"
            className={`flex flex-col items-center justify-center space-y-2 ${!location.pathname.includes("dashboard") && !location.pathname.includes("send") && !location.pathname.includes("receive") && !location.pathname.includes("nfts") && "bg-purple-50"}`}
            aria-label="More options tab"
          >
            <MoreHorizontal className="w-7 h-7 text-gray-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">More</span>
          </Link>
        </div>
      </nav>
  );
}

export default BottomTabBar;
