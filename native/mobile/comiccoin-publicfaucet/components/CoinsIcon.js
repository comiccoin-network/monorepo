// components/CoinsIcon.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

const CoinsIcon = ({ size = 24, color = "white" }) => {
  // Create a custom stacked coins icon using multiple circles
  return (
    <View style={styles.container}>
      {/* Bottom coin */}
      <View style={[styles.coin, styles.bottomCoin, { width: size * 0.9, height: size * 0.9 }]}>
        <Feather name="circle" size={size * 0.9} color={color} />
      </View>

      {/* Middle coin */}
      <View style={[styles.coin, styles.middleCoin, { width: size * 0.9, height: size * 0.9 }]}>
        <Feather name="circle" size={size * 0.9} color={color} />
      </View>

      {/* Top coin */}
      <View style={[styles.coin, styles.topCoin, { width: size * 0.9, height: size * 0.9 }]}>
        <Feather name="circle" size={size * 0.9} color={color} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  coin: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomCoin: {
    opacity: 0.6,
    transform: [{ translateY: 4 }],
  },
  middleCoin: {
    opacity: 0.8,
    transform: [{ translateY: 0 }],
  },
  topCoin: {
    opacity: 1,
    transform: [{ translateY: -4 }],
  },
});

export default CoinsIcon;
