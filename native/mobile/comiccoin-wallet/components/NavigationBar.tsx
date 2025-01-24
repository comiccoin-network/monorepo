// monorepo/native/mobile/comiccoin-wallet/components/NavigationBar.tsx
import React from "react";
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

interface NavigationBarProps {
  onSignOut: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onSignOut }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Wallet color="#fff" size={24} style={styles.logoIcon} />
          <Text style={styles.logoText}>ComicCoin</Text>
        </View>

        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={onSignOut}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
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

export default NavigationBar;
