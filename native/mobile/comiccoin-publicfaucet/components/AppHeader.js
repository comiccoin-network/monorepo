// components/AppHeader.js
import React from "react";
import { useRouter, usePathname } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import CoinsIcon from "./CoinsIcon";

/**
 * AppHeader component designed specifically for tab navigation screens
 * Displays app branding consistently with the current tab title
 *
 * @param {string} title - The title of the current screen/tab to display
 * @param {boolean} isTabScreen - Whether this is a tab navigation screen (defaults to true)
 * @param {Object} rightElement - Optional component to display on the right side of the header
 */
const AppHeader = ({ title = "", isTabScreen = true, rightElement = null }) => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToDashboard = () => {
    // Navigate to dashboard (first tab) if we're not already there
    if (pathname !== "/(tabs)/dashboard") {
      router.push("/(tabs)/dashboard");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <LinearGradient
        colors={["#7e22ce", "#4338ca"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        {/* App Branding */}
        <View style={styles.headerContent}>
          <View style={styles.spacerLeft} />

          <TouchableOpacity
            style={styles.logoContainer}
            onPress={navigateToDashboard}
            accessibilityRole="button"
            accessibilityLabel="ComicCoin Faucet, go to dashboard"
          >
            <View style={styles.logoIconContainer}>
              <CoinsIcon size={24} color="white" />
            </View>
            <Text style={styles.logoText}>ComicCoin Faucet</Text>
          </TouchableOpacity>

          {rightElement ? rightElement : <View style={styles.spacerRight} />}
        </View>

        {/* Screen Title */}
        {title ? (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
    paddingBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 3,
  },
  logoIconContainer: {
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  spacerLeft: {
    flex: 1,
  },
  spacerRight: {
    flex: 1,
  },
  titleContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});

export default AppHeader;
