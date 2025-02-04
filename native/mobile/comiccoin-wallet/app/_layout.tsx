// monorepo/native/mobile/comiccoin-wallet/app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import InternetProvider from "../providers/InternetProvider";
import { WalletStreamProvider } from "../providers/WalletStreamProvider";
import { UserTransactionBanner } from "../components/UserTransactionBanner";

export default function RootLayout() {
  return (
    <InternetProvider>
      <WalletStreamProvider />
      <UserTransactionBanner />
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
