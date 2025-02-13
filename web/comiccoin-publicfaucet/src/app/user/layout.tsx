// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import AuthRequired from "@/components/AuthRequired";
import {
  Coins,
  Home,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Wallet,
} from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useAuthStore } from "@/hooks/useAuth";

// Navigation items configuration
const navigationItems = [
  {
    name: "Dashboard",
    href: "/user/dashboard",
    icon: Home,
    description: "View your overview and recent activity",
  },
  {
    name: "Claim History",
    href: "/user/transactions",
    icon: History,
    description: "View your claim history",
  },
  {
    name: "My Wallet",
    href: "/user/wallet",
    icon: Wallet,
    description: "Manage your wallet settings",
  },
  {
    name: "Settings",
    href: "/user/settings",
    icon: Settings,
    description: "Manage your account settings",
  },
  {
    name: "Help & Support",
    href: "/user/help",
    icon: HelpCircle,
    description: "Get help and support",
  },
];

function UserLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useMe();
  const { signOut } = useAuthStore();

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Navigation link component for reuse
  const NavLink = ({ item, isMobile = false }) => {
    const isActive = pathname === item.href;
    const baseClasses = `group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium transition-colors`;
    const mobileClasses = isMobile ? "text-base" : "";
    const activeClasses = isActive
      ? "bg-purple-50 text-purple-600"
      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600";

    return (
      <Link
        href={item.href}
        className={`${baseClasses} ${mobileClasses} ${activeClasses}`}
      >
        <item.icon
          className={`h-5 w-5 flex-shrink-0 ${
            isActive
              ? "text-purple-600"
              : "text-gray-400 group-hover:text-purple-600"
          }`}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <AuthRequired>
      <div className="min-h-screen bg-purple-50">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 z-40 w-full bg-white border-b border-purple-100">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 text-gray-500 hover:text-gray-600 focus:outline-none"
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
                <span className="ml-2 text-xl font-bold text-purple-800">
                  ComicCoin Faucet
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <button className="p-1 text-gray-500 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <div className="hidden lg:flex lg:flex-col lg:items-end mr-4">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.walletAddress
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : ""}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white">
              <div className="flex h-full flex-col overflow-y-auto pt-16">
                <nav className="flex-1 space-y-1 px-4 py-4">
                  {navigationItems.map((item) => (
                    <NavLink key={item.name} item={item} isMobile />
                  ))}
                </nav>
                <div className="border-t border-gray-200 p-4">
                  <button
                    onClick={signOut}
                    className="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                  >
                    <LogOut className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex grow flex-col overflow-y-auto border-r border-purple-100 bg-white pt-16">
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigationItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={signOut}
                className="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600"
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-64">
          <main className="py-16">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthRequired>
  );
}

export default UserLayout;
