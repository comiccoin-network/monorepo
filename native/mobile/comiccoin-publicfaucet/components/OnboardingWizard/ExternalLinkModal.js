// components/OnboardingWizard/ExternalLinkModal.js
import React from "react";
import { View, Text, TouchableOpacity, Modal, Linking } from "react-native";
import styles from "./styles";

const ExternalLinkModal = ({ visible, onClose, url, title = "" }) => {
  const handleConfirm = async () => {
    onClose();
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Text style={styles.modalIcon}>↗️</Text>
          </View>

          <Text style={styles.modalTitle}>Open External Link</Text>

          <Text style={styles.modalText}>
            You are about to leave this app to open:
          </Text>

          <Text style={styles.modalLinkText}>{url}</Text>

          <Text style={styles.modalText}>Continue?</Text>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSecondaryButton]}
              onPress={onClose}
            >
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.modalPrimaryButtonText}>Open</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExternalLinkModal;
