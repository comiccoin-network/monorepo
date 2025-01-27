// monorepo/native/mobile/comiccoin-wallet/utils/byteUtils.ts
/**
 * Converts a base64 string to hex string
 * @param {string} base64 - Base64 encoded string
 * @returns {string} - Hex string with '0x' prefix
 */
export function base64ToHex(base64) {
  try {
    // First decode base64 to binary string
    const binaryString = window.atob(base64);
    // Convert binary string to hex
    const hexString = Array.from(binaryString)
      .map((byte) => ("0" + byte.charCodeAt(0).toString(16)).slice(-2))
      .join("");
    return `0x${hexString}`;
  } catch (e) {
    return "Invalid format";
  }
}

/**
 * Format bytes data for display
 * @param {string} bytes - Base64 encoded string
 * @returns {string} - Formatted hex string or 'N/A'
 */
export function formatBytes(bytes) {
  if (!bytes) return "N/A";
  return base64ToHex(bytes);
}
