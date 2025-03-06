import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const FooterNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine which screen is active
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <View style={styles.container}>
      {/* Dashboard Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push("/(tabs)/dashboard")}
        accessibilityRole="button"
        accessibilityLabel="Dashboard"
        accessibilityState={{ selected: isActive("/(tabs)/dashboard") }}
      >
        <Ionicons
          name={isActive("/(tabs)/dashboard") ? "home" : "home-outline"}
          size={24}
          color={isActive("/(tabs)/dashboard") ? "#8347FF" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            isActive("/(tabs)/dashboard") && styles.activeTabLabel,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Transactions Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push("/transactions")}
        accessibilityRole="button"
        accessibilityLabel="Transactions"
        accessibilityState={{ selected: isActive("/transactions") }}
      >
        <Ionicons
          name={isActive("/transactions") ? "list" : "list-outline"}
          size={24}
          color={isActive("/transactions") ? "#8347FF" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            isActive("/transactions") && styles.activeTabLabel,
          ]}
        >
          History
        </Text>
      </TouchableOpacity>

      {/* Claim Button (Center) */}
      <TouchableOpacity
        style={styles.claimButton}
        onPress={() => router.push("/claim")}
        accessibilityRole="button"
        accessibilityLabel="Claim Coins"
      >
        <View style={styles.claimButtonInner}>
          <Ionicons name="cash" size={24} color="white" />
        </View>
        <Text style={styles.claimLabel}>Claim</Text>
      </TouchableOpacity>

      {/* Wallet Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push("/wallet")}
        accessibilityRole="button"
        accessibilityLabel="Wallet"
        accessibilityState={{ selected: isActive("/wallet") }}
      >
        <Ionicons
          name={isActive("/wallet") ? "wallet" : "wallet-outline"}
          size={24}
          color={isActive("/wallet") ? "#8347FF" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            isActive("/wallet") && styles.activeTabLabel,
          ]}
        >
          Wallet
        </Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => router.push("/settings")}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        accessibilityState={{ selected: isActive("/settings") }}
      >
        <Ionicons
          name={isActive("/settings") ? "settings" : "settings-outline"}
          size={24}
          color={isActive("/settings") ? "#8347FF" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            isActive("/settings") && styles.activeTabLabel,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
    paddingHorizontal: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: "#9CA3AF",
  },
  activeTabLabel: {
    color: "#8347FF",
    fontWeight: "500",
  },
  claimButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15, // To account for the button extending upward
  },
  claimButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8347FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8347FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginTop: -20, // Push button up for half-circle effect
  },
  claimLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#8347FF",
    fontWeight: "500",
  },
});

export default FooterNav;
