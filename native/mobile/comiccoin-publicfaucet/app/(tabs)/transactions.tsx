// app/(tabs)/transactions.tsx
import React from "react";

import withWallet from "../../hocs/withWallet";
import TransactionsScreen from "../../screens/TransactionsScreen";

const ProtectedTransactionsScreen = withWallet(TransactionsScreen);

export default function TransactionsPage() {
  return <ProtectedTransactionsScreen />;
}
