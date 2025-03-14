// components/AppFooter.js
import React from "react";
import { useRouter, usePathname } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

const FooterNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Determine which screen is active
  const isActive = (path) => {
    return pathname === path;
  };

  // Render tab item with proper spacing for Android
  const renderTabItem = (iconName, label, path, index) => {
    const active = isActive(path);
    const activeIconName = iconName.replace("-outline", "");

    const tabContent = (
      <>
        <Ionicons
          name={active ? activeIconName : iconName}
          size={24}
          color={active ? "#8347FF" : "#9CA3AF"}
        />
        <Text
          style={[
            styles.tabLabel,
            active && styles.activeTabLabel,
            isAndroid && styles.androidTabLabel,
            isAndroid && active && styles.androidActiveTabLabel,
          ]}
        >
          {label}
        </Text>
      </>
    );

    if (isAndroid) {
      return (
        <View style={styles.tabItemContainer} key={path}>
          <TouchableNativeFeedback
            onPress={() => router.push(path)}
            background={TouchableNativeFeedback.Ripple(
              active ? "#e9d5ff" : "#f3f4f6",
              false,
            )}
            useForeground={true}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.tabButton, styles.androidTabButton]}>
              {tabContent}
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={path}
        style={styles.tabButton}
        onPress={() => router.push(path)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
      >
        {tabContent}
      </TouchableOpacity>
    );
  };

  // Render center claim button
  const renderClaimButton = () => {
    if (isAndroid) {
      return (
        <View style={styles.claimButtonWrapper}>
          <View style={styles.androidClaimOuterWrapper}>
            <TouchableNativeFeedback
              onPress={() => router.push("/claim")}
              background={TouchableNativeFeedback.Ripple("#a78bfa", true)}
              useForeground={true}
              accessibilityRole="button"
              accessibilityLabel="Claim Coins"
            >
              <View style={styles.claimButtonInner}>
                <Ionicons name="cash" size={24} color="white" />
              </View>
            </TouchableNativeFeedback>
          </View>
          <Text style={styles.androidClaimLabel}>Claim</Text>
        </View>
      );
    }

    return (
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
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: isAndroid ? 0 : insets.bottom },
      ]}
    >
      {/* Left side tabs */}
      <View style={styles.tabSection}>
        {renderTabItem("home-outline", "Home", "/(tabs)/dashboard")}
        {renderTabItem("list-outline", "History", "/transactions")}
      </View>

      {/* Center claim button */}
      {renderClaimButton()}

      {/* Right side tabs */}
      <View style={styles.tabSection}>
        {renderTabItem("wallet-outline", "Wallet", "/wallet")}
        {renderTabItem("settings-outline", "Settings", "/settings")}
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      android: {
        height: 56, // Material Design standard
        elevation: 8,
        borderTopWidth: 0, // Remove border on Android and use elevation instead
      },
    }),
  },
  tabSection: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "space-evenly",
  },
  tabItemContainer: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: "100%",
  },
  androidTabButton: {
    height: 56,
    paddingTop: 6,
    paddingBottom: 10,
    width: "100%",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#9CA3AF",
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
    }),
  },
  androidTabLabel: {
    fontFamily: "sans-serif",
    fontSize: 12,
    marginTop: 6,
  },
  activeTabLabel: {
    color: "#8347FF",
    fontWeight: "500",
  },
  androidActiveTabLabel: {
    color: "#8347FF",
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
  claimButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 15, // To account for the button extending upward
    width: 72, // Fixed width to ensure proper spacing
  },
  claimButtonWrapper: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: width * 0.2, // Limit width for proper proportions
  },
  androidClaimOuterWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginTop: -20,
    elevation: 8,
  },
  claimButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8347FF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#8347FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
    marginTop: -20, // Push button up for half-circle effect
  },
  claimLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#8347FF",
    fontWeight: "500",
  },
  androidClaimLabel: {
    fontSize: 11,
    marginTop: 0,
    color: "#8347FF",
    fontFamily: "sans-serif-medium",
    fontWeight: "normal",
  },
});

export default FooterNav;
