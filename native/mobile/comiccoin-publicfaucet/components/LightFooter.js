// components/LightFooter.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

const LightFooter = () => {
  const currentYear = new Date().getFullYear();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => openLink("https://comiccoin.example.com/terms")}
          >
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => openLink("https://comiccoin.example.com/privacy")}
          >
            <Text style={styles.footerLinkText}>Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => openLink("https://comiccoin.example.com/help")}
          >
            <Text style={styles.footerLinkText}>Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openLink("https://twitter.com/comiccoin")}
            >
              <Feather name="twitter" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openLink("https://discord.gg/comiccoin")}
            >
              <Feather name="message-circle" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openLink("https://github.com/comiccoin")}
            >
              <Feather name="github" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>
          © {currentYear} ComicCoin Network. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  footerContent: {
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  footerLink: {
    marginHorizontal: 10,
  },
  footerLinkText: {
    fontSize: 14,
    color: "#6b21a8",
    fontWeight: "500",
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  copyright: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
});

export default LightFooter;
