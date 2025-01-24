// monorepo/native/mobile/comiccoin-wallet/utils/base64Utils.ts
import { Buffer as BufferPolyfill } from "buffer";

export const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  // Create chunks to handle large files
  const chunkSize = 1024 * 1024; // 1MB chunks
  const chunks: string[] = [];

  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, Math.min(i + chunkSize, buffer.length));
    chunks.push(BufferPolyfill.from(chunk).toString("base64"));
  }

  return chunks.join("");
};
