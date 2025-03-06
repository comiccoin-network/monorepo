import { useRouter } from "expo-router";// components/LightFooter.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

const LightFooter = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  const openLink = (url) => {
    if (url.startsWith('http')) {
      Linking.openURL(url);
    } else if (url.startsWith('mailto')) {
      Linking.openURL(url);
    } else {
      // Internal navigation
      router.push(url);
    }
  };

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => openLink("/terms")}
          >
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => openLink("/privacy")}
          >
            <Text style={styles.footerLinkText}>Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => openLink("/help")}
          >
            <Text style={styles.footerLinkText}>Help</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openLink("https://comiccoinfaucet.com")}
            >
              <Feather name="globe" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openLink("mailto:hello@comiccoin.ca")}
            >
              <Feather name="mail" size={18} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => openLink("https://github.com/comiccoin-network/monorepo")}
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
