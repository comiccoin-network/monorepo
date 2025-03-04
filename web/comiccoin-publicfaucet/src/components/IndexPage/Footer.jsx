// src/components/FaucetPage/StepCard.jsx
import { Link } from "react-router";
import { ExternalLink, UserPlus, Wallet, Coins } from "lucide-react";

const StepCard = ({
  id,
  icon,
  title,
  description,
  actionText,
  actionUrl,
  isExternalLink,
  subtitle,
  noAction,
}) => {
  // Function to render the correct icon
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
    <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 flex flex-col h-full">
      {/* Step Number and Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="bg-purple-100 text-purple-800 text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
          {id}
        </div>
      </div>

      {/* Content */}
      <div className="mb-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>

      {/* Action Button (Optional) */}
      {!noAction &&
        (isExternalLink ? (
          <a
            href={actionUrl}
            className="mt-auto bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {actionText}
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <Link
            to={actionUrl}
            className="mt-auto bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {actionText}
          </Link>
        ))}
    </div>
  );
};

export default StepCard;
