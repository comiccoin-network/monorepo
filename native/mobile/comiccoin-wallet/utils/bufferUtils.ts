// monorepo/native/mobile/comiccoin-wallet/utils/bufferUtils.ts
export const chunkArray = (
  array: Uint8Array,
  chunkSize: number = 1024 * 1024,
): Uint8Array[] => {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const processLargeBuffer = (buffer: Uint8Array): string => {
  // Process the buffer in chunks to avoid memory issues
  const chunks = chunkArray(buffer);
  let result = "";
  for (const chunk of chunks) {
    result += Buffer.from(chunk).toString("base64");
  }
  return result;
};
