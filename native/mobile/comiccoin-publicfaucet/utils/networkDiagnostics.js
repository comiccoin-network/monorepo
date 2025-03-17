// utils/networkDiagnostics.js - Network troubleshooting tool
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import config from "../config";

/**
 * Runs a series of network diagnostics tests to help debug connection issues
 * @returns {Promise<Object>} Diagnostic results
 */
export const runNetworkDiagnostics = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    device: {
      platform: Platform.OS,
      version: Platform.Version,
      model: Platform.OS === "ios" ? "Unknown" : "Unknown Android", // This would need native modules to get more details
    },
    app: {
      version: config.APP_VERSION,
      buildNumber: config.APP_BUILD_NUMBER,
    },
    networkStatus: null,
    connectivityTests: {},
    apiTests: {},
    dnsTests: {},
  };

  try {
    // Test basic network connectivity
    const netInfo = await NetInfo.fetch();
    results.networkStatus = {
      type: netInfo.type,
      isConnected: netInfo.isConnected,
      isInternetReachable: netInfo.isInternetReachable,
      details: netInfo.details || {},
    };

    // Test connection to common services
    const testUrls = [
      { name: "Google", url: "https://www.google.com" },
      {
        name: "ComicCoin API",
        url: `${config.PUBLICFAUCET_URL}/version`,
      },
    ];

    // Test each URL with a timeout
    for (const test of testUrls) {
      try {
        const startTime = Date.now();
        const response = await axios.get(test.url, {
          timeout: 5000,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            "User-Agent": `ComicCoinDiagnostic/${config.APP_VERSION} (${Platform.OS}; ${Platform.Version})`,
          },
        });
        const endTime = Date.now();

        results.connectivityTests[test.name] = {
          success: true,
          status: response.status,
          latency: endTime - startTime,
          error: null,
        };
      } catch (error) {
        results.connectivityTests[test.name] = {
          success: false,
          status: error.response?.status || null,
          error: error.message,
          code: error.code || null,
          timeout: error.code === "ECONNABORTED",
        };
      }
    }

    // Try a DNS lookup via a public API (since direct DNS is not available in React Native)
    try {
      const domains = ["comiccoin.net", "google.com"];

      for (const domain of domains) {
        try {
          // Use a public DNS lookup API
          const startTime = Date.now();
          const response = await axios.get(
            `https://dns.google/resolve?name=${domain}`,
            {
              timeout: 5000,
            },
          );
          const endTime = Date.now();

          results.dnsTests[domain] = {
            success: true,
            latency: endTime - startTime,
            records: response.data?.Answer || [],
            error: null,
          };
        } catch (error) {
          results.dnsTests[domain] = {
            success: false,
            error: error.message,
          };
        }
      }
    } catch (error) {
      results.dnsTests.error = error.message;
    }

    // Test specific API endpoints with authentication
    try {
      // Try to hit the API without authentication (public endpoint)
      const startTime = Date.now();
      const response = await axios.get(
        `${config.PUBLICFAUCET_URL}/publicfaucet/api/v1/faucet/1`,
        {
          timeout: 10000,
        },
      );
      const endTime = Date.now();

      results.apiTests.publicEndpoint = {
        success: true,
        status: response.status,
        latency: endTime - startTime,
        error: null,
      };
    } catch (error) {
      results.apiTests.publicEndpoint = {
        success: false,
        status: error.response?.status || null,
        error: error.message,
        code: error.code || null,
      };
    }
  } catch (error) {
    results.error = error.message;
  }

  console.log(
    "📊 Network Diagnostics Results:",
    JSON.stringify(results, null, 2),
  );
  return results;
};

/**
 * Generates a diagnostic report that can be shared for troubleshooting
 * @returns {string} Report text
 */
export const generateDiagnosticReport = async () => {
  const results = await runNetworkDiagnostics();

  return `
ComicCoin App Network Diagnostic Report
=======================================
Time: ${results.timestamp}
Device: ${results.device.platform} ${results.device.version}
App Version: ${results.app.version} (${results.app.buildNumber})

NETWORK STATUS
-------------
Connection: ${results.networkStatus?.isConnected ? "CONNECTED" : "DISCONNECTED"}
Internet: ${results.networkStatus?.isInternetReachable ? "REACHABLE" : "UNREACHABLE"}
Network Type: ${results.networkStatus?.type}

CONNECTIVITY TESTS
-----------------
${Object.entries(results.connectivityTests)
  .map(
    ([name, test]) =>
      `${name}: ${test.success ? "✅ SUCCESS" : "❌ FAILED"} ${test.latency ? `(${test.latency}ms)` : ""}
    ${test.error ? `Error: ${test.error}` : ""}`,
  )
  .join("\n")}

API TESTS
---------
Public API: ${results.apiTests.publicEndpoint?.success ? "✅ SUCCESS" : "❌ FAILED"}
${results.apiTests.publicEndpoint?.error ? `Error: ${results.apiTests.publicEndpoint.error}` : ""}

DNS TESTS
---------
${Object.entries(results.dnsTests)
  .filter(([key]) => key !== "error")
  .map(
    ([domain, test]) =>
      `${domain}: ${test.success ? "✅ SUCCESS" : "❌ FAILED"} ${test.latency ? `(${test.latency}ms)` : ""}
    ${test.error ? `Error: ${test.error}` : ""}`,
  )
  .join("\n")}

SUMMARY
-------
${
  Object.values(results.connectivityTests).some((test) => test.success)
    ? "Basic internet connectivity appears to be working."
    : "Device cannot connect to internet. Check mobile data or WiFi settings."
}

${
  results.apiTests.publicEndpoint?.success
    ? "API connection successful."
    : "Cannot connect to the ComicCoin API. This may indicate a problem with the service or your network configuration."
}
`;
};

// Add a function to run diagnostics when the app encounters a 524 error
export const handle524Error = async () => {
  console.log("⚠️ Detected a 524 timeout error, running diagnostics...");

  // Run diagnostics
  const report = await generateDiagnosticReport();

  // Log the report
  console.log("📝 Diagnostic Report for 524 Error:");
  console.log(report);

  // Return the report text which could be displayed to the user or sent to a server
  return report;
};
