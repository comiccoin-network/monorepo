// screens/RegisterSuccessScreen.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import LightFooter from "../components/LightFooter";

const RegisterSuccessScreen = () => {
  const router = useRouter();

  const handleNavigateToLogin = () => {
    router.push("/login");
  };

  const handleNavigateToHome = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7e22ce" />

      {/* Header with back button */}
      <Header showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        bounces={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={48} color="#10B981" />
            </View>

            {/* Header */}
            <Text style={styles.title}>Registration Successful!</Text>

            {/* Messages */}
            <View style={styles.messageContainer}>
              <Text style={styles.message}>
                Thank you for registering - an{" "}
                <Text style={styles.bold}>activation email</Text> has been sent
                to you. Please be sure to check your social, promotions and spam
                folders if it does not arrive within 5 minutes.
              </Text>

              <Text style={styles.subMessage}>
                Your account has been created, but you'll need to confirm your
                email before you can start collecting your ComicCoins.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNavigateToLogin}
              >
                <Text style={styles.primaryButtonText}>Go to Login</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleNavigateToHome}
              >
                <Ionicons name="arrow-back" size={20} color="#4F46E5" />
                <Text style={styles.secondaryButtonText}>Back to Home</Text>
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
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E9D5FF",
  },
  iconContainer: {
    backgroundColor: "#D1FAE5",
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B21A8",
    textAlign: "center",
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  subMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterSuccessScreen;
