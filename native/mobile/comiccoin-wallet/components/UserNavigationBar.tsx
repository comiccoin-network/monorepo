// monorepo/native/mobile/comiccoin-wallet/components/UserNavigationBar.tsx
import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { Share2, Wallet } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWallet } from "../hooks/useWallet";

// Define the navigation types for type safety
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  // Add other routes as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Component props type definition
interface UserNavigationBarProps {
  // We don't need onSignOut prop anymore as we're handling it internally
}

const UserNavigationBar: React.FC<UserNavigationBarProps> = () => {
  // Hooks for navigation and safe area
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // Get wallet functionality from the hook
  const { logout, loading: serviceLoading, error: serviceError } = useWallet();

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      // First attempt to logout using the wallet service
      await logout();

      // If successful, navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      // Log the error for debugging
      console.log("Sign out failed:", error);

      // You might want to show an error message to the user here
      // For now, still attempt to navigate to login for safety
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [logout, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Wallet color="#fff" size={24} style={styles.logoIcon} />
          <Text style={styles.logoText}>ComicCoin Wallet</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#7e22ce", // purple-700
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    marginRight: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  signOutButton: {
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  signOutText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
});

export default UserNavigationBar;
