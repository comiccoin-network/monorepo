// components/Header.js
import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import CoinsIcon from "./CoinsIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Header = ({ showBackButton = false, title = "" }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === "android";

  const handleBack = () => {
    router.back();
  };

  const navigateHome = () => {
    // Only navigate to home if we're not already there
    if (router.pathname !== "/") {
      router.push("/");
    }
  };

  // Platform-specific Touchable component
  const Touchable = ({ children, style, onPress, ...props }) => {
    if (isAndroid) {
      return (
        <TouchableNativeFeedback
          onPress={onPress}
          background={TouchableNativeFeedback.Ripple("rgba(255, 255, 255, 0.2)", true)}
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

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isAndroid ? "#7e22ce" : "transparent"}
        translucent={isAndroid}
      />
      <LinearGradient
        colors={["#7e22ce", "#4338ca"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.headerContainer,
          {
            paddingTop: isAndroid
              ? StatusBar.currentHeight + 8
              : insets.top > 0 ? insets.top : 50
          }
        ]}
      >
        <View style={styles.headerContent}>
          {showBackButton ? (
            isAndroid ? (
              <View style={styles.androidBackButtonWrapper}>
                <TouchableNativeFeedback
                  onPress={handleBack}
                  background={TouchableNativeFeedback.Ripple("rgba(255, 255, 255, 0.2)", true)}
                  useForeground={true}
                >
                  <View style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="white" />
                  </View>
                </TouchableNativeFeedback>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
            )
          ) : null}

          {/* Logo and Brand */}
          {isAndroid ? (
            <View style={[
              styles.logoContainer,
              showBackButton && styles.logoWithBackButton,
            ]}>
              <TouchableNativeFeedback
                onPress={navigateHome}
                background={TouchableNativeFeedback.Ripple("rgba(255, 255, 255, 0.2)", true)}
                useForeground={true}
                accessibilityRole="button"
                accessibilityLabel="ComicCoin PublicFaucet, go to home"
              >
                <View style={styles.androidLogoTouchable}>
                  <View style={styles.logoIconContainer}>
                    <CoinsIcon size={24} color="white" />
                  </View>
                  <Text style={styles.androidLogoText}>ComicCoin Public Faucet</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.logoContainer,
                showBackButton && styles.logoWithBackButton,
              ]}
              onPress={navigateHome}
              accessibilityRole="button"
              accessibilityLabel="ComicCoin PublicFaucet, go to home"
            >
              <View style={styles.logoIconContainer}>
                <CoinsIcon size={24} color="white" />
              </View>
              <Text style={styles.logoText}>ComicCoin Public Faucet</Text>
            </TouchableOpacity>
          )}

          {/* Empty view to balance the layout when back button is shown */}
          {showBackButton ? <View style={styles.spacer} /> : null}
        </View>

        {/* Optional title bar */}
        {title ? (
          <View style={styles.titleContainer}>
            <Text style={isAndroid ? styles.androidTitleText : styles.titleText}>
              {title}
            </Text>
          </View>
        ) : null}
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
    paddingBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
        paddingHorizontal: 4, // Slightly less horizontal padding for Android
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  androidBackButtonWrapper: {
    borderRadius: 24, // Make it circular for Android
    overflow: "hidden",
    width: 40,
    height: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  androidLogoTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  logoWithBackButton: {
    justifyContent: "flex-start",
  },
  logoIconContainer: {
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
    fontFamily: "System",
  },
  androidLogoText: {
    color: "white",
    fontSize: 20, // Slightly smaller for Android
    fontFamily: "sans-serif-medium",
    letterSpacing: 0.25, // Material design spec
  },
  spacer: {
    width: 40,
  },
  titleContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    fontFamily: "System",
  },
  androidTitleText: {
    fontSize: 18,
    color: "white",
    fontFamily: "sans-serif-medium",
    textAlign: "center",
    letterSpacing: 0.15, // Material design spec
  },
});

export default Header;
