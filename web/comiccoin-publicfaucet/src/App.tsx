import { BrowserRouter as Router, Routes, Route } from 'react-router';
import FaucetPage from './pages/FaucetPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import GetStartedPage from './pages/GetStartedPage';
import RegisterCallPage from './pages/RegisterCallPage';
import LoginCallPage from './pages/LoginCallPage';

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
      </Routes>
    </Router>
  );
}

export default App;
