// components/Header.js
import React from "react";
import { useRouter } from "expo-router";
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

const Header = ({ showBackButton = false, title = "" }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const navigateHome = () => {
    // Only navigate to home if we're not already there
    if (router.pathname !== "/") {
      router.push("/");
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
        <View style={styles.headerContent}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          ) : null}

          {/* Logo and Brand */}
          <TouchableOpacity
            style={[
              styles.logoContainer,
              showBackButton && styles.logoWithBackButton,
            ]}
            onPress={navigateHome}
            accessibilityRole="button"
            accessibilityLabel="ComicCoin Faucet, go to home"
          >
            <View style={styles.logoIconContainer}>
              <CoinsIcon size={24} color="white" />
            </View>
            <Text style={styles.logoText}>ComicCoin Faucet</Text>
          </TouchableOpacity>

          {/* Empty view to balance the layout when back button is shown */}
          {showBackButton ? <View style={styles.spacer} /> : null}
        </View>

        {/* Optional title bar */}
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoWithBackButton: {
    justifyContent: "flex-start",
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
  spacer: {
    width: 40,
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

export default Header;
