// app/index.tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import GetStartedScreen from "../screens/GetStartedScreen";

// Create a query client for React Query
const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GetStartedScreen />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
