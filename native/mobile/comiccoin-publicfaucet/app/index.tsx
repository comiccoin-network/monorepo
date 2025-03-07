// app/index.tsx
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import GetStartedScreen from "../screens/GetStartedScreen";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

// Create a query client for React Query
const queryClient = new QueryClient();

// Simple wrapper component to handle the redirect logic
function AppInitializer() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // User is already logged in, redirect to dashboard
      console.log("User already logged in, redirecting to dashboard...");
      router.replace("/(tabs)/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8347FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated or still loading, show the GetStarted screen
  return <GetStartedScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppInitializer />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
});
