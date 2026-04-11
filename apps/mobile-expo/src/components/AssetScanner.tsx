// @ts-ignore
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
// @ts-ignore
import { CameraView, useCameraPermissions } from 'expo-camera';
// @ts-ignore
import { QrCode, X } from 'lucide-react-native';
// @ts-ignore
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';

export const AssetScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const setAssetId = useAppStore((s: any) => s.setAssetId);
  const assetId = useAppStore((s: any) => s.assetId);

  if (!permission) return null;

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Task 4: Haptic Confirmation for Asset Binding
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAssetId(data);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.bindButton, assetId ? styles.bound : null]}
        onPress={() => {
          if (!permission.granted) {
            requestPermission();
          } else {
            setModalVisible(true);
          }
        }}
      >
        <QrCode size={20} color={assetId ? "#18C29C" : "#D4AF37"} />
        <Text style={[styles.bindText, assetId ? { color: "#18C29C" } : null]}>
          {assetId ? `ASSET: ${assetId}` : "BIND ASSET (REQUIRED)"}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cameraContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SCAN ASSET QR</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#EAF2FF" />
              </TouchableOpacity>
            </View>
            
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
            
            <View style={styles.modalFooter}>
              <Text style={styles.instruction}>Point camera at the vehicle or gear QR code</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 16,
  },
  bindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0B1B32',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 16,
    borderRadius: 12,
    height: 56,
  },
  bound: {
    borderColor: '#18C29C',
    backgroundColor: 'rgba(24, 194, 156, 0.1)',
  },
  bindText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 17, 31, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '90%',
    height: '70%',
    backgroundColor: '#0B1B32',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0E2442',
  },
  modalTitle: {
    color: '#EAF2FF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  camera: {
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0E2442',
  },
  instruction: {
    color: '#A9B9D6',
    fontSize: 12,
    textAlign: 'center',
  },
});
