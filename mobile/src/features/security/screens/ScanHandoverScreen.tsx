// mobile/src/features/security/screens/ScanHandoverScreen.tsx

import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";

import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../../auth/store/authStore";

import { securityApi } from "../services/securityApi";

import styles, { COLORS } from "../styles/SecurityScreen.styles";

// ======================================================
// TYPES
// ======================================================

interface ScanNavigation {
  goBack: () => void;

  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface ScanHandoverScreenProps {
  navigation: ScanNavigation;
}

// ======================================================
// SCREEN
// ======================================================

const ScanHandoverScreen: React.FC<ScanHandoverScreenProps> = ({
  navigation,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [permission, requestPermission] = useCameraPermissions();

  const [isScanning, setIsScanning] = useState(true);

  const [isVerifying, setIsVerifying] = useState(false);

  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // ====================================================
  // PROCESS SCANNED QR
  // ====================================================

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (!isScanning || isVerifying) {
        return;
      }

      const code = result.data.trim();

      if (!code) {
        Alert.alert(
          "Invalid QR Code",
          "The scanned QR code does not contain a valid handover code.",
        );

        return;
      }

      if (!accessToken) {
        Alert.alert(
          "Authentication Required",
          "Please sign in before verifying handovers.",
        );

        return;
      }

      setIsScanning(false);
      setIsVerifying(true);
      setScannedCode(code);

      try {
        const claim = await securityApi.verifyHandoverCode(accessToken, code);

        if (!claim?.id) {
          throw new Error("The server did not return a valid claim.");
        }

        Alert.alert(
          "QR Code Verified",
          "The handover code has been verified. Continue to complete the handover.",
          [
            {
              text: "Continue",
              onPress: () => {
                navigation.navigate("Handover", {
                  claimId: claim.id,
                  handoverCode: code,
                });
              },
            },
          ],
        );
      } catch (error) {
        Alert.alert(
          "Verification Failed",
          securityApi.getSecurityErrorMessage(error),
          [
            {
              text: "Scan Again",
              onPress: () => {
                setScannedCode(null);
                setIsScanning(true);
              },
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: navigation.goBack,
            },
          ],
        );
      } finally {
        setIsVerifying(false);
      }
    },
    [isScanning, isVerifying, accessToken, navigation],
  );

  // ====================================================
  // CAMERA PERMISSION
  // ====================================================

  if (!permission) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Checking camera permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.subHeader}>
          <Pressable onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.subHeaderContent}>
            <Text style={styles.subHeaderTitle}>Scan Handover</Text>

            <Text style={styles.subHeaderSubtitle}>
              Camera permission required
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
          </View>

          <Text style={styles.emptyTitle}>Camera Access Needed</Text>

          <Text style={styles.emptyDescription}>
            Allow camera access to scan QR handover codes and verify item
            ownership.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={[styles.primaryButton, { marginTop: 20 }]}
          >
            <Ionicons name="camera-outline" size={18} color={COLORS.white} />

            <Text style={styles.primaryButtonText}>Allow Camera Access</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={navigation.goBack}
            style={styles.secondaryButton}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // SCANNER UI
  // ====================================================

  return (
    <SafeAreaView style={styles.scannerContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      />

      {/* Overlay */}
      <View pointerEvents="box-none" style={styles.scannerOverlay}>
        {/* Top */}
        <View style={styles.scannerTopBar}>
          <Pressable
            accessibilityRole="button"
            onPress={navigation.goBack}
            style={styles.scannerButton}
          >
            <Ionicons name="arrow-back" size={23} color={COLORS.white} />
          </Pressable>

          <Text
            style={{
              color: COLORS.white,
              fontSize: 15,
              fontWeight: "800",
            }}
          >
            Scan Handover
          </Text>

          <View style={{ width: 54 }} />
        </View>

        {/* Scanning frame */}
        <View style={styles.scannerFrame} />

        <Text style={styles.scannerHint}>
          Position the handover QR code inside the square to scan and verify the
          ownership transfer.
        </Text>

        {/* Bottom */}
        <View style={styles.scannerBottomBar}>
          {isVerifying ? (
            <>
              <ActivityIndicator size="large" color={COLORS.white} />

              <Text
                style={{
                  color: COLORS.white,
                  marginTop: 12,
                  fontSize: 12,
                }}
              >
                Verifying handover code...
              </Text>
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setScannedCode(null);
                setIsScanning(true);
              }}
              style={styles.scannerButton}
            >
              <Ionicons name="refresh" size={24} color={COLORS.white} />
            </Pressable>
          )}

          {scannedCode ? (
            <Text
              style={{
                color: COLORS.white,
                fontSize: 10,
                marginTop: 10,
              }}
            >
              Code scanned
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScanHandoverScreen;
