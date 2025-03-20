// src/pages/DashboardPage.jsx
import { AlertCircle } from "lucide-react";
import AppTopNavigation from "../components/AppTopNavigation";
import AppFooter from "../components/AppFooter";
import withProfileVerification from "../components/withProfileVerification";

function DashboardPage({ error, dashboardData, refetch }) {
  // Main dashboard UI
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <AppTopNavigation />

      <main id="main-content" className="flex-grow">
        <h1>DASHBOARD</h1>
      </main>

      <AppFooter />
    </div>
  );
}

export default withProfileVerification(DashboardPage);
