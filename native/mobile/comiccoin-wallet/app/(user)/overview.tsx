// monorepo/native/mobile/comiccoin-wallet/app/(user)/overview.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Copy as CopyIcon,
  RefreshCcw,
  AlertCircle,
  Wallet as WalletIcon,
  Coins as CoinsIcon,
  Image as ImageIcon,
} from "lucide-react-native";

import { useWallet } from "../../hooks/useWallet";
import { useAllTransactions } from "../../hooks/useAllTransactions";
import { useWalletTransactionMonitor } from "../../hooks/useWalletTransactionMonitor";
import { walletTransactionEventEmitter } from "../../utils/eventEmitter";

import walletService from "../../services/wallet/WalletService";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import TransactionList from "../../components/TransactionList";

// Define navigation types for type safety in our router usage
type RootStackParamList = {
  Login: undefined;
  Transaction: { id: string };
  Transactions: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Main Dashboard component
const Dashboard: React.FC = () => {
  useEffect(() => {
    const listener = (data: { walletAddress: string }) => {
      console.log(
        `🚀 New transaction for wallet: ${data.walletAddress} in Dashboard`,
      );
      // Refresh transaction list
    };

    walletTransactionEventEmitter.on("newTransaction", listener);

    return () => {
      walletTransactionEventEmitter.off("newTransaction", listener);
    };
  }, []);

  return (
    <View>
      <Text>Dashboard</Text>
    </View>
  );
};

export default Dashboard;
