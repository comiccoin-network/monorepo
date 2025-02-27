import { BrowserRouter as Router, Routes, Route } from 'react-router';

// Import the new NotFoundPage
import NotFoundPage from './pages/NotFoundPage';

// Layout
import InitializationLayout from "./layouts/InitializationLayout";
import MainLayout from "./layouts/MainLayout";

// Public pages
import FaucetPage from './pages/FaucetPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import GetStartedPage from './pages/GetStartedPage';
import RegisterCallPage from './pages/RegisterCallPage';
import RegisterCancelPage from './pages/RegisterCancelPage';
import LoginCallPage from './pages/LoginCallPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Protected pages (already wrapped with withAuth HOC)
import DashboardPage from "./pages/DashboardPage";
import AddWalletAddressPage from "./pages/AddWalletAddressPage";
import TransactionsPage from './pages/TransactionPage';
import ClaimCoinsPage from './pages/ClaimCoinsPage';
import SettingsPage from "./pages/SettingsPage";
import HelpAndSupportPage from "./pages/HelpAndSupportPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Unprotected routes */}
        <Route path="/" element={<FaucetPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/register-call" element={<RegisterCallPage />} />
        <Route path="/register-canceled" element={<RegisterCancelPage />} />
        <Route path="/login-call" element={<LoginCallPage />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        {/* User initialization flow with restricted layout */}
        <Route path="/user-initialization" element={<InitializationLayout />}>
          <Route path="add-my-wallet-address" element={<AddWalletAddressPage />} />
        </Route>

        {/* Protected routes with layout */}
        <Route path="/user" element={<MainLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="claim-coins" element={<ClaimCoinsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help-and-support" element={<HelpAndSupportPage />} />
        </Route>

        {/* 404 Not Found Route (must be the last route) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
