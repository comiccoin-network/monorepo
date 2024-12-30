import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Stamp } from 'lucide-react';

function Topbar() {
  // Render the following component GUI
  return (
      <header className="bg-gradient-to-r from-purple-700 to-indigo-800 px-8 py-6 text-white shadow-lg">
        <div className="flex items-center justify-center gap-4">
          <Stamp className="w-8 h-8" aria-hidden="true" />
          <h1 className="text-3xl font-bold">ComicCoin NFT Minter</h1>
        </div>
      </header>
  );
}

export default Topbar;
