import { View, Text } from "react-native";
import { useWalletTransactions } from "../hooks/useWalletTransactions";
import { useNFTTransactions } from "../hooks/useNFTTransactions";
import { useCoinTransactions } from "../hooks/useCoinTransactions";
import { useAllTransactions } from "../hooks/useAllTransactions";

export default function Overview() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Overview Screen</Text>
    </View>
  );
}
