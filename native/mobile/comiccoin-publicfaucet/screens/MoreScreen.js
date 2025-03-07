// screens/MoreScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");
const itemWidth = (width - 48) / 2; // 48 = padding (16) * 3 (left, middle, right)

const MoreScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const confirmSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: () => logout(),
        style: "destructive",
      },
    ]);
  };

  const confirmDeleteAccount = () => {
    router.push("/(tabs-more)/delete-account");
  };

  const handleSettingsPress = () => {
    router.push("/(tabs-more)/settings");
  };

  // Grid items data
  const gridItems = [
    {
      id: "settings",
      title: "Settings",
      icon: "settings-outline",
      color: "#8347FF",
      bgColor: "#F3F4FF",
      onPress: handleSettingsPress,
    },
    {
      id: "delete",
      title: "Delete Account",
      icon: "trash-outline",
      color: "#EF4444",
      bgColor: "#FEF2F2",
      onPress: confirmDeleteAccount,
    },
    {
      id: "logout",
      title: "Sign Out",
      icon: "log-out-outline",
      color: "#F59E0B",
      bgColor: "#FFF7ED",
      onPress: confirmSignOut,
    },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="More" />

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.gridContainer}>
          {gridItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.gridItem, { width: itemWidth }]}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.bgColor },
                ]}
              >
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>
                {item.id === "settings"
                  ? "Manage your preferences"
                  : item.id === "delete"
                    ? "Remove your account"
                    : "Log out from the app"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ComicCoin Faucet v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 ComicCoin Network</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 160,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  versionContainer: {
    marginTop: "auto",
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

export default MoreScreen;
