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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const Header = ({ showBackButton = false }) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navigateHome = () => {
    router.push("/home");
  };

  const navigateToGetStarted = () => {
    router.push("/");
  };

  return (
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
          <Feather
            name="dollar-sign"
            size={24}
            color="white"
            style={styles.logoIcon}
          />
          <Text style={styles.logoText}>ComicCoin Faucet</Text>
        </TouchableOpacity>

        {/* Mobile Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}
          accessibilityRole="button"
          accessibilityLabel={
            menuVisible ? "Close main menu" : "Open main menu"
          }
        >
          <Feather name={menuVisible ? "x" : "menu"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Mobile Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
          <View style={styles.menuContent}>
            {showBackButton ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  toggleMenu();
                  navigateHome();
                }}
              >
                <Feather name="arrow-left" size={20} color="#7e22ce" />
                <Text style={styles.menuItemText}>Back to Home</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  toggleMenu();
                  navigateToGetStarted();
                }}
              >
                <Feather name="dollar-sign" size={20} color="#7e22ce" />
                <Text style={styles.menuItemText}>Claim Coins</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 44 : 10,
    paddingBottom: 10,
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
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
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
