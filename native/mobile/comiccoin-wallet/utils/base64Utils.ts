// monorepo/native/mobile/comiccoin-wallet/utils/base64Utils.ts
export const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  // First verify we have data
  if (buffer.length === 0) {
    console.warn("Received empty buffer for base64 conversion");
    return "";
  }

  // Convert to base64 in chunks to handle large images
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 1024; // Process 1KB at a time

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    chunk.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
  }

  // Use btoa for base64 encoding
  try {
    return btoa(binary);
  } catch (error) {
    console.error("Base64 encoding failed:", error);
    throw new Error("Failed to encode image data to base64");
  }
};
