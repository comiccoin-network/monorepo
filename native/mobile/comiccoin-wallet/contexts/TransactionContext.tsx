// monorepo/native/mobile/comiccoin-wallet/contexts/TransactionContext.tsx
import React, { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWalletTransactionMonitor } from "../hooks/useWalletTransactionMonitor";
import { useWallet } from "../hooks/useWallet";
import UserTransactionBanner from "../components/UserTransactionBanner";

const TransactionContext = createContext<{
  queryClient: QueryClient;
}>({
  queryClient: new QueryClient(),
});

export const useTransactionContext = () => useContext(TransactionContext);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const { currentWallet } = useWallet();

  // Initialize transaction monitor once at the top level
  useWalletTransactionMonitor({
    walletAddress: currentWallet?.address,
  });

  return (
    <TransactionContext.Provider value={{ queryClient }}>
      <QueryClientProvider client={queryClient}>
        {/* Single instance of UserTransactionBanner */}
        <UserTransactionBanner />
        {children}
      </QueryClientProvider>
    </TransactionContext.Provider>
  );
}
