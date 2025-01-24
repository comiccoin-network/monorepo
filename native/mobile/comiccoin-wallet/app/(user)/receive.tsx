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
import { useNavigation } from "@react-navigation/native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWallet } from "../../hooks/useWallet";

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  Receive: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 60;

const ReceiveScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
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
        console.error("Error sharing address:", error);
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
      console.error("Error saving QR code:", error);
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
      console.error("Error printing QR code:", error);
      Alert.alert("Error", "Failed to print QR code");
    }
  }, [qrRef, currentWallet?.address]);

  if (serviceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  if (!currentWallet) {
    navigation.replace("Login");
    return null;
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: TAB_BAR_HEIGHT + 16 + insets.bottom,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
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

          {/* QR Code */}
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

          {/* Wallet Address */}
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
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
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
    borderRadius: 8,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
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
  },
  qrActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },
  addressContainer: {
    marginTop: 24,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addressInput: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
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
  },
  copyButtonText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "500",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
