// monorepo/native/mobile/comiccoin-publicfaucet/config/index.ts
import { Platform } from "react-native";

// First, let's define our configuration type for better type safety
interface Config {
  AUTHORITY_API_URL: string;
  IPFS_GATEWAY_URL: string;
  PUBLICFAUCET_URL: string;
  // Add other configuration values as needed
}

// Helper function to get the correct base URL for development
const getDevelopmentBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8000";
    } else if (Platform.OS === "ios" || Platform.OS === "web") {
      return "http://localhost:8000";
    }
  }
  return "http://localhost:8000";
};

// Helper function to get IPFS gateway URL for development
const getDevelopmentIPFSUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://10.0.2.2:9000";
    } else if (Platform.OS === "ios" || Platform.OS === "web") {
      return "http://localhost:9000";
    }
  }
  return "http://localhost:9000";
};

// Development configuration
const developmentConfig: Config = {
  AUTHORITY_API_URL: getDevelopmentBaseUrl(),
  IPFS_GATEWAY_URL: getDevelopmentIPFSUrl(),
  PUBLICFAUCET_URL: getDevelopmentBaseUrl(),
};

// Production configuration
const productionConfig: Config = {
  AUTHORITY_API_URL: "https://comiccoin.net",
  IPFS_GATEWAY_URL: "https://nftstorage.com",
  PUBLICFAUCET_URL: "https://comiccoin.net",
};

// Here we determine which configuration to use based on the environment
const getConfig = (): Config => {
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
