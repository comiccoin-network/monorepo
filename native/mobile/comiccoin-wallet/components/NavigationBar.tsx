// monorepo/native/mobile/comiccoin-wallet/components/NavigationBar.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { LogOut } from "lucide-react-native";

interface NavigationBarProps {
  onSignOut: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onSignOut }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ComicCoin</Text>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={onSignOut}
          accessibilityLabel="Sign out"
        >
          <LogOut size={20} color="#6B7280" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7C3AED",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default NavigationBar;
