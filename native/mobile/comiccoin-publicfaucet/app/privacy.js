// app/privacy.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";

const PrivacyScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <Header currentRoute="/privacy" />

      <ScrollView
        style={styles.scrollView}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>

          <Text style={styles.paragraph}>
            At ComicCoin Faucet, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
          </Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect the following types of information:
          </Text>
          <Text style={styles.listItem}>• Account information: email address, username, and password</Text>
          <Text style={styles.listItem}>• Blockchain information: wallet addresses</Text>
          <Text style={styles.listItem}>• Usage data: interactions with the service, claim history</Text>
          <Text style={styles.listItem}>• Device information: IP address, browser type, device type</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information for:
          </Text>
          <Text style={styles.listItem}>• Providing and maintaining the service</Text>
          <Text style={styles.listItem}>• Processing and fulfilling claims</Text>
          <Text style={styles.listItem}>• Improving and personalizing the user experience</Text>
          <Text style={styles.listItem}>• Preventing fraud and abuse</Text>
          <Text style={styles.listItem}>• Communicating with you about service updates</Text>

          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell or rent your personal information to third parties. We may share information with:
          </Text>
          <Text style={styles.listItem}>• Service providers who assist us in operating the platform</Text>
          <Text style={styles.listItem}>• Legal authorities when required by law</Text>
          <Text style={styles.listItem}>• Other parties with your consent</Text>

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have rights regarding your personal information, including:
          </Text>
          <Text style={styles.listItem}>• Access to your personal information</Text>
          <Text style={styles.listItem}>• Correction of inaccurate information</Text>
          <Text style={styles.listItem}>• Deletion of your information</Text>
          <Text style={styles.listItem}>• Objection to processing of your information</Text>

          <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </Text>

          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at hello@comiccoin.ca.
          </Text>

          <Text style={styles.lastUpdated}>Last updated: March 6, 2025</Text>
        </View>
      </ScrollView>

      <LightFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 24,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7e22ce",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
    marginBottom: 16,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
    marginBottom: 8,
    paddingLeft: 16,
  },
  lastUpdated: {
    marginTop: 40,
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export default PrivacyScreen;
