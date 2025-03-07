// app/(tabs)/dashboard.tsx
import React from "react";

import withWallet from "../../components/withWallet";
import DashboardScreen from "../../screens/DashboardScreen";

const ProtectedDashboardScreen = withWallet(DashboardScreen);

export default function DashboardPage() {
  return <ProtectedDashboardScreen />;
}
