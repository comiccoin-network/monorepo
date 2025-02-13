// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useMe } from "@/hooks/useMe";
import {
  Coins,
  Home,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigation configuration
const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Request Coins", href: "/user/request", icon: Coins },
  { name: "Transaction History", href: "/user/transactions", icon: History },
  { name: "Settings", href: "/user/settings", icon: Settings },
  { name: "Help & Support", href: "/user/help", icon: HelpCircle },
];

function UserLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useMe();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 z-40 w-full bg-white border-b border-purple-100">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left side - Logo and menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden text-gray-500 hover:text-gray-600 p-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <div className="flex items-center ml-4 lg:ml-0">
              <Coins className="h-8 w-8 text-purple-600" />
              <span
                className="ml-2 text-xl font-bold text-purple-800"
                style={{ fontFamily: "Comic Sans MS" }}
              >
                ComicCoin
              </span>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-600">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="mr-4 hidden lg:flex lg:flex-col lg:items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </span>
                <span className="text-sm text-gray-500">
                  {user?.email || ""}
                </span>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-0 z-30 lg:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4 mt-16">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-purple-50 text-purple-600"
                          : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive
                            ? "text-purple-600"
                            : "text-gray-400 group-hover:text-purple-600"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  /* Add logout logic */
                }}
                className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-purple-100 bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-4 mt-16">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-purple-50 text-purple-600"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? "text-purple-600"
                          : "text-gray-400 group-hover:text-purple-600"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => {
                /* Add logout logic */
              }}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-600" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
