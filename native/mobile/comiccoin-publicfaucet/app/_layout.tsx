// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import InternetProvider from "../providers/InternetProvider";

// Create a query client for React Query
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <InternetProvider>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false, // Hide the default header
                contentStyle: { backgroundColor: "#f5f3ff" },
                animation: "slide_from_right", // Add smooth transitions
              }}
            >
              <Stack.Screen
                name="index"
                options={{ title: "ComicCoin Faucet" }}
              />
              <Stack.Screen
                name="register"
                options={{
                  title: "Register",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  title: "Login",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="terms"
                options={{
                  title: "Terms of Service",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="privacy"
                options={{
                  title: "Privacy Policy",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="help"
                options={{
                  title: "Help & Support",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="register-success"
                options={{
                  title: "Registration Success",
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          </AuthProvider>
        </InternetProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
