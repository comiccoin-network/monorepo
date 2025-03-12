// app/(tabs-dashboard)/claim.tsx
import React from "react";
import withWallet from "../../hocs/withWallet";
import ClaimScreen from "../../screens/ClaimScreen";

const ProtectedClaimScreen = withWallet(ClaimScreen);

export default function ClaimPage() {
  return <ProtectedClaimScreen />;
}
