// monorepo/native/mobile/comiccoin-wallet/app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import InternetProvider from "../providers/InternetProvider";
import { WalletStreamProvider } from "../providers/WalletStreamProvider";
import { TransactionNotificationHandler } from "../components/TransactionNotificationHandler";

export default function RootLayout() {
  return (
    <InternetProvider>
      <WalletStreamProvider />
      <TransactionNotificationHandler />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      ></Stack>
    </InternetProvider>
  );
}
