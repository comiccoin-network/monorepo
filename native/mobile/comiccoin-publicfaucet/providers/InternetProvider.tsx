// monorepo/native/mobile/comiccoin-wallet/providers/InternetProvider.tsx
import React, { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import NoInternetModal from "../components/NoInternetModal";

interface InternetProviderProps {
  children: React.ReactNode;
}

export default function InternetProvider({ children }: InternetProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
      {children}
      <NoInternetModal visible={!isConnected} />
    </>
  );
}
