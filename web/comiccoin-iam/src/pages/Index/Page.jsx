// monorepo/web/comiccoin-iam/src/pages/Index/Page.jsx
import { useState, useEffect } from "react";
import {
  RefreshCw,
  ArrowRight,
  Github,
  Search,
  UserCheck,
  Database,
  Shield,
  Globe,
  Building,
  User,
  PlayCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import Header from "../../components/IndexPage/Header";
import Footer from "../../components/IndexPage/Footer";
import withRedirectAuthenticated from "../../components/withRedirectAuthenticated";

const IndexPage = () => {
  const navigate = useNavigate(); // Use navigate for programmatic navigation

  // Mock data state instead of using a hook
  const [identityStats, setIdentityStats] = useState({
    registered_entries: 8750,
    verified_entries: 6423,
    daily_lookups: 4250,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulating refetch function
  const refetch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIdentityStats({
        registered_entries: 8750,
        verified_entries: 6423,
        daily_lookups: 4250,
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to the search page with the query parameter
    if (searchQuery.trim()) {
      navigate(`/directory?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      {/* Header component */}
      <Header />

      <main id="main-content" className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-500 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
              ComicCoin Digital Identity
            </h1>
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-white opacity-20 blur transform scale-110 rounded-full"></div>
              <div className="relative">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-12 w-12 text-white animate-spin" />
                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
                      Loading...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-red-300">
                      {error?.message || "Error loading data"}
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 active:bg-indigo-100"
                      aria-label="Retry loading data"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Retry
                    </button>
                  </div>
                ) : (
                  <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 text-white">
                    Trust & Verify
                  </p>
                )}
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Easily verify wallet addresses and discover verified organizations
              and individuals on the ComicCoin blockchain.
            </p>

            {/* Search box */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or wallet address"
                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-700"
                    aria-label="Search by name or wallet address"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors text-lg shadow-lg hover:shadow-xl active:bg-indigo-100 active:shadow-md flex items-center justify-center"
                >
                  Search
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </form>

            {!isLoading && !error && identityStats && (
              <p className="mt-4 text-indigo-100 text-base sm:text-lg">
                Verified Entries:{" "}
                <span className="font-bold">
                  {identityStats.verified_entries}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 text-center mb-12">
            How to Use ComicCoin Digital Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Custom Card 1: Search */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
                <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Search</h3>
              <p className="text-gray-700 mb-6">
                Look up wallet addresses or search for organizations and
                individuals on the ComicCoin network
              </p>
              <button
                onClick={() => navigate("/search")}
                className="text-purple-600 font-bold flex items-center hover:text-purple-700 transition-colors"
              >
                Try Searching
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Custom Card 2: Verify */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Verify</h3>
              <p className="text-gray-700 mb-6">
                Confirm the identity of organizations and individuals before
                sending ComicCoins
              </p>
              <Link
                to="/verification"
                className="text-purple-600 font-bold flex items-center hover:text-purple-700 transition-colors"
              >
                Learn About Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Custom Card 3: Register */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">
                Register
              </h3>
              <p className="text-gray-700 mb-6">
                Register your own identity or organization on the ComicCoin
                Digital Identity system
              </p>
              <p className="text-sm text-gray-500 italic mb-6">
                Create a trusted presence on the blockchain.
              </p>
              <Link
                to="/register-name"
                className="text-purple-600 font-bold flex items-center hover:text-purple-700 transition-colors"
              >
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started with ComicCoin Digital Identity?
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Start exploring or join thousands of verified users and
              organizations on the ComicCoin blockchain.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                to="/get-started"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg group"
              >
                <PlayCircle className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Get Started
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-purple-800 bg-opacity-50 text-white border border-purple-300 rounded-xl font-bold hover:bg-opacity-75 transition-colors shadow-lg group"
              >
                <Search className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Search Identity Registry
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 text-center mb-12">
            Digital Identity Use Cases
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Retail Use Case */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800">
                  For Retailers
                </h3>
              </div>
              <p className="text-gray-700">
                Establish a verified presence on the blockchain so customers can
                confirm they're sending ComicCoins to the right business.
              </p>
            </div>

            {/* Individual Use Case */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800">
                  For Individuals
                </h3>
              </div>
              <p className="text-gray-700">
                Create a verified identity on the ComicCoin blockchain to
                receive payments with confidence and build trust.
              </p>
            </div>

            {/* Security Use Case */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800">
                  For Security
                </h3>
              </div>
              <p className="text-gray-700">
                Prevent fraud and scams by verifying the legitimacy of wallet
                addresses before sending ComicCoins.
              </p>
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-purple-800 text-center sm:text-left">
              About ComicCoin Digital Identity
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="mt-1 flex-shrink-0 bg-purple-100 p-3 rounded-full">
                <Globe className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <p className="text-gray-700 sm:text-lg leading-relaxed max-w-5xl text-center sm:text-left">
                The ComicCoin Digital Identity system creates a secure link
                between blockchain wallet addresses and real-world identities.
                Our system allows users to confidently identify who they're
                transacting with, promoting trust and security in the ComicCoin
                ecosystem. Every registered entry undergoes a verification
                process, creating an authentic directory of individuals and
                organizations on the blockchain.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer component */}
      <Footer
        isLoading={isLoading}
        error={error}
        nameServiceStats={identityStats}
      />
    </div>
  );
};

export default withRedirectAuthenticated(IndexPage);
