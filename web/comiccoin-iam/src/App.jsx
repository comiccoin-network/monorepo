// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import IndexPage from "./pages/IndexPage";
import SearchPage from "./pages/SearchPage";
import GetStartedPage from "./pages/GetStartedPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import AddWalletAddressPage from "./pages/AddWalletAddressPage"; //TODO: REMOVE
import VerificationStartPage from "./pages/VerificationStartPage";
import VerificationRejectedPage from "./pages/VerificationRejectedPage";
import VerificationPendingPage from "./pages/VerificationPendingPage";
import ClaimCoinsPage from "./pages/ClaimCoinsPage";
import TransactionsPage from "./pages/TransactionsPage";
import MorePage from "./pages/MorePage";
import DeleteAccountPage from "./pages/DeleteAccountPage";
import SettingsPage from "./pages/SettingsPage";
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
            <Route path="/search" element={<SearchPage />} />
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

            {/* User Initialization Routes */}
            <Route
              path="/user-initialization/add-my-wallet-address"
              element={
                <ProtectedRoute>
                  <AddWalletAddressPage />
                </ProtectedRoute>
              }
            />

            {/* User Verification Routes */}
            <Route
              path="/verification/start"
              element={
                <ProtectedRoute>
                  <VerificationStartPage />
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
              path="/claim-coins"
              element={
                <ProtectedRoute>
                  <ClaimCoinsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
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
