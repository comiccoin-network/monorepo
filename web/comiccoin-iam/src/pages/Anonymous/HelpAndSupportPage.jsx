// monorepo/web/comiccoin-iam/src/pages/HelpAndSupportPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  HelpCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  Book,
  Globe,
  Github,
  ArrowLeft,
} from "lucide-react";

import UserTopNavigation from "../../components/UserTopNavigation";
import UserFooter from "../../components/UserFooter";

// FAQ item component with HTML rendering support
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-purple-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-purple-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-purple-600" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 animate-fadeIn">
          {/* Use dangerouslySetInnerHTML to render HTML content */}
          <p dangerouslySetInnerHTML={{ __html: answer }}></p>
        </div>
      )}
    </div>
  );
};

function HelpAndSupportPageContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ data
  const faqs = [
    {
      question: "What is ComicCoin?",
      answer:
        "ComicCoin is a blockchain designed specifically for comic book enthusiasts and collectors.",
    },
    {
      question: "How often can I claim free coins?",
      answer:
        "You can claim free ComicCoins from the faucet once every 24 hours. After claiming, you'll need to wait until the next day to claim again.",
    },
    {
      question: "How do I connect my wallet?",
      answer:
        "To connect your wallet, you will need to create a wallet via <a href='https://comiccoinwallet.com' target='_blank' rel='noopener noreferrer' class='text-purple-600 hover:text-purple-800 underline'>one of the wallets</a>. You can view your wallet address and balance on the 'My Wallet' page.",
    },
    {
      question: "What can I do with my ComicCoins?",
      answer:
        "You can use ComicCoins to purchase digital comics, invest in comic book projects, participate in exclusive auctions, and trade with other collectors on the ComicCoin marketplace.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "You can download them <a href='https://comiccoinwallet.com' target='_blank' rel='noopener noreferrer' class='text-purple-600 hover:text-purple-800 underline'>here</a>.",
    },
    {
      question: "How secure is the ComicCoin platform?",
      answer:
        "ComicCoin uses blockchain technology to ensure secure transactions and storage of your coins. We also implement industry-standard security practices to protect your account and personal information.",
    },
    {
      question: "Can I transfer ComicCoins to another wallet?",
      answer:
        "Yes, you can transfer your ComicCoins to other wallets within the ComicCoin network. Go to your wallet on your mobile device or desktop wallet and use the transfer function to send coins to another address.",
    },
  ];

  // Filtered FAQs based on search
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <UserTopNavigation />

      <main
        id="main-content"
        className="container mx-auto px-4 py-4 sm:py-6 max-w-5xl flex-grow"
      >
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-3 text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">
                Help & Support
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Find answers to common questions and get support when you need
                it
              </p>
            </div>
          </div>
        </header>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 mb-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-medium text-purple-800 mb-4 text-center">
              How can we help you today?
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - FAQs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 mb-6">
              <h2 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
                <Book className="h-5 w-5 text-purple-600 mr-2" />
                Frequently Asked Questions
              </h2>

              {searchQuery && filteredFaqs.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    No results found for "{searchQuery}"
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-purple-600 hover:text-purple-800"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-purple-100">
                  {filteredFaqs.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact Form & Social Links */}
          <div className="lg:col-span-1">
            {/* Connect with Us */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
                <Globe className="h-5 w-5 text-purple-600 mr-2" />
                Connect With Us
              </h2>

              <div className="space-y-4">
                <a
                  href="mailto:hello@comiccoin.ca"
                  className="flex items-center p-3 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Mail className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email Support</h3>
                    <p className="text-sm text-gray-600">hello@comiccoin.ca</p>
                  </div>
                </a>
                <a
                  href="https://github.com/comiccoin-network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Github className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">GitHub</h3>
                    <p className="text-sm text-gray-600">comiccoin-network</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Add animation styles */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
        `}</style>
      </main>

      <UserFooter />
    </div>
  );
}

// Wrap the component with XXX HOC
const HelpAndSupportPage = HelpAndSupportPageContent;
export default HelpAndSupportPage;
