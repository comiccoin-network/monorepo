import React from 'react';
import { useNavigate } from 'react-router';
import { XCircle, Home, ArrowLeft } from 'lucide-react';

// RegisterCanceledPage: A component for handling canceled registration
const RegisterCanceledPage: React.FC = () => {
  // Use React Router's useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 max-w-lg">
          <div className="flex flex-col items-center gap-6">
            {/* Error Icon with subtle animation */}
            <div className="relative">
              <XCircle
                className="h-16 w-16 text-red-500 animate-pulse"
                aria-label="Registration Canceled"
              />
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-gray-900">
                Registration Canceled
              </h1>
              <p className="text-gray-600 text-lg">
                Your registration process has been canceled. You can return to
                the homepage or start a new registration whenever you're ready.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Return to Homepage"
              >
                <Home className="h-5 w-5" />
                Return Home
              </button>
              <button
                onClick={() => navigate('/register-call')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Try Registration Again"
              >
                <ArrowLeft className="h-5 w-5" />
                Try Again
              </button>
            </div>

            {/* Support Context */}
            <p className="text-sm text-gray-500 mt-6">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:hello@comiccoin.com"
                className="text-purple-600 hover:underline"
              >
                hello@comiccoin.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default RegisterCanceledPage;
