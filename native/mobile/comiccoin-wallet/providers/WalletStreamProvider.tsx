// monorepo/native/mobile/comiccoin-wallet/components/WalletStreamProvider.tsx
import { useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useWalletTransactionMonitor } from "../hooks/useWalletTransactionMonitor";

export function WalletStreamProvider() {
  const { currentWallet } = useWallet();

  useWalletTransactionMonitor({
    walletAddress: currentWallet?.address,
    debugMode: true,
  });

  useEffect(() => {
    if (currentWallet?.address) {
      console.log("🌊 WalletStreamProvider initialized", {
        address: currentWallet.address.slice(0, 6),
      });
    }
    return () => {
      console.log("🔌 WalletStreamProvider cleanup");
    };
  }, [currentWallet?.address]);

  return null;
}
