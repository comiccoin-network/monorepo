// components/OnboardingWizard/commonScreens.js
import { Platform } from "react-native";

// App download links
export const APP_LINKS = {
  ios: "https://apps.apple.com/ca/app/comiccoin-wallet/id6741118881",
  android:
    "https://play.google.com/store/apps/details?id=com.theshootingstarpress.comiccoinwallet",
  web: "https://comiccoinwallet.com",
};

// Screens shared between platforms
export const COMMON_SCREENS = [
  {
    id: "1",
    title: "Welcome to ComicCoin Public Faucet",
    subtitle: "Claim Free ComicCoins Daily",
    description:
      "This app allows you to claim free ComicCoins every day simply by logging in and pressing a button.",
    additionalContent: [
      {
        title: "What is ComicCoin?",
        description:
          "ComicCoin is an open-source blockchain project utilizing a Proof of Authority consensus mechanism. This ensures fast, efficient, and environmentally friendly transactions while maintaining security and transparency. Our code is public, auditable, and community-driven.",
      },
      {
        title: "Learn More",
        description:
          "Visit our website to discover more about the ComicCoin ecosystem and how it benefits comic collectors and creators.",
        websiteUrl: "https://comiccoinnetwork.com",
      },
    ],
    icon: "🎁",
  },
  {
    id: "2",
    title: "Download ComicCoin Wallet",
    subtitle: "Required Companion App",
    description:
      "To claim ComicCoins, you need a wallet app. Choose one option below:",
    walletOptions: [
      {
        title: `Download for ${Platform.OS === "ios" ? "iOS" : "Android"}`,
        description: "Get the app on your phone",
        url: Platform.OS === "ios" ? APP_LINKS.ios : APP_LINKS.android,
        icon: "📱",
      },
      {
        title: "Use Web Wallet",
        description: "No download needed",
        url: APP_LINKS.web,
        icon: "🌐",
      },
    ],
    icon: "⬇️",
  },
  {
    id: "3",
    title: "About ComicCoin Public Faucet",
    subtitle: "Your Gateway to Free ComicCoins",
    description:
      "ComicCoin Public Faucet is a free cloud service that distributes ComicCoins to registered users.",
    websiteUrl: "http://comiccoinfaucet.com",
    cloudDataInfo: {
      title: "Data Stored in the Cloud",
      description:
        "This app communicates with our web service. The following information is stored securely in our cloud infrastructure:",
      dataItems: [
        { label: "Name", icon: "📝" },
        { label: "Email", icon: "✉️" },
        { label: "Phone Number", icon: "📱" },
        { label: "Country", icon: "🌎" },
        { label: "Timezone", icon: "🕒" },
        { label: "Wallet Address", icon: "💼" },
      ],
    },
    additionalInfo:
      "We collect this information to prevent fraudulent activity and maintain the integrity of the ComicCoin distribution system. If you opt in to marketing communications, we may also use your data to share the latest ComicCoin developments with you.",
    icon: "☁️",
  },
];

// Platform-specific screens
export const IOS_TRACKING_SCREEN = {
  id: "4",
  title: "Turn on tracking allows us to provide features like:",
  subtitle: "",
  description: "",
  trackingBenefits: [
    {
      title: "Secure account registration",
      description: "Create and verify your ComicCoin account",
      icon: "👤",
    },
    {
      title: "Personalized login experience",
      description: "Access your account smoothly and securely",
      icon: "🔑",
    },
    {
      title: "Daily coin claiming",
      description: "Ensure fair distribution of ComicCoins",
      icon: "🎁",
    },
  ],
  note: "You can change this option later in the Settings app.",
  icon: "🛡️",
};

export const ANDROID_COMPLETION_SCREEN = {
  id: "4-android",
  title: "Completing Setup",
  subtitle: "Almost Ready!",
  description: "Your ComicCoin Faucet is being prepared...",
  isCompletionScreen: true,
  icon: "✓",
};

// Helper function to mark onboarding complete
export const markOnboardingComplete = async () => {
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.setItem("@onboarding_completed", "true");
    return true;
  } catch (error) {
    console.error("Error saving onboarding status:", error);
    return false;
  }
};

// Helper function to navigate after onboarding
export const navigateAfterOnboarding = (onComplete, navigation, router) => {
  if (typeof onComplete === "function") {
    onComplete();
  } else if (navigation) {
    navigation.replace("index");
  } else if (router) {
    router.replace("/");
  }
};
