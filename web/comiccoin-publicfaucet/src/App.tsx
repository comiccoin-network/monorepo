import { BrowserRouter as Router, Routes, Route } from 'react-router';
import FaucetPage from './pages/FaucetPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FaucetPage />} />
        <Route path="/get-started" element={<div>Get Started Page</div>} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
