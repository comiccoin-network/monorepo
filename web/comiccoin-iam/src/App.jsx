// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import IndexPage from "./pages/Index/Page";
import PublicWalletDirectoryListPage from "./pages/PublicWalletDirectory/ListPage";
import PublicWalletDirectoryDetailPage from "./pages/PublicWalletDirectory/DetailPage";
import GetStartedPage from "./pages/Gateway/GetStartedPage";
import LoginPage from "./pages/Gateway/LoginPage";
import ForgotPasswordPage from "./pages/Gateway/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Gateway/ResetPasswordPage";
import RegisterPage from "./pages/Gateway/RegisterPage";
import RegistrationSuccessPage from "./pages/Gateway/RegistrationSuccessPage";
import EmailVerificationPage from "./pages/Gateway/EmailVerificationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import VerificationLaunchpadPage from "./pages/Verification/LaunchpadPage";
import VerificationIndividualPage from "./pages/Verification/IndividualPage";
import VerificationBusinessPage from "./pages/Verification/BusinessPage";
import VerificationRejectedPage from "./pages/Verification/RejectedPage";
import VerificationApprovedPage from "./pages/Verification/ApprovedPage";
import VerificationPendingPage from "./pages/Verification/PendingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";

// User
import UserDashboardPage from "./pages/User/Dashboard/Page";
import UserMorePage from "./pages/User/More/Page";
import UserDeleteAccountPage from "./pages/User/More/DeleteAccountPage";
import UserSettingsPage from "./pages/User/More/SettingsPage";
import PublicWalletListPage from "./pages/User/PublicWallet/ListPage";
import PublicWalletAddPage from "./pages/User/PublicWallet/AddPage";
import PublicWalletDetailsPage from "./pages/User/PublicWallet/DetailsPage";
import PublicWalletUpdatePage from "./pages/User/PublicWallet/UpdatePage";

// Admin
// Dashboard
import AdminDashboardPage from "./pages/Admin/Dashboard/Page";
// User Management Pages
import UserListPage from "./pages/Admin/UserManagement/ListPage";
import UserDetailsPage from "./pages/Admin/UserManagement/DetailsPage";
import UserAddPage from "./pages/Admin/UserManagement/AddPage";
import AdminUpdateUserPage from "./pages/Admin/UserManagement/UpdatePage";
import AdminAddWalletPage from "./pages/Admin/UserManagement/AddWalletPage";

// More
import AdminMorePage from "./pages/Admin/More/Page";
import AdminDeleteAccountPage from "./pages/Admin/More/DeleteAccountPage";
import AdminSettingsPage from "./pages/Admin/More/SettingsPage";

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
            <Route
              path="/directory"
              element={<PublicWalletDirectoryListPage />}
            />
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

            <Route
              path="/directory"
              element={<PublicWalletDirectoryListPage />}
            />

            <Route
              path="/directory/:address"
              element={<PublicWalletDirectoryDetailPage />}
            />

            {/* Protected Routes */}

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

            {/* ------ User ------ */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboardPage />
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
                  <UserMorePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/delete-account"
              element={
                <ProtectedRoute>
                  <UserDeleteAccountPage />
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

            {/* ------ Admin ------ */}

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUpdateUserPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id/add-wallet"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddWalletPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/more"
              element={
                <ProtectedRoute>
                  <AdminMorePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/delete-account"
              element={
                <ProtectedRoute>
                  <AdminDeleteAccountPage />
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
