// src/Components/Gateway/Help/View.jsx
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Mail, Phone, MapPin, Globe, Monitor, Wallet } from 'lucide-react';
import NavigationMenu from "../NavigationMenu/View";
import FooterMenu from "../FooterMenu/View";

function HelpPage() {
    useEffect(() => {
        let mounted = true;

        if (mounted) {
            window.scrollTo(0, 0);
        }

        return () => {
            mounted = false;
        };
    }, []);
    
  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50">
          Skip to main content
        </a>

        {/* Navigation */}
        <NavigationMenu />

      <main id="main-content" className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Scale className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Help</h1>
          </div>

          <div className="space-y-8 text-gray-700">
            <b>TODO</b>


          </div>
        </div>

        <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </main>

      <FooterMenu />
    </div>
  );
}

export default HelpPage;
