// app/(tabs-more)/settings.tsx
import React from "react";
import withWallet from "../../hocs/withWallet";
import SettingsScreen from "../../screens/SettingsScreen";

const ProtectedSettingsScreen = withWallet(SettingsScreen);

export default function SettingsPage() {
  return <ProtectedSettingsScreen />;
}
