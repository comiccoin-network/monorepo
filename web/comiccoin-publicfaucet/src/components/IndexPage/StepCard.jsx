// src/components/IndexPage/StepCard.jsx
import React from "react";
import { Link } from "react-router";
import {
  ExternalLink,
  UserPlus,
  Wallet,
  Coins,
  ArrowRight,
} from "lucide-react";

const StepCard = ({ id, icon, title, description, subtitle }) => {
  // Function to render the correct icon remains the same
  const getIcon = () => {
    switch (icon) {
      case "UserPlus":
        return <UserPlus className="h-6 w-6 text-purple-600" />;
      case "Wallet":
        return <Wallet className="h-6 w-6 text-purple-600" />;
      case "Coins":
        return <Coins className="h-6 w-6 text-purple-600" />;
      default:
        return <Coins className="h-6 w-6 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 flex flex-col h-full transition-all duration-300 hover:shadow-xl">
      {/* Step Number and Icon */}
      <div className="flex items-center justify-between mb-5">
        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
          {getIcon()}
        </div>
        <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
          {id}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StepCard;
