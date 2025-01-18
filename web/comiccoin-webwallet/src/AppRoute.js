import { React, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RecoilRoot } from "recoil";

import TransactionDetailPage from "./Components/User/More/Transaction/DetailView";
import TransactionListPage from "./Components/User/More/Transaction/ListView";
import MorePage from "./Components/User/More/View";
import BurnNFTPage from "./Components/User/NFT/Burn/View";
import TransferNFTPage from "./Components/User/NFT/Transfer/View";
import NFTDetailPage from "./Components/User/NFT/Detail/View";
import NFTListPage from "./Components/User/NFT/List/View";
import TradePage from "./Components/User/Trade/View";
import ReceiveCoin from "./Components/User/ReceiveCoin/View";
import SendCoinsPage from "./Components/User/SendCoin/View";
import DashboardPage from "./Components/User/Dashboard/View";
import LoginHDWalletPage from "./Components/Gateway/LoginHDWallet/View";
import RecoverHDWalletPage from "./Components/Gateway/RecoverHDWallet/View";
import CreateHDWalletPage from "./Components/Gateway/CreateHDWallet/View";
import DownloadNativeWalletPage from "./Components/Gateway/DownloadNativeWallet/View";
import GetStartedPage from "./Components/Gateway/GettingStarted/View";
import Index from "./Components/Gateway/Index/View";
import Terms from "./Components/Gateway/TOS/View";
import Privacy from "./Components/Gateway/Privacy/View";
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
            <Route exact path="/transaction/:nonceString" element={<TransactionDetailPage />} />
            <Route exact path="/transactions" element={<TransactionListPage />} />
            <Route exact path="/more" element={<MorePage />} />
            <Route exact path="/nft/burn" element={<BurnNFTPage />} />
            <Route exact path="/nft/transfer" element={<TransferNFTPage />} />
            <Route exact path="/nfts" element={<NFTListPage />} />
            <Route exact path="/nft" element={<NFTDetailPage />} />
            <Route exact path="/trade" element={<TradePage />} />
            <Route exact path="/receive-coins" element={<ReceiveCoin />} />
            <Route exact path="/send-coins" element={<SendCoinsPage />} />
            <Route exact path="/dashboard" element={<DashboardPage />} />
            <Route exact path="/login" element={<LoginHDWalletPage />} />
            <Route exact path="/recover" element={<RecoverHDWalletPage />} />
            <Route exact path="/create-wallet" element={<CreateHDWalletPage />} />
            <Route exact path="/download-native-wallet" element={<DownloadNativeWalletPage />} />
            <Route exact path="/get-started" element={<GetStartedPage />} />
            <Route exact path="/privacy" element={<Privacy />} />
            <Route exact path="/terms" element={<Terms />} />
            <Route exact path="/" element={<Index />} />
            <Route path="*" element={<NotFoundError />} />
          </Routes>
        </Router>
      </RecoilRoot>
    </div>
  );
}

export default AppRoute;
