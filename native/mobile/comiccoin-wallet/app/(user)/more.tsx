import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { History, Droplets, ExternalLink } from "lucide-react-native";
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
      route: "/(transactions)/",
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
      Alert.alert(
        "Open External Link",
        `You'll be redirected to ${option.route} in your default browser. Do you want to continue?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open",
            onPress: async () => {
              try {
                const supported = await Linking.canOpenURL(option.route);
                if (supported) {
                  await Linking.openURL(option.route);
                } else {
                  Alert.alert("Error", "Cannot open this URL");
                }
              } catch (error) {
                Alert.alert("Error", "Failed to open the link");
              }
            },
          },
        ],
        { cancelable: true },
      );
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
                <View style={styles.itemHeader}>
                  <View style={styles.iconContainer}>{option.icon}</View>
                  {option.isExternal && (
                    <View style={styles.externalBadge}>
                      <ExternalLink size={12} color="#6B7280" />
                      <Text style={styles.externalBadgeText}>
                        External Link
                      </Text>
                    </View>
                  )}
                </View>
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#F3E8FF",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  externalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  externalBadgeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
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
