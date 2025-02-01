// monorepo/native/mobile/comiccoin-wallet/app/(user)/receive.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Copy,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  ExternalLink,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useWallet } from "../../hooks/useWallet";

// Define navigation types for type safety
type RootStackParamList = {
  Login: undefined;
  Receive: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReceiveScreen: React.FC = () => {
  const router = useRouter();
  const { currentWallet, loading: serviceLoading } = useWallet();
  const [copied, setCopied] = useState(false);
  const [qrRef, setQrRef] = useState<any>(null);

  // Handle copying wallet address to clipboard
  const handleCopyAddress = useCallback(async () => {
    if (currentWallet?.address) {
      await Clipboard.setStringAsync(currentWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [currentWallet?.address]);

  // Handle sharing wallet address
  const handleShare = useCallback(async () => {
    if (currentWallet?.address) {
      try {
        await Share.share({
          message: `My ComicCoin wallet address: ${currentWallet.address}`,
        });
      } catch (error) {
        console.log("Error sharing address:", error);
      }
    }
  }, [currentWallet?.address]);

  // Handle downloading QR code
  const handleDownloadQR = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save the QR code",
        );
        return;
      }

      if (qrRef) {
        const uri = await qrRef.toDataURL();
        const fileUri = `${FileSystem.documentDirectory}qr-code.png`;
        await FileSystem.writeAsStringAsync(fileUri, uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert("Success", "QR code saved to your photos");
      }
    } catch (error) {
      console.log("Error saving QR code:", error);
      Alert.alert("Error", "Failed to save QR code");
    }
  }, [qrRef]);

  // Handle printing QR code
  const handlePrintQR = useCallback(async () => {
    try {
      if (qrRef && currentWallet?.address) {
        const uri = await qrRef.toDataURL();
        const html = `
          <html>
            <head>
              <style>
                body { display: flex; flex-direction: column; align-items: center; padding: 20px; }
                .qr-container { margin-bottom: 20px; }
                .address { font-family: monospace; font-size: 14px; color: #374151; }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <img src="data:image/png;base64,${uri}" width="300" height="300"/>
              </div>
              <div class="address">${currentWallet.address}</div>
            </body>
          </html>
        `;

        await Print.printAsync({ html });
      }
    } catch (error) {
      console.log("Error printing QR code:", error);
      Alert.alert("Error", "Failed to print QR code");
    }
  }, [qrRef, currentWallet?.address]);

  // Show loading state while fetching wallet data
  if (serviceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  // Redirect to login if no wallet is found
  if (!currentWallet) {
    router.replace("/login");
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Receive ComicCoins</Text>
              <Text style={styles.subtitle}>
                Accept ComicCoins and NFTs to your wallet
              </Text>
            </View>

            {/* QR Code Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <QrCode size={20} color="#7C3AED" />
                </View>
                <Text style={styles.cardTitle}>Receive ComicCoins</Text>
              </View>

              {/* QR Code Display */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={currentWallet.address}
                  size={240}
                  getRef={(ref) => setQrRef(ref)}
                />

                {/* QR Code Actions */}
                <View style={styles.qrActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handlePrintQR}
                  >
                    <Printer size={20} color="#4B5563" />
                    <Text style={styles.actionButtonText}>Print</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDownloadQR}
                  >
                    <Download size={20} color="#4B5563" />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Wallet Address Section */}
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Your Wallet Address</Text>
                <View style={styles.addressInputContainer}>
                  <TextInput
                    style={styles.addressInput}
                    value={currentWallet.address}
                    editable={false}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyAddress}
                  >
                    {copied ? (
                      <CheckCircle2 size={20} color="#7C3AED" />
                    ) : (
                      <Copy size={20} color="#7C3AED" />
                    )}
                    <Text style={styles.copyButtonText}>
                      {copied ? "Copied!" : "Copy"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Text style={styles.shareButtonText}>Share Address</Text>
                <ExternalLink size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Promotional Message */}
              <View style={styles.promoContainer}>
                <Text style={styles.promoText}>
                  Want to earn free ComicCoins? Visit ComicCoin Faucet
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const Card = ({ children, style }) => (
  <View style={[styles.cardWrapper, style]}>
    <View style={styles.card}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", // Light purple background
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  content: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  cardWrapper: {
    ...Platform.select({
      android: {
        elevation: 4,
        backgroundColor: "transparent",
        borderRadius: 16,
        marginVertical: 1,
        marginHorizontal: 1,
      },
    }),
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconContainer: {
    padding: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  qrContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginVertical: 16,
    overflow: "hidden",
  },
  qrActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  actionButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  addressContainer: {
    marginTop: 24,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  addressInput: {
    flex: 1,
    padding: 12,
    color: "#111827",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    gap: 8,
    marginLeft: 8,
    overflow: "hidden",
    borderWidth: Platform.OS === "android" ? 1 : 0,
    borderColor: "#E5E7EB",
  },
  copyButtonText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "500",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
    overflow: "hidden",
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  promoContainer: {
    marginTop: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  promoText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
});

export default ReceiveScreen;
