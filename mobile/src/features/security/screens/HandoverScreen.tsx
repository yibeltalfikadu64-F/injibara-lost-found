// mobile/src/features/security/screens/HandoverScreen.tsx

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../../auth/store/authStore";

import {
  HandoverResult,
  SecurityClaim,
  securityApi,
} from "../services/securityApi";

import styles, { COLORS } from "../styles/SecurityScreen.styles";

// ======================================================
// NAVIGATION TYPES
// ======================================================

interface HandoverRoute {
  params?: {
    claimId?: string;
    handoverCode?: string;
    custodyId?: string;
    itemId?: string;
  };
}

interface HandoverNavigation {
  goBack: () => void;

  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface HandoverScreenProps {
  navigation: HandoverNavigation;
  route: HandoverRoute;
}

// ======================================================
// SCREEN
// ======================================================

const HandoverScreen: React.FC<HandoverScreenProps> = ({
  navigation,
  route,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // ----------------------------------------------------
  // ROUTE PARAMETERS
  // ----------------------------------------------------

  const initialClaimId = route.params?.claimId ?? "";

  const initialHandoverCode = route.params?.handoverCode ?? "";

  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  const [claim, setClaim] = useState<SecurityClaim | null>(null);

  const [handoverCode, setHandoverCode] = useState(initialHandoverCode);

  const [recipientName, setRecipientName] = useState("");

  const [recipientId, setRecipientId] = useState("");

  const [handoverNotes, setHandoverNotes] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isVerifying, setIsVerifying] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVerified, setIsVerified] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [handoverResult, setHandoverResult] = useState<HandoverResult | null>(
    null,
  );

  // ====================================================
  // LOAD CLAIM
  // ====================================================

  const loadClaim = useCallback(async () => {
    if (!accessToken) {
      setError("You must be signed in to complete a handover.");
      setIsLoading(false);
      return;
    }

    if (!initialClaimId && !initialHandoverCode) {
      setError("No claim ID or handover code was provided.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (initialHandoverCode) {
        const verifiedClaim = await securityApi.verifyHandoverCode(
          accessToken,
          initialHandoverCode,
        );

        setClaim(verifiedClaim);
        setIsVerified(Boolean(verifiedClaim?.id));

        if (!verifiedClaim?.id) {
          throw new Error("The handover code could not be linked to a claim.");
        }
      } else {
        const existingClaim = await securityApi.getClaimById(
          accessToken,
          initialClaimId,
        );

        setClaim(existingClaim);
        setIsVerified(false);
      }
    } catch (err) {
      setError(securityApi.getSecurityErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, initialClaimId, initialHandoverCode]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  // ====================================================
  // VERIFY CODE
  // ====================================================

  const handleVerifyCode = async () => {
    if (!accessToken) {
      Alert.alert("Authentication Required", "Please sign in again.");
      return;
    }

    const validation = securityApi.validateHandoverCode(handoverCode);

    if (validation) {
      Alert.alert("Invalid Code", validation);
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const verifiedClaim = await securityApi.verifyHandoverCode(
        accessToken,
        handoverCode.trim(),
      );

      if (!verifiedClaim?.id) {
        throw new Error("The server returned an invalid verification result.");
      }

      if (initialClaimId && verifiedClaim.id !== initialClaimId) {
        throw new Error(
          "This handover code does not match the selected claim.",
        );
      }

      setClaim(verifiedClaim);
      setIsVerified(true);

      Alert.alert(
        "Verification Successful",
        "The handover code has been verified.",
      );
    } catch (err) {
      setIsVerified(false);

      Alert.alert(
        "Verification Failed",
        securityApi.getSecurityErrorMessage(err),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ====================================================
  // COMPLETE HANDOVER
  // ====================================================

  const handleCompleteHandover = async () => {
    if (!accessToken || !claim) {
      Alert.alert("Missing Information", "Claim information is not available.");
      return;
    }

    if (!isVerified) {
      Alert.alert(
        "Verification Required",
        "Verify the handover code before completing the handover.",
      );
      return;
    }

    if (!recipientName.trim()) {
      Alert.alert(
        "Recipient Required",
        "Enter the name of the person receiving the item.",
      );
      return;
    }

    if (!recipientId.trim()) {
      Alert.alert(
        "Recipient ID Required",
        "Enter the recipient university identification number.",
      );
      return;
    }

    if (recipientName.trim().length < 2) {
      Alert.alert(
        "Invalid Recipient Name",
        "Please enter a valid recipient name.",
      );
      return;
    }

    if (recipientId.trim().length < 2) {
      Alert.alert(
        "Invalid Recipient ID",
        "Please enter a valid university identification number.",
      );
      return;
    }

    Alert.alert(
      "Confirm Item Handover",
      `Confirm that "${claim.item?.title ?? "the item"}" is being returned to ${recipientName.trim()}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm Handover",
          onPress: submitHandover,
        },
      ],
    );
  };

  // ====================================================
  // SUBMIT HANDOVER
  // ====================================================

  const submitHandover = async () => {
    if (!accessToken || !claim) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await securityApi.completeHandover(accessToken, {
        claimId: claim.id,
        handoverCode: handoverCode.trim(),
        recipientId: recipientId.trim(),
        recipientName: recipientName.trim(),
        notes: handoverNotes.trim(),
      });

      setHandoverResult(result);

      Alert.alert(
        "Handover Completed",
        "The handover record has been submitted successfully.",
        [
          {
            text: "Done",
            onPress: navigation.goBack,
          },
        ],
      );
    } catch (err) {
      Alert.alert("Handover Failed", securityApi.getSecurityErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================================
  // LOADING STATE
  // ====================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>
            Loading handover information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // ERROR STATE
  // ====================================================

  if (error || !claim) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.subHeader}>
          <Pressable onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.subHeaderContent}>
            <Text style={styles.subHeaderTitle}>Item Handover</Text>

            <Text style={styles.subHeaderSubtitle}>
              Verification and release
            </Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View
            style={[styles.emptyIcon, { backgroundColor: COLORS.dangerLight }]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color={COLORS.danger}
            />
          </View>

          <Text style={styles.emptyTitle}>Unable to Load Claim</Text>

          <Text style={styles.emptyDescription}>
            {error ?? "The requested claim could not be loaded."}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={loadClaim}
            style={[styles.primaryButton, { marginTop: 20 }]}
          >
            <Ionicons name="refresh-outline" size={18} color={COLORS.white} />

            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          <Pressable onPress={navigation.goBack} style={styles.secondaryButton}>
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // CLAIM DETAILS
  // ====================================================

  const item = claim.item;

  const claimant = claim.claimant;

  const claimantName = securityApi.getPersonName(claimant);

  const itemImage = item?.imageUrls?.[0];

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={styles.subHeaderContent}>
          <Text style={styles.subHeaderTitle}>Complete Handover</Text>

          <Text style={styles.subHeaderSubtitle}>
            Verify and record item release
          </Text>
        </View>

        <Ionicons
          name="shield-checkmark-outline"
          size={23}
          color={COLORS.primary}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 45 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Security Handover Verification
          </Text>

          <Text style={styles.sectionDescription}>
            Confirm the ownership claim, verify the handover code, identify the
            recipient, and record the item release.
          </Text>
        </View>

        {/* Item */}
        <View style={styles.verificationCard}>
          <Text style={styles.verificationTitle}>Item Information</Text>

          <View style={styles.itemPreview}>
            {itemImage ? (
              <Image
                source={{ uri: itemImage }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Ionicons
                  name="cube-outline"
                  size={25}
                  color={COLORS.primary}
                />
              </View>
            )}

            <View style={styles.itemPreviewContent}>
              <Text style={styles.itemTitle}>
                {item?.title ?? "Unknown item"}
              </Text>

              <Text style={styles.itemDescription}>
                {item?.description ?? "No item description available."}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Claim ID</Text>

            <Text style={styles.detailValue}>
              {claim.claimNumber ?? claim.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Claim status</Text>

            <Text style={styles.detailValue}>{claim.status}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted by</Text>

            <Text style={styles.detailValue}>{claimantName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Claimant email</Text>

            <Text style={styles.detailValue}>
              {claimant?.email ?? "Not available"}
            </Text>
          </View>
        </View>

        {/* Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Handover Code Verification</Text>

          <Text style={styles.sectionDescription}>
            Enter the code provided for this authorized handover or use the QR
            scanner.
          </Text>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Handover Code *</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={19} color={COLORS.textMuted} />

              <TextInput
                value={handoverCode}
                onChangeText={(value) => {
                  setHandoverCode(value);
                  setIsVerified(false);
                }}
                placeholder="Enter handover code"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isVerifying && !isSubmitting}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isVerifying || isSubmitting || !handoverCode.trim()}
              onPress={handleVerifyCode}
              style={[
                styles.primaryButton,
                (isVerifying || isSubmitting || !handoverCode.trim()) &&
                  styles.disabledButton,
              ]}
            >
              {isVerifying ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={COLORS.white}
                  />

                  <Text style={styles.primaryButtonText}>
                    Verify Handover Code
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => navigation.navigate("ScanHandover")}
              style={styles.secondaryButton}
            >
              <Ionicons
                name="qr-code-outline"
                size={18}
                color={COLORS.primary}
              />

              <Text style={[styles.buttonText, { color: COLORS.primary }]}>
                Scan QR Code Instead
              </Text>
            </Pressable>
          </View>

          {isVerified ? (
            <View style={styles.verificationSuccess}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.success}
              />

              <Text style={styles.verificationSuccessText}>
                Handover code verified successfully.
              </Text>
            </View>
          ) : (
            <View style={styles.verificationWarning}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={COLORS.warning}
              />

              <Text style={styles.verificationWarningText}>
                Do not release the item until the code and recipient have been
                verified.
              </Text>
            </View>
          )}
        </View>

        {/* Recipient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipient Information</Text>

          <Text style={styles.sectionDescription}>
            Record the identity of the person receiving the recovered item.
          </Text>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Recipient Full Name *</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={19}
                color={COLORS.textMuted}
              />

              <TextInput
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Enter recipient full name"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                autoCapitalize="words"
                editable={!isSubmitting}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>University ID Number *</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="card-outline"
                size={19}
                color={COLORS.textMuted}
              />

              <TextInput
                value={recipientId}
                onChangeText={setRecipientId}
                placeholder="Enter university ID number"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Handover Notes</Text>

          <Text style={styles.sectionDescription}>
            Add relevant observations about the release.
          </Text>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Notes (Optional)</Text>

            <TextInput
              value={handoverNotes}
              onChangeText={setHandoverNotes}
              placeholder="Enter any additional handover details..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={1000}
              style={styles.textArea}
              editable={!isSubmitting}
            />

            <Text style={styles.helperText}>
              {handoverNotes.length}/1000 characters
            </Text>
          </View>
        </View>

        {/* Confirmation notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="warning-outline" size={21} color={COLORS.warning} />

          <Text style={styles.verificationWarningText}>
            Only complete the handover after physically confirming the
            recipient's identity and following your campus security procedures.
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          accessibilityRole="button"
          disabled={
            isSubmitting ||
            !isVerified ||
            !recipientName.trim() ||
            !recipientId.trim() ||
            Boolean(handoverResult)
          }
          onPress={handleCompleteHandover}
          style={[
            styles.primaryButton,
            {
              minHeight: 54,
              marginTop: 25,
            },
            (!isVerified ||
              !recipientName.trim() ||
              !recipientId.trim() ||
              isSubmitting ||
              Boolean(handoverResult)) &&
              styles.disabledButton,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={21}
                color={COLORS.white}
              />

              <Text style={styles.primaryButtonText}>
                Complete Item Handover
              </Text>
            </>
          )}
        </Pressable>

        {handoverResult ? (
          <View style={styles.verificationSuccess}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color={COLORS.success}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.verificationSuccessText}>
                Handover successfully recorded.
              </Text>

              <Text style={styles.helperText}>
                Record ID: {handoverResult.id}
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={navigation.goBack}
          style={styles.secondaryButton}
        >
          <Text style={styles.buttonText}>Cancel and Go Back</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Injibara Campus Lost & Found</Text>

          <Text style={styles.footerText}>Security Handover Management</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HandoverScreen;
