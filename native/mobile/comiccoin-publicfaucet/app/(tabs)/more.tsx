// app/(tabs)/more.tsx
import React from "react";

import withWallet from "../../hocs/withWallet";
import MoreScreen from "../../screens/MoreScreen";

const ProtectedMoreScreen = withWallet(MoreScreen);

export default function MorePage() {
  return <ProtectedMoreScreen />;
}
