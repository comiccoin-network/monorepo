import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";

// MENU
import Topbar from "./Components/Menu/Top";

// CORE VIEWS
import InitializeView from "./Components/OnAppStart/InitializeView";
import NotFoundErrorView from "./Components/Other/NotFoundErrorView";
import PickDataDirectoryView from "./Components/OnAppStart/PickDataDirectoryView";
import StartupView from "./Components/OnAppStart/StartupView";
import SetupNFTStorageView from "./Components/OnAppStart/SetupNFTStorageView";
import SetupAuthorityView from "./Components/OnAppStart/SetupAuthorityView";
import LaunchpadView from "./Components/Launchpad/View";
import MintingWizardStep1View from "./Components/MintingWizard/Step1View";


function AppRoute() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RecoilRoot>
        <HashRouter basename={"/"}>
          {/* <TopAlertBanner /> */}

          {/* Top Navigation */}
          <Topbar />

          <Routes>
            <Route path="/" element={<InitializeView />} exact />
            <Route
              path="/pick-data-directory"
              element={<PickDataDirectoryView />}
              exact
            />
            <Route path="/startup" element={<StartupView />} exact />
            <Route
              path="/setup-nft-storage"
              element={<SetupNFTStorageView />}
              exact
            />
            <Route
              path="/setup-authority"
              element={<SetupAuthorityView />}
              exact
            />
            <Route
              path="/launchpad"
              element={<LaunchpadView />}
              exact
            />
            <Route
              path="/mint-wizard/step-1"
              element={<MintingWizardStep1View />}
              exact
            />
            <Route path="*" element={<NotFoundErrorView />} />
          </Routes>

          {/* Bottom Navigation */}
          {/*BottomTabBar />*/}
        </HashRouter>
      </RecoilRoot>
    </div>
  );
}

export default AppRoute;
