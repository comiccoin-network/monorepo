// monorepo/native/mobile/comiccoin-wallet/config/index.ts
import { Platform } from "react-native";

// First, let's define our configuration type for better type safety
interface Config {
  AUTHORITY_API_URL: string;
  // Add other configuration values as needed
}

// Helper function to get the correct base URL for development
const getDevelopmentBaseUrl = (): string => {
  if (__DEV__) {
    // Use Platform to detect the OS
    if (Platform.OS === "android") {
      // Use 10.0.2.2 for Android emulator (points to localhost on the host machine)
      return "http://10.0.2.2:8000";
    } else if (Platform.OS === "ios" || Platform.OS === "web") {
      // Use localhost for iOS and web
      return "http://localhost:8000";
    }
  }

  // Default to localhost if platform is not specified or not in development mode
  return "http://localhost:8000";
};

// Development configuration
const developmentConfig: Config = {
  AUTHORITY_API_URL: getDevelopmentBaseUrl(),
};

// Production configuration
const productionConfig: Config = {
  AUTHORITY_API_URL: "https://comiccoinauthority.com",
};

// Here we determine which configuration to use based on the environment
const getConfig = (): Config => {
  // __DEV__ is a global variable in React Native that is true when running in development mode
  if (__DEV__) {
    console.log("Loading development configuration");
    return developmentConfig;
  }

  console.log("Loading production configuration");
  return productionConfig;
};

// Export the configuration as a single instance
const config = getConfig();
export default config;
