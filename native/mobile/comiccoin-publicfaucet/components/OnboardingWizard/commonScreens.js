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
    title: "ComicCoin Faucet",
    subtitle: "Claim Free Coins Daily",
    description: "Log in daily. Press a button. Get free ComicCoins.",
    additionalContent: [
      {
        title: "What is ComicCoin?",
        description:
          "A fast, secure blockchain for digital comics. Environmentally friendly with transparent, community-driven code.",
      },
      {
        title: "Learn More",
        description: "Explore how ComicCoin benefits collectors and creators.",
        websiteUrl: "https://comiccoinnetwork.com",
      },
    ],
    icon: "🎁",
  },
  {
    id: "2",
    title: "Create Your ComicCoin Storage Spot",
    subtitle: "A Simple Guide to Setting Up Your Digital Coin Box",
    description:
      "Before you can receive any free ComicCoins, you'll need to create something called a 'wallet.' Don't worry - this isn't a physical wallet! It's just a special place on your phone or computer that safely stores your digital coins. Think of it like having a piggy bank that only you can open.",
    walletOptions: [
      {
        title:
          Platform.OS === "ios"
            ? "Set Up on Your iPhone (Recommended for iPhone Users)"
            : "Set Up on Your Android Phone (Recommended for Android Users)",
        description:
          Platform.OS === "ios"
            ? "This option will help you install a special app on this iPhone. The app creates a secure place to keep your ComicCoins. Here's exactly what will happen when you tap this button:\n\n1. Your phone will open the App Store (the blue app with the 'A' symbol)\n\n2. You'll see the ComicCoin Wallet app page\n\n3. Tap the 'GET' button (it might say 'INSTALL' instead)\n\n4. You might need to use Face ID, Touch ID, or enter your Apple password\n\n5. A little circle will show the download progress\n\n6. When it's done, the button will change to 'OPEN'\n\n7. Tap 'OPEN' to start the app\n\nDon't worry if you get lost! You can always come back to this screen and try again. The app is completely free to download."
            : "This option will help you install a special app on this Android phone. The app creates a secure place to keep your ComicCoins. Here's exactly what will happen when you tap this button:\n\n1. Your phone will open the Google Play Store (the colorful triangle symbol app)\n\n2. You'll see the ComicCoin Wallet app page\n\n3. Tap the 'INSTALL' button\n\n4. You might need to confirm with your fingerprint or password\n\n5. A circle will show the download progress\n\n6. When it's done, the button will change to 'OPEN'\n\n7. Tap 'OPEN' to start the app\n\nDon't worry if you get stuck! You can always come back to this screen and try again. The app is completely free to download.",
        url: Platform.OS === "ios" ? APP_LINKS.ios : APP_LINKS.android,
        icon: "📱",
      },
      {
        title: "Set Up on a Website (No Download Required)",
        description:
          "If you prefer not to download an app, you can use this option instead. This creates your ComicCoin storage spot using a website. Here's what will happen when you tap this button:\n\n1. Your device will open a website in your internet browser (like Safari, Chrome, or whatever you use to look at websites)\n\n2. The ComicCoin Wallet website will appear\n\n3. The website will guide you through creating your wallet\n\n4. You'll need to create a password to protect your coins\n\n5. IMPORTANT: Write down your password and keep it somewhere safe! If you forget it, no one can help you recover it\n\nThis option works on phones, tablets, and computers. It's a good choice if you don't want to install anything new on your device.",
        url: APP_LINKS.web,
        icon: "🌐",
      },
    ],
    warningText:
      "IMPORTANT: Whichever option you choose, you will be asked to create a password or security phrase. Please write this down on paper and keep it somewhere safe! If you lose this information, you won't be able to access your ComicCoins, and unfortunately, no one will be able to recover them for you.",
    afterWalletCreation:
      "After you've set up your wallet using either method above, you'll need to do one more thing. Your new wallet will give you a special code called a 'wallet address.' It's a long string of letters and numbers that looks something like this: 0x8347FF1234567890abcdef. You'll need to copy this code and bring it back to this app. Think of this code as your digital mailbox address - it tells us exactly where to deliver your free ComicCoins!",
    returnInstructions:
      "To return to this app after setting up your wallet:\n\n1. If you're on a phone, press your home button (or swipe up from the bottom on newer phones)\n\n2. Find this app's icon on your screen and tap it\n\n3. This will bring you back here, where you can continue the setup process",
    icon: "⬇️",
    helpText:
      "If you get stuck at any point, don't worry! You can always close everything and start over. Nothing will be lost. Or you can ask someone you trust to help you with these steps. Setting up a digital wallet might seem complicated at first, but millions of people just like you have done it successfully!",
  },
  {
    id: "3",
    title: "ComicCoin Faucet",
    subtitle: "Get Free ComicCoins",
    description: "Claim daily ComicCoins after registering your account.",
    websiteUrl: "http://comiccoinfaucet.com",
    cloudDataInfo: {
      title: "Your Data",
      description: "We securely store the following information:",
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
      "This data prevents fraud and ensures system integrity. With your consent, we'll send you ComicCoin updates.",
    icon: "☁️",
  },
];

// Platform-specific screens
export const IOS_TRACKING_SCREEN = {
  id: "4",
  title: "Allow tracking on the next screen for:",
  subtitle: "",
  description: "",
  trackingBenefits: [
    {
      title: "Special offers and promotions just for you",
      description: "Receive additional ComicCoin rewards and benefits",
      icon: "🎁",
    },
    {
      title: "Advertisements that match your interests",
      description: "See more relevant and useful ads",
      icon: "🎯",
    },
    {
      title: "An improved personalized experience over time",
      description: "Enjoy content and features adapted to your preferences",
      icon: "✨",
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
