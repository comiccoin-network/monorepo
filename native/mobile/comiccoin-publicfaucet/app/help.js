// app/help.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";
import { Feather } from "@expo/vector-icons";

const HelpScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />
      <Header currentRoute="/help" />

      <ScrollView
        style={styles.scrollView}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Help Center</Text>

          <Text style={styles.subtitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Feather name="help-circle" size={20} color="#7e22ce" style={styles.faqIcon} />
              <Text style={styles.questionText}>What is ComicCoin Faucet?</Text>
            </View>
            <Text style={styles.answerText}>
              ComicCoin Faucet is a service that allows users to claim free ComicCoins, the digital currency used in the ComicCoin Network ecosystem. These coins can be used to access premium content, trade collectibles, and interact with various features of the platform.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Feather name="help-circle" size={20} color="#7e22ce" style={styles.faqIcon} />
              <Text style={styles.questionText}>How often can I claim ComicCoins?</Text>
            </View>
            <Text style={styles.answerText}>
              Users can claim ComicCoins once every 24 hours. The claim timer resets at midnight UTC. Premium members may have access to additional claims or higher amounts.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Feather name="help-circle" size={20} color="#7e22ce" style={styles.faqIcon} />
              <Text style={styles.questionText}>How do I create a ComicCoin wallet?</Text>
            </View>
            <Text style={styles.answerText}>
              A ComicCoin wallet is automatically created when you register for an account. You can access your wallet through the dashboard after logging in. Your wallet address is unique to your account and is used to receive and store your ComicCoins.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Feather name="help-circle" size={20} color="#7e22ce" style={styles.faqIcon} />
              <Text style={styles.questionText}>Can I transfer ComicCoins to other users?</Text>
            </View>
            <Text style={styles.answerText}>
              Yes, you can transfer ComicCoins to other registered users by entering their wallet address or username in the "Send" section of your wallet dashboard. There is a small network fee for each transaction.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Feather name="help-circle" size={20} color="#7e22ce" style={styles.faqIcon} />
              <Text style={styles.questionText}>I'm experiencing technical issues. What should I do?</Text>
            </View>
            <Text style={styles.answerText}>
              If you're experiencing technical issues, please try refreshing the app, checking your internet connection, and clearing your cache. If problems persist, please contact our support team at hello@comiccoin.ca with details about the issue.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Still Need Help?</Text>
            <Text style={styles.contactDesc}>
              Our support team is available to assist you with any questions or concerns.
            </Text>

            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <Feather name="mail" size={20} color="#7e22ce" style={styles.contactIcon} />
                <Text style={styles.contactButtonText}>Email Support</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactButton}>
                <Feather name="book-open" size={20} color="#7e22ce" style={styles.contactIcon} />
                <Text style={styles.contactButtonText}>Documentation</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7e22ce",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  faqItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  faqIcon: {
    marginRight: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b21a8",
    flex: 1,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
  },
  contactSection: {
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 12,
  },
  contactDesc: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  contactButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 12,
    width: "45%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  contactIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: "#7e22ce",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default HelpScreen;
