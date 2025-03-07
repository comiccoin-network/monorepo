// app/(tabs-more)/delete-account.jsx
import React from "react";
import withWallet from "../../hocs/withWallet";
import DeleteAccountScreen from "../../screens/DeleteAccountScreen";

const ProtectedDeleteAccountScreen = withWallet(DeleteAccountScreen);

export default function DeleteAccountPage() {
  return <ProtectedDeleteAccountScreen />;
}
