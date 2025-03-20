// monorepo/web/comiccoin-iam/src/pages/VerificationStartPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/IndexPage/Header";
import Footer from "../components/IndexPage/Footer";

const VerificationStartPage = () => {
  const navigate = useNavigate();

  const [identityStats, setIdentityStats] = useState({
    registered_entries: 8750,
    verified_entries: 6423,
    daily_lookups: 4250,
  });
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-100 to-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-purple-600 focus:text-white focus:z-50"
      >
        Skip to main content
      </a>

      <Header showButton={false} showBackButton={false} />

      <h1>VERIFICATION STARTUP</h1>
      <Footer isLoading={isLoading} nameServiceStats={identityStats} />
    </div>
  );
};

export default VerificationStartPage;
