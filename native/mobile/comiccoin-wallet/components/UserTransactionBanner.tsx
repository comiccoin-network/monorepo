import React, { useEffect } from "react";
import { walletTransactionEventEmitter } from "../utils/eventEmitter";
import { View, Text } from "react-native";

const UserTransactionBanner = () => {
  useEffect(() => {
    const listener = (data: { walletAddress: string }) => {
      console.log(
        `📢 Transaction detected in UserTransactionBanner: ${data.walletAddress}`,
      );
      // Refresh any relevant UI elements here
    };

    walletTransactionEventEmitter.on("newTransaction", listener);

    return () => {
      walletTransactionEventEmitter.off("newTransaction", listener);
    };
  }, []);

  return (
    <View>
      <Text>Menu</Text>
    </View>
  );
};

export default UserTransactionBanner;
