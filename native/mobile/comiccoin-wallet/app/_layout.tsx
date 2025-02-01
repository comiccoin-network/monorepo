// monorepo/native/mobile/comiccoin-wallet/app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import InternetProvider from "../providers/InternetProvider";

export default function RootLayout() {
  return (
    <InternetProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </InternetProvider>
  );
}
