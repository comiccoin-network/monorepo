// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router';

// Layout
import MainLayout from "./layouts/MainLayout";

// Public pages
import FaucetPage from './pages/FaucetPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import GetStartedPage from './pages/GetStartedPage';
import RegisterCallPage from './pages/RegisterCallPage';
import LoginCallPage from './pages/LoginCallPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Protected pages (already wrapped with withAuth HOC)
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FaucetPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/register-call" element={<RegisterCallPage />} />
        <Route path="/login-call" element={<LoginCallPage />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />

        {/* Protected routes with layout */}
        <Route path="/user" element={<MainLayout />}>
          {/* Dashboard page (wrapped with withAuth in its own file) */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Settings page (wrapped with withAuth in its own file) */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
