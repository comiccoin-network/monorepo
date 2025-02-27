import React from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white px-4">
      <div className="text-center max-w-md">
        {/* Error Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <AlertCircle
              className="h-24 w-24 text-purple-500 animate-pulse"
              aria-label="Page Not Found"
            />
            <div className="absolute inset-0 bg-purple-300 rounded-full opacity-25 blur-xl -z-10 animate-slow-bounce"></div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Oops! The page you're looking for seems to have wandered off into the ComicCoin multiverse.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Return to Homepage"
          >
            <Home className="h-5 w-5" />
            Return Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Go Back"
          >
            Go Back
          </button>
        </div>

        {/* Additional Context */}
        <p className="text-sm text-gray-500 mt-8">
          Need help finding your way?
          <a
            href="mailto:support@comiccoin.com"
            className="text-purple-600 hover:underline ml-1"
          >
            Contact Support
          </a>
        </p>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-slow-bounce {
          animation: slow-bounce 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
