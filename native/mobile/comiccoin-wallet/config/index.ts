// monorepo/native/mobile/comiccoin-wallet/config/index.ts

// First, let's define our configuration type for better type safety
interface Config {
  AUTHORITY_API_URL: string;
  // Add other configuration values as needed
}

// Development configuration
const developmentConfig: Config = {
  AUTHORITY_API_URL: "http://localhost:8000",
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
