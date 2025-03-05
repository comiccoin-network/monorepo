import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const Header = ({ showBackButton = false, navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const navigateHome = () => {
    navigation.navigate("Home");
  };

  const navigateToGetStarted = () => {
    navigation.navigate("GetStarted");
  };

  return (
    <LinearGradient
      colors={["#7e22ce", "#4338ca"]} // from-purple-700 to-indigo-800
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

        {/* Action Button (visible on larger screens) */}
        <View style={styles.desktopActions}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateHome}
              accessibilityRole="button"
              accessibilityLabel="Go back to home page"
            >
              <Feather
                name="arrow-left"
                size={18}
                color="#7e22ce"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Back to Home</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToGetStarted}
              accessibilityRole="button"
              accessibilityLabel="Start claiming ComicCoins"
            >
              <Feather
                name="dollar-sign"
                size={18}
                color="#7e22ce"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Claim Coins</Text>
            </TouchableOpacity>
          )}
        </View>

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
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
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
  desktopActions: {
    // This would be shown only on tablets or larger screens
    // We can use Platform.OS and Dimensions to conditionally show this
    display: "none", // Default to none for mobile
  },
  actionButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: "#7e22ce", // purple-700
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
    marginTop: 60, // Position below the header
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f3e8ff", // purple-100
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#7e22ce", // purple-700
  },
});

export default Header;
