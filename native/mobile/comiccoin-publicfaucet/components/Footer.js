// components/Footer.js
import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const Footer = ({ isLoading, error, faucet, formatBalance }) => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  const navigateTo = (screen) => {
    router.push(`/${screen.toLowerCase()}`);
  };

  // Rest of component remains the same
  return (
    <LinearGradient
      colors={["#7e22ce", "#4338ca"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.footerContainer}
    >
      {/* Rest of your component JSX */}
    </LinearGradient>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  // Your existing styles
});

export default Footer;
