// src/components/IndexPage/StepCard.jsx
import { Link } from "react-router";
import { ExternalLink, UserPlus, Wallet, Coins } from "lucide-react";

const StepCard = ({
  id,
  icon,
  title,
  description,
  subtitle,
  actionText,
  actionUrl,
  isExternalLink,
  noAction,
}) => {
  // Map icon strings to actual Lucide icon components
  const getIcon = (iconName) => {
    switch (iconName) {
      case "Wallet":
        return <Wallet className="h-8 w-8 text-purple-600" />;
      case "UserPlus":
        return <UserPlus className="h-8 w-8 text-purple-600" />;
      case "Coins":
        return <Coins className="h-8 w-8 text-purple-600" />;
      default:
        return <Coins className="h-8 w-8 text-purple-600" />;
    }
  };

  // Render action button or link based on props
  const renderAction = () => {
    if (noAction) return null;
    if (!actionText || !actionUrl) return null;

    if (isExternalLink) {
      return (
        <a
          href={actionUrl}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base active:bg-purple-800"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={actionText}
        >
          {actionText}
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    } else {
      return (
        <Link
          to={actionUrl}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base active:bg-purple-800"
          aria-label={actionText}
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="flex flex-col items-center text-center h-full">
        <div className="p-4 bg-purple-50 rounded-xl mb-6 transform transition-transform duration-300 hover:scale-110">
          {getIcon(icon)}
        </div>
        <h3 className="text-xl font-bold text-purple-800 mb-3">
          {`Step ${id}: ${title}`}
        </h3>
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 mb-4">{subtitle}</p>
        )}
        <div className="mt-auto">{renderAction()}</div>
      </div>
    </div>
  );
};

export default StepCard;
