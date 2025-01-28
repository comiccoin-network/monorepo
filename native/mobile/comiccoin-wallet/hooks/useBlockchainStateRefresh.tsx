// monorepo/native/mobile/comiccoin-wallet/hooks/useBlockchainStateRefresh.ts
import { useEffect, useCallback, useState } from "react";
import { Platform } from "react-native";

interface UseBlockchainStateRefreshOptions {
  onStateChange?: () => Promise<void> | void;
}

export const useBlockchainStateRefresh = (
  options: UseBlockchainStateRefreshOptions = {},
) => {
  const { onStateChange } = options;
  const [lastKnownHash, setLastKnownHash] = useState<string | null>(null);

  const handleStateChange = useCallback(
    async (event: any) => {
      const newHash = event.detail?.latestHash;

      if (newHash && newHash !== lastKnownHash) {
        setLastKnownHash(newHash);
        if (onStateChange) {
          await onStateChange();
        }
      }
    },
    [lastKnownHash, onStateChange],
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      window.addEventListener("blockchainStateChanged", handleStateChange);
      return () => {
        window.removeEventListener("blockchainStateChanged", handleStateChange);
      };
    } else {
      // For React Native, we'll need to use DeviceEventEmitter or similar
      const { EventEmitter } = require("react-native");
      const emitter = new EventEmitter();
      emitter.addListener("blockchainStateChanged", handleStateChange);
      return () => {
        emitter.removeListener("blockchainStateChanged", handleStateChange);
      };
    }
  }, [handleStateChange]);
};
