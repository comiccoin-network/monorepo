import { React, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";

import DashboardPage from "./Components/User/Dashboard/View";
import LoginPage from "./Components/Gateway/Login/View";
import AccessExistingWalletPage from "./Components/Gateway/AccessExistingWallet";
import CreateFirstWalletPage from "./Components/Gateway/CreateFirstWallet";
import DownloadNativeWalletPage from "./Components/Gateway/DownloadNativeWallet";
import GetStartedPage from "./Components/Gateway/GettingStarted";
import Index from "./Components/Gateway/Index";
import Terms from "./Components/Gateway/Terms";
import Privacy from "./Components/Gateway/Privacy";
import NotImplementedError from "./Components/Misc/NotImplementedError";
import NotFoundError from "./Components/Misc/NotFoundError";

// //-----------------//
// //    App Routes   //
// //-----------------//

function AppRoute() {
  return (
    <div>
      <RecoilRoot>
        <Router>
          <Routes>
            <Route exact path="/dashboard" element={<DashboardPage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/access-existing-wallet" element={<AccessExistingWalletPage />} />
            <Route exact path="/create-first-wallet" element={<CreateFirstWalletPage />} />
            <Route exact path="/download-native-wallet" element={<DownloadNativeWalletPage />} />
            <Route exact path="/get-started" element={<GetStartedPage />} />
            <Route exact path="/" element={<Index />} />
            <Route path="*" element={<NotFoundError />} />
          </Routes>
        </Router>
      </RecoilRoot>
    </div>
  );
}

export default AppRoute;
