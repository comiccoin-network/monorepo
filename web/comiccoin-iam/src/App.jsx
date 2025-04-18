// monorepo/web/comiccoin-iam/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Common
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Anonymous
import IndexPage from "./pages/Anonymous/Index/Page";
import TermsPage from "./pages/Anonymous/TermsPage";
import PrivacyPage from "./pages/Anonymous/PrivacyPage";
import HelpAndSupportPage from "./pages/Anonymous/HelpAndSupportPage";
import PublicWalletDirectoryListPage from "./pages/Anonymous/PublicWalletDirectory/ListPage";
import PublicWalletDirectoryDetailPage from "./pages/Anonymous/PublicWalletDirectory/DetailPage";
import GetStartedPage from "./pages/Anonymous/Gateway/GetStartedPage";
import LoginPage from "./pages/Anonymous/Gateway/LoginPage";
import ForgotPasswordPage from "./pages/Anonymous/Gateway/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Anonymous/Gateway/ResetPasswordPage";
import RegisterPage from "./pages/Anonymous/Gateway/RegisterPage";
import RegistrationSuccessPage from "./pages/Anonymous/Gateway/RegistrationSuccessPage";
import EmailVerificationPage from "./pages/Anonymous/Gateway/EmailVerificationPage";

// User
import VerificationLaunchpadPage from "./pages/Individual/Verification/LaunchpadPage";
import VerificationIndividualPage from "./pages/Individual/Verification/IndividualPage";
import VerificationBusinessPage from "./pages/Individual/Verification/BusinessPage";
import VerificationRejectedPage from "./pages/Individual/Verification/RejectedPage";
import VerificationApprovedPage from "./pages/Individual/Verification/ApprovedPage";
import VerificationPendingPage from "./pages/Individual/Verification/PendingPage";
import UserDashboardPage from "./pages/Individual/Dashboard/Page";
import UserMorePage from "./pages/Individual/More/Page";
import UserDeleteAccountPage from "./pages/Individual/More/DeleteAccountPage";
import UserSettingsPage from "./pages/Individual/More/SettingsPage";
import PublicWalletListPage from "./pages/Individual/PublicWallet/ListPage";
import PublicWalletAddPage from "./pages/Individual/PublicWallet/AddPage";
import PublicWalletDetailsPage from "./pages/Individual/PublicWallet/DetailsPage";
import PublicWalletUpdatePage from "./pages/Individual/PublicWallet/UpdatePage";

// Admin
import AdminDashboardPage from "./pages/Admin/Dashboard/Page";
import UserListPage from "./pages/Admin/UserManagement/ListPage";
import UserDetailsPage from "./pages/Admin/UserManagement/DetailsPage";
import AdminUserPublicWalletUpdatePage from "./pages/Admin/UserManagement/PublicWallet/UpdatePage";
import AdminUpdateUserPage from "./pages/Admin/UserManagement/UpdatePage";
import AdminAddWalletPage from "./pages/Admin/UserManagement/PublicWallet/AddPage";
import AdminUserPublicWalletDeletePage from "./pages/Admin/UserManagement/PublicWallet/DeletePage";
import AdminMorePage from "./pages/Admin/More/Page";
import AdminSettingsPage from "./pages/Admin/More/SettingsPage";
import AdminPublicWalletListPage from "./pages/Admin/PublicWallet/ListPage";
import AdminPublicWalletDetailPage from "./pages/Admin/PublicWallet/DetailPage";
import AdminPublicWalletUpdatePage from "./pages/Admin/PublicWallet/UpdatePage";

import UserAddStep0 from "./pages/Admin/UserManagement/Add/UserAddStep0";
import UserAddStep1 from "./pages/Admin/UserManagement/Add/UserAddStep1";
import UserAddStep2Admin from "./pages/Admin/UserManagement/Add/UserAddStep2Admin";
import UserAddStep2Business from "./pages/Admin/UserManagement/Add/UserAddStep2Business";
import UserAddStep2Individual from "./pages/Admin/UserManagement/Add/UserAddStep2Individual";
import UserAddStep3 from "./pages/Admin/UserManagement/Add/UserAddStep3";

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
              path="/admin/users/add/init"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddStep0 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add/role"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddStep1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add/details/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddStep2Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add/details/business"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddStep2Business />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add/details/individual"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddStep2Individual />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add/review"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAddStep3 />
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
              path="/admin/users/:userId/add-wallet"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminAddWalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId/wallet/:address/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUserPublicWalletUpdatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId/wallet/:address/delete"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUserPublicWalletDeletePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/public-wallets"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPublicWalletListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/public-wallets/:address"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPublicWalletDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/public-wallets/:address/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPublicWalletUpdatePage />
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
