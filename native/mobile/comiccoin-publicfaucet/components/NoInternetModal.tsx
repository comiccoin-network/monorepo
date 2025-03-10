// monorepo/native/mobile/comiccoin-wallet/components/NoInternetModal.tsx
import React from "react";
import { Modal, View, Text, StyleSheet, Platform } from "react-native";
import { WifiOff, Wifi } from "lucide-react-native";

interface NoInternetModalProps {
  visible: boolean;
}

export default function NoInternetModal({ visible }: NoInternetModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <View style={styles.iconInner}>
              <WifiOff size={40} color="#DC2626" />
            </View>
          </View>

          <Text style={styles.title}>No Internet Connection</Text>

          <Text style={styles.message}>
            Please check your connection to continue using the app
          </Text>

          <View style={styles.divider} />

          <View style={styles.statusContainer}>
            <View style={styles.statusIconContainer}>
              <Wifi size={18} color="#6B7280" />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Waiting for Network</Text>
              <Text style={styles.statusMessage}>
                We'll automatically reconnect when your internet is back
              </Text>
            </View>
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Try checking your Wi-Fi connection or mobile data
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    width: "100%",
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  helpContainer: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: "100%",
  },
  helpText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 18,
  },
});
