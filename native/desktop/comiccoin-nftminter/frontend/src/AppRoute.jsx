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
import MintingWizardStep2View from "./Components/MintingWizard/Step2View";
import MintingWizardStep3View from "./Components/MintingWizard/Step3View";
import MintingWizardSubmittingView from "./Components/MintingWizard/SubmittingView";


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
              path="/minting-wizard-step1"
              element={<MintingWizardStep1View />}
              exact
            />
            <Route
              path="/minting-wizard-step2"
              element={<MintingWizardStep2View />}
              exact
            />
            <Route
              path="/minting-wizard-step3"
              element={<MintingWizardStep3View />}
              exact
            />
            <Route
              path="/minting-wizard-step3-submitting"
              element={<MintingWizardSubmittingView />}
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
