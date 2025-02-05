// monorepo/native/mobile/comiccoin-wallet/components/BackgroundFetchDebugger.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import {
  getBackgroundFetchStatus,
  registerBackgroundFetch,
  unregisterBackgroundFetch,
} from "../services/transaction/BackgroundTransactionService";

interface BackgroundFetchStatus {
  status: BackgroundFetch.BackgroundFetchStatus;
  isRegistered: boolean;
  statusName: string;
  activeWallet: string | null;
}

export function BackgroundFetchDebugger() {
  const [status, setStatus] = useState<BackgroundFetchStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const checkStatus = async () => {
    const currentStatus = await getBackgroundFetchStatus();
    setStatus(currentStatus);
    setLastUpdate(new Date().toISOString());
  };

  useEffect(() => {
    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFetch = async () => {
    try {
      if (status?.isRegistered) {
        await unregisterBackgroundFetch();
      } else {
        await registerBackgroundFetch();
      }
      await checkStatus();
    } catch (error) {
      console.log("Error toggling background fetch:", error);
    }
  };

  if (!status) {
    return (
      <View style={styles.container}>
        <Text>Loading status...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.title}>Background Fetch Status</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  status.status ===
                  BackgroundFetch.BackgroundFetchStatus.Available
                    ? "green"
                    : "red",
              },
            ]}
          >
            {status.statusName}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Registered:</Text>
          <Text
            style={[
              styles.value,
              { color: status.isRegistered ? "green" : "red" },
            ]}
          >
            {status.isRegistered ? "Yes" : "No"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Active Wallet:</Text>
          <Text style={styles.value}>
            {status.activeWallet ? `${status.activeWallet}...` : "None"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Last Update:</Text>
          <Text style={styles.value}>
            {new Date(lastUpdate).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={
              status.isRegistered
                ? "Unregister Background Fetch"
                : "Register Background Fetch"
            }
            onPress={handleToggleFetch}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Refresh Status" onPress={checkStatus} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statusContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    width: 100,
  },
  value: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
