// screens/MoreScreen.js - Optimized for iOS
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../hooks/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 667; // iPhone SE or similar sizes
const isLargeDevice = height > 844; // iPhone Pro Max models

const MoreScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets(); // Get safe area insets for notch and home indicator
  const isIOS = Platform.OS === "ios";

  const confirmSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: () => logout(),
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  const confirmDeleteAccount = () => {
    router.push("/(tabs-more)/delete-account");
  };

  const handleSettingsPress = () => {
    router.push("/(tabs-more)/settings");
  };

  // Grid items data with section grouping
  const menuSections = [
    {
      title: "Account",
      items: [
        {
          id: "settings",
          title: "Settings",
          description: "Manage your preferences",
          icon: "settings-outline",
          color: "#8347FF",
          bgColor: "#F3F4FF",
          onPress: handleSettingsPress,
        },
      ],
    },
    {
      title: "Account Actions",
      items: [
        {
          id: "delete",
          title: "Delete Account",
          description: "Remove your account",
          icon: "trash-outline",
          color: "#EF4444",
          bgColor: "#FEF2F2",
          onPress: confirmDeleteAccount,
        },
        {
          id: "logout",
          title: "Sign Out",
          description: "Log out from the app",
          icon: "log-out-outline",
          color: "#F59E0B",
          bgColor: "#FFF7ED",
          onPress: confirmSignOut,
        },
      ],
    },
    {
      title: "Support & Help",
      items: [
        {
          id: "help",
          title: "Help & Support",
          description: "Get assistance",
          icon: "help-circle-outline",
          color: "#10B981",
          bgColor: "#ECFDF5",
          onPress: () => router.push("/help"),
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          description: "Review our policies",
          icon: "shield-outline",
          color: "#3B82F6",
          bgColor: "#EFF6FF",
          onPress: () => router.push("/privacy"),
        },
        {
          id: "terms",
          title: "Terms of Service",
          description: "Read our terms",
          icon: "document-text-outline",
          color: "#6366F1",
          bgColor: "#EEF2FF",
          onPress: () => router.push("/terms"),
        },
      ],
    },
  ];

  // Calculate grid item width based on device size
  const gridItemWidth = isSmallDevice
    ? width - 32 // Full width on small devices
    : (width - 48) / 2; // Two items per row on larger devices

  return (
    <View style={styles.container}>
      <AppHeader title="More" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          // Add bottom padding for home indicator on notched devices
          { paddingBottom: isIOS ? insets.bottom + 20 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View
              style={[
                styles.gridContainer,
                // Single column on small devices
                isSmallDevice && styles.gridContainerSmall,
              ]}
            >
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.gridItem,
                    {
                      width: isSmallDevice ? "100%" : gridItemWidth,
                      // Add depth with shadows on iOS
                      ...Platform.select({
                        ios: {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                        },
                        android: {
                          elevation: 2,
                        },
                      }),
                    },
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7} // Better touch feedback on iOS
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.bgColor },
                    ]}
                  >
                    <Ionicons name={item.icon} size={28} color={item.color} />
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>ComicCoin Public Faucet v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 ComicCoin Network</Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    // Bottom padding will be added dynamically based on safe area insets
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    paddingLeft: 4,
    // Use system font for iOS
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
    }),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridContainerSmall: {
    flexDirection: "column", // Stack vertically on small devices
  },
  gridItem: {
    backgroundColor: "white",
    borderRadius: 16, // Slightly larger radius for iOS
    padding: 16,
    marginBottom: 16,
    // Min height to ensure consistent card sizes
    minHeight: 160,
    // Smooth border for iOS
    borderWidth: Platform.OS === "ios" ? 1 : 0,
    borderColor: "#F3F4F6",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    // Use system font for iOS
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
    }),
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    // Better line height on iOS for readability
    ...Platform.select({
      ios: {
        lineHeight: 18,
      },
    }),
  },
  versionContainer: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    // Use system font for iOS
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
    }),
  },
  copyrightText: {
    fontSize: 12,
    color: "#9CA3AF",
    // Use system font for iOS
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
    }),
  },
});

export default MoreScreen;
