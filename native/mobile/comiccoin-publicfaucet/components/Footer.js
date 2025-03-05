import React from "react";
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

const Footer = ({ isLoading, error, faucet, formatBalance, navigation }) => {
  const currentYear = new Date().getFullYear();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <LinearGradient
      colors={["#7e22ce", "#4338ca"]} // from-purple-700 to-indigo-800
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.footerContainer}
    >
      <View style={styles.footerContent}>
        {/* About Section */}
        <View style={styles.aboutSection}>
          <View style={styles.sectionTitleContainer}>
            <Feather
              name="heart"
              size={16}
              color="#f9a8d4"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>ComicCoin Network</Text>
          </View>
          <Text style={styles.aboutText}>
            A community-driven blockchain platform designed for comic collectors
            and creators. We're building an accessible ecosystem that connects
            fans with their favorite comics while empowering artists and
            publishers through blockchain technology.
          </Text>
        </View>

        {/* Resources & Legal Sections */}
        <View style={styles.linksContainer}>
          {/* Resources Section */}
          <View style={styles.linksSection}>
            <View style={styles.sectionTitleContainer}>
              <Feather
                name="code"
                size={14}
                color="#d8b4fe"
                style={styles.sectionIcon}
              />
              <Text style={styles.linksSectionTitle}>Resources</Text>
            </View>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() =>
                openLink("https://github.com/comiccoin-network/monorepo")
              }
            >
              <Feather
                name="github"
                size={14}
                color="#d8b4fe"
                style={styles.linkIcon}
              />
              <Text style={styles.linkText}>GitHub Repository</Text>
              <Feather
                name="external-link"
                size={12}
                color="#d8b4fe"
                style={styles.externalIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openLink("https://comiccoinnetwork.com")}
            >
              <Feather
                name="globe"
                size={14}
                color="#d8b4fe"
                style={styles.linkIcon}
              />
              <Text style={styles.linkText}>Project Website</Text>
              <Feather
                name="external-link"
                size={12}
                color="#d8b4fe"
                style={styles.externalIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => openLink("https://comiccoinwallet.com")}
            >
              <Feather
                name="credit-card"
                size={14}
                color="#d8b4fe"
                style={styles.linkIcon}
              />
              <Text style={styles.linkText}>Official Wallet</Text>
              <Feather
                name="external-link"
                size={12}
                color="#d8b4fe"
                style={styles.externalIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Legal Section */}
          <View style={styles.linksSection}>
            <View style={styles.sectionTitleContainer}>
              <Feather
                name="shield"
                size={14}
                color="#d8b4fe"
                style={styles.sectionIcon}
              />
              <Text style={styles.linksSectionTitle}>Legal</Text>
            </View>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => navigateTo("Terms")}
            >
              <Feather
                name="file-text"
                size={14}
                color="#d8b4fe"
                style={styles.linkIcon}
              />
              <Text style={styles.linkText}>Terms of Service</Text>
              <Feather
                name="arrow-right"
                size={12}
                color="#d8b4fe"
                style={styles.externalIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => navigateTo("Privacy")}
            >
              <Feather
                name="book-open"
                size={14}
                color="#d8b4fe"
                style={styles.linkIcon}
              />
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Feather
                name="arrow-right"
                size={12}
                color="#d8b4fe"
                style={styles.externalIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Network Stats Section */}
        {!isLoading && !error && faucet ? (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Active Users</Text>
                <Text style={styles.statValue}>
                  {faucet.users_count?.toLocaleString() || "0"}+
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Coins Distributed</Text>
                <Text style={styles.statValue}>
                  {formatBalance(faucet?.total_coins_distributed)}+
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distribution Rate</Text>
                <Text style={styles.statValue}>
                  {faucet?.distribution_rate_per_day}/day
                </Text>
              </View>
            </View>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#f3e8ff" />
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        ) : null}

        {/* Copyright Section */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © {currentYear} ComicCoin Network. All rights reserved.
          </Text>
          <Text style={styles.builtWithText}>
            Built with ❤️ by the ComicCoin community
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerContent: {
    paddingBottom: 16,
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  aboutText: {
    color: "#e9d5ff", // purple-200
    lineHeight: 22,
  },
  linksContainer: {
    marginBottom: 24,
  },
  linksSection: {
    marginBottom: 20,
  },
  linksSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    color: "#e9d5ff", // purple-200
    flex: 1,
  },
  externalIcon: {
    opacity: 0.7,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#9333ea", // purple-600
    paddingTop: 16,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#d8b4fe", // purple-300
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#f3e8ff",
    marginLeft: 8,
  },
  copyrightSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(147, 51, 234, 0.3)", // purple-600 with opacity
    paddingTop: 16,
    alignItems: "center",
  },
  copyrightText: {
    color: "#e9d5ff", // purple-200
    textAlign: "center",
  },
  builtWithText: {
    marginTop: 8,
    fontSize: 12,
    color: "#d8b4fe", // purple-300
    textAlign: "center",
  },
});

export default Footer;
