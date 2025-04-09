// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import IndexPage from "./pages/Index/Page";
import PublicWalletDirectoryPage from "./pages/PublicWalletDirectory/ListPage";
import GetStartedPage from "./pages/Gateway/GetStartedPage";
import LoginPage from "./pages/Gateway/LoginPage";
import ForgotPasswordPage from "./pages/Gateway/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Gateway/ResetPasswordPage";
import RegisterPage from "./pages/Gateway/RegisterPage";
import RegistrationSuccessPage from "./pages/Gateway/RegistrationSuccessPage";
import EmailVerificationPage from "./pages/Gateway/EmailVerificationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/Dashboard/Page";
import PublicWalletListPage from "./pages/PublicWallet/ListPage";
import PublicWalletAddPage from "./pages/PublicWallet/AddPage";
import PublicWalletDetailsPage from "./pages/PublicWallet/DetailsPage";
import PublicWalletUpdatePage from "./pages/PublicWallet/UpdatePage";
import VerificationLaunchpadPage from "./pages/Verification/LaunchpadPage";
import VerificationIndividualPage from "./pages/Verification/IndividualPage";
import VerificationBusinessPage from "./pages/Verification/BusinessPage";
import VerificationRejectedPage from "./pages/Verification/RejectedPage";
import VerificationApprovedPage from "./pages/Verification/ApprovedPage";
import VerificationPendingPage from "./pages/Verification/PendingPage";
import MorePage from "./pages/More/Page";
import DeleteAccountPage from "./pages/More/DeleteAccountPage";
import SettingsPage from "./pages/More/SettingsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 unauthorized as our interceptors handle that
        if (error?.response?.status === 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 30000, // Data is fresh for 30 seconds
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  console.log("🚀 App component initializing");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/directory" element={<PublicWalletDirectoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/verify" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route
              path="/register-success"
              element={<RegistrationSuccessPage />}
            />

            {/* User Verification Routes */}
            <Route
              path="/verification"
              element={
                <ProtectedRoute>
                  <VerificationLaunchpadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verification/individual"
              element={
                <ProtectedRoute>
                  <VerificationIndividualPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verification/business"
              element={
                <ProtectedRoute>
                  <VerificationBusinessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification/rejected"
              element={
                <ProtectedRoute>
                  <VerificationRejectedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification/approved"
              element={
                <ProtectedRoute>
                  <VerificationApprovedPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verification/pending"
              element={
                <ProtectedRoute>
                  <VerificationPendingPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/public-wallets"
              element={
                <ProtectedRoute>
                  <PublicWalletListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/public-wallets/add"
              element={
                <ProtectedRoute>
                  <PublicWalletAddPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/public-wallet/:address"
              element={
                <ProtectedRoute>
                  <PublicWalletDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/public-wallet/:address/edit"
              element={
                <ProtectedRoute>
                  <PublicWalletUpdatePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/more"
              element={
                <ProtectedRoute>
                  <MorePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/delete-account"
              element={
                <ProtectedRoute>
                  <DeleteAccountPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpAndSupportPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect to dashboard if authenticated, else to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
