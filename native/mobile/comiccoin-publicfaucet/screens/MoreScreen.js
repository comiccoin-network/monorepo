// screens/MoreScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
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
const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

// Custom touchable component that adapts to the platform
const Touchable = ({ children, style, onPress, ...props }) => {
  if (isAndroid) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple("#d4c1ff", false)}
        useForeground={true}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const MoreScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets(); // Get safe area insets for notch and home indicator

  // Set proper status bar for Android
  React.useEffect(() => {
    if (isAndroid) {
      StatusBar.setBackgroundColor("#7e22ce");
      StatusBar.setBarStyle("light-content");
    }
  }, []);

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

  // Calculate grid item width based on device size and platform
  // On Android, we'll use full width on more screen sizes for better touch targets
  const useFullWidth = isSmallDevice || (isAndroid && height < 720);
  const gridItemWidth = useFullWidth ? width - 32 : (width - 48) / 2;

  // Render grid item with platform-specific touchable feedback
  const renderGridItem = (item) => {
    const itemContent = (
      <View>
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon} size={28} color={item.color} />
        </View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    );

    if (isAndroid) {
      return (
        <View
          key={item.id}
          style={[
            styles.gridItemWrapper,
            {
              width: useFullWidth ? "100%" : gridItemWidth,
            },
          ]}
        >
          <TouchableNativeFeedback
            onPress={item.onPress}
            background={TouchableNativeFeedback.Ripple(item.bgColor, false)}
            useForeground={true}
          >
            <View style={styles.gridItem}>{itemContent}</View>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.gridItem,
          {
            width: useFullWidth ? "100%" : gridItemWidth,
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        {itemContent}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="More" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          // Add bottom padding for home indicator on notched devices (iOS)
          isIOS && { paddingBottom: insets.bottom + 20 },
          // Add specific padding for Android
          isAndroid && { paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode={isAndroid ? "never" : undefined}
      >
        {menuSections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View
              style={[
                styles.gridContainer,
                // Single column on small devices or specific Android devices
                useFullWidth && styles.gridContainerSmall,
              ]}
            >
              {section.items.map((item) => renderGridItem(item))}
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
    // Bottom padding will be added dynamically based on platform and safe area insets
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
    // Use system font for iOS and appropriate font for Android
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
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
  gridItemWrapper: {
    // Wrapper specifically for Android's TouchableNativeFeedback
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  gridItem: {
    backgroundColor: "white",
    borderRadius: 16, // Slightly larger radius for iOS
    padding: 16,
    marginBottom: 16,
    // Min height to ensure consistent card sizes
    minHeight: 160,
    // Platform-specific styling
    ...Platform.select({
      ios: {
        // Smooth border and shadow for iOS
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        // Material Design elevation for Android
        elevation: 2,
        // No need for border on Android as elevation provides visual separation
      },
    }),
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
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
        fontWeight: "normal", // Android handles font weight differently
      },
    }),
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        lineHeight: 18,
        fontFamily: "System",
      },
      android: {
        lineHeight: 20,
        fontFamily: "sans-serif",
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
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
  copyrightText: {
    fontSize: 12,
    color: "#9CA3AF",
    // Platform-specific font styling
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "sans-serif",
      },
    }),
  },
});

export default MoreScreen;
