// app/terms.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";

const TermsScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <Header showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the ComicCoin Faucet service, you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            please do not use our service.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            ComicCoin Faucet is a service that allows users to claim free
            ComicCoins for use within the ComicCoin Network ecosystem. The
            service is provided "as is" and "as available" without warranties of
            any kind.
          </Text>

          <Text style={styles.sectionTitle}>3. Account Registration</Text>
          <Text style={styles.paragraph}>
            To access certain features of the service, you may be required to
            register for an account. You agree to provide accurate information
            and to keep this information up to date. You are responsible for
            maintaining the confidentiality of your account credentials and for
            all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>4. Usage Guidelines</Text>
          <Text style={styles.paragraph}>Users are prohibited from:</Text>
          <Text style={styles.listItem}>
            • Using automated tools or scripts to claim ComicCoins
          </Text>
          <Text style={styles.listItem}>
            • Creating multiple accounts to bypass claiming limits
          </Text>
          <Text style={styles.listItem}>
            • Selling or transferring claimed ComicCoins outside of the platform
          </Text>
          <Text style={styles.listItem}>
            • Engaging in any activity that disrupts or interferes with the
            service
          </Text>

          <Text style={styles.sectionTitle}>5. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account and access
            to the service at our sole discretion, without notice, for conduct
            that we believe violates these Terms of Service or is harmful to
            other users, us, or third parties, or for any other reason.
          </Text>

          <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms of Service at any time. Your continued use
            of the service after any such changes constitutes your acceptance of
            the new terms.
          </Text>

          <Text style={styles.sectionTitle}>7. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please
            contact us at hello@comiccoin.ca.
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

export default TermsScreen;
