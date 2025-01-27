// monorepo/native/mobile/comiccoin-wallet/app/(user)/more.tsx
// monorepo/native/mobile/comiccoin-wallet/app/(user)/more.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { History, Droplets } from "lucide-react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

interface MenuOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
  description: string;
  isExternal?: boolean;
}

export default function More() {
  const router = useRouter();

  const menuOptions: MenuOption[] = [
    {
      id: "transactions",
      title: "Transactions",
      icon: <History size={24} color="#7C3AED" />,
      route: "/(transactions)/", // Note: Changed this route
      description: "View your transaction history",
      isExternal: false,
    },
    {
      id: "faucet",
      title: "ComicCoin Faucet",
      icon: <Droplets size={24} color="#7C3AED" />,
      route: "https://comiccoinfaucet.com",
      description: "Get free coins for your wallet",
      isExternal: true,
    },
  ];

  const handleOptionPress = async (option: MenuOption) => {
    if (option.isExternal) {
      try {
        const supported = await Linking.canOpenURL(option.route);
        if (supported) {
          await Linking.openURL(option.route);
        } else {
          console.error("Cannot open URL:", option.route);
        }
      } catch (error) {
        console.error("Error opening URL:", error);
      }
    } else {
      router.push(option.route);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>More Options</Text>
            <Text style={styles.headerSubtitle}>
              Access additional features and settings
            </Text>
          </View>

          <View style={styles.grid}>
            {menuOptions.map((option) => (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.gridItem,
                  pressed && styles.gridItemPressed,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <View style={styles.iconContainer}>{option.icon}</View>
                <Text style={styles.itemTitle}>{option.title}</Text>
                <Text style={styles.itemDescription}>{option.description}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  grid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gridItemPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    backgroundColor: "#F3E8FF",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
});
