"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  BookOpen,
  Camera,
  Gift,
  Github,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Footer from "@/components/Footer";

const IndexPage = () => {
  const router = useRouter();

  // Navigation handler
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav
        className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coins className="h-8 w-8" />
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "Comic Sans MS" }}
            >
              ComicCoin Faucet
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleNavigation("/register")}
              className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-white transition-colors"
            >
              Register
            </button>
            <button
              onClick={() => handleNavigation("/login")}
              className="px-4 py-2 rounded-lg bg-white hover:bg-purple-50 text-purple-700 font-bold transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-grow bg-gradient-to-b from-purple-100 to-white">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1
              className="text-6xl font-bold mb-6 text-purple-800"
              style={{ fontFamily: "Comic Sans MS" }}
            >
              Turn Your Comic Books Into Digital Gold!
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Welcome to the ComicCoin Faucet - where your passion for comics
              meets blockchain technology!
            </p>
          </div>

          {/* Jumbo Registration Box */}
          <div className="mb-16 bg-gradient-to-r from-purple-700 to-indigo-800 rounded-xl p-1">
            <div className="bg-white rounded-lg p-8 text-center">
              <h2
                className="text-3xl font-bold text-purple-800 mb-4"
                style={{ fontFamily: "Comic Sans MS" }}
              >
                Get Your Free ComicCoins Now! 🎉
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Join thousands of comic collectors who've already claimed their
                free ComicCoins. Register today and get instant rewards!
              </p>
              <div className="flex justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">1000+</p>
                  <p className="text-gray-600">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">50K+</p>
                  <p className="text-gray-600">Comics Registered</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">100K+</p>
                  <p className="text-gray-600">Coins Distributed</p>
                </div>
              </div>
              <button
                onClick={() => handleNavigation("/register")}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Start Collecting Now
              </button>
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature cards components would go here */}
            {featureCards.map((card, index) => (
              <FeatureCard key={index} {...card} />
            ))}
          </div>

          {/* About Section */}
          <section className="bg-white rounded-xl p-8 shadow-lg mb-16 border-2 border-purple-200">
            <h2
              className="text-3xl font-bold mb-6 text-purple-800"
              style={{ fontFamily: "Comic Sans MS" }}
            >
              About ComicCoin
            </h2>
            <div className="flex items-start space-x-4">
              <Github className="h-6 w-6 mt-1 flex-shrink-0 text-purple-600" />
              <p className="text-gray-700">
                ComicCoin is an open-source blockchain project utilizing a Proof
                of Authority consensus mechanism. This ensures fast, efficient,
                and environmentally friendly transactions while maintaining
                security and transparency. Our code is public, auditable, and
                community-driven.
              </p>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-16 border-2 border-purple-200 text-center">
            <h2
              className="text-3xl font-bold mb-4 text-purple-800"
              style={{ fontFamily: "Comic Sans MS" }}
            >
              Ready to Join the ComicCoin Community?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Don't miss out on your free ComicCoins. Join now and become part
              of the fastest-growing comic collector community!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleNavigation("/register")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                Register Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="https://comiccoinnetwork.com"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                Learn More
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

// Feature card type definition
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Feature card component
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-200 overflow-hidden p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-purple-100 rounded-lg">{icon}</div>
      <h2
        className="text-xl font-bold text-purple-800"
        style={{ fontFamily: "Comic Sans MS" }}
      >
        {title}
      </h2>
    </div>
    <p className="text-gray-700">{description}</p>
  </div>
);

// Feature cards data
const featureCards = [
  {
    icon: <Gift className="h-6 w-6 text-purple-600" />,
    title: "Free Starting Coins",
    description:
      "Register now and receive a one-time bonus of ComicCoins directly to your wallet! Perfect for newcomers to start their journey in the comic-collecting community.",
  },
  {
    icon: <Camera className="h-6 w-6 text-purple-600" />,
    title: "Submit & Earn",
    description:
      "Submit photos of your comic book collection and earn ComicCoins! Each verified submission adds more coins to your wallet, rewarding you for contributing to our community.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-purple-600" />,
    title: "More Ways to Earn",
    description:
      "Participate in community events, write reviews, validate submissions, and engage in various activities to earn additional ComicCoins. The more you contribute, the more you earn!",
  },
];

export default IndexPage;
