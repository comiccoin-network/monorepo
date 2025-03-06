// components/Header.js
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import CoinsIcon from "./CoinsIcon";

const Header = ({ currentRoute }) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Only navigate if we're not already on the index page
  const navigateHome = () => {
    if (currentRoute !== "/") {
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
          {/* Logo and Brand */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={navigateHome}
            accessibilityRole="button"
            accessibilityLabel="ComicCoin Faucet, go to home"
          >
            <View style={styles.logoIconContainer}>
              <CoinsIcon size={24} color="white" />
            </View>
            <Text style={styles.logoText}>ComicCoin Faucet</Text>
          </TouchableOpacity>
        </View>
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
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  menuContent: {
    backgroundColor: "white",
    marginTop: 60,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f3e8ff",
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#7e22ce",
  },
});

export default Header;
