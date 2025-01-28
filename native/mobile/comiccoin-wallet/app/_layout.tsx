// monorepo/native/mobile/comiccoin-wallet/app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import InternetProvider from "../providers/InternetProvider";
import { BlockchainProvider } from "../contexts/BlockchainStateContext";

export default function RootLayout() {
  return (
    <InternetProvider>
      <BlockchainProvider chainId={1}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </BlockchainProvider>
    </InternetProvider>
  );
}
