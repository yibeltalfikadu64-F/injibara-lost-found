// mobile/src/features/claims/screens/ClaimFormScreen.tsx

import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuthStore } from "../../auth/store/authStore";
import VerificationQuestions from "../components/VerificationQuestions";
import claimsApi, {
  ClaimsApiError,
  type VerificationAnswer,
} from "../services/claimsApi";
import {
  CLAIM_COLORS,
  claimsScreenStyles as shared,
} from "../styles/ClaimsScreen.styles";

type ClaimsStackParamList = {
  ClaimForm: {
    itemId: string;
    itemTitle?: string;
  };
  ClaimDetails: {
    claimId: string;
  };
};

type Props = NativeStackScreenProps<ClaimsStackParamList, "ClaimForm">;

const ClaimFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId, itemTitle } = route.params;
  const accessToken = useAuthStore((state: any) => state.accessToken);

  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [answers, setAnswers] = useState<VerificationAnswer[]>([
    {
      question: "What makes this item uniquely yours?",
      answer: "",
    },
    {
      question: "Can you describe a feature that is not visible in the photos?",
      answer: "",
    },
    {
      question: "What was inside or attached to this item?",
      answer: "",
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const descriptionCount = description.length;

  const isFormValid = useMemo(() => {
    return (
      itemId.trim().length > 0 &&
      description.trim().length >= 10 &&
      answers.every((answer) => answer.answer.trim().length > 0)
    );
  }, [itemId, description, answers]);

  const updateVerificationAnswers = (nextAnswers: VerificationAnswer[]) => {
    setAnswers(nextAnswers);
    setFormError("");
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!accessToken) {
      Alert.alert(
        "Sign in required",
        "Please sign in again before submitting your claim.",
      );
      return;
    }

    const payload = {
      itemId,
      description: description.trim(),
      contactPhone: contactPhone.trim() || undefined,
      verificationAnswers: answers.map((answer) => ({
        question: answer.question.trim(),
        answer: answer.answer.trim(),
      })),
    };

    const validationErrors = claimsApi.validateClaimPayload(payload);

    if (validationErrors.length > 0) {
      setFormError(validationErrors[0]);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const claim = await claimsApi.createClaim(payload, accessToken);

      Alert.alert(
        "Claim submitted",
        "Your claim has been submitted successfully. You can track its progress from My Claims.",
        [
          {
            text: "View claim",
            onPress: () => {
              navigation.replace("ClaimDetails", {
                claimId: claim.id,
              });
            },
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof ClaimsApiError
          ? error.message
          : "Unable to submit your claim. Please try again.";

      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={shared.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <Text style={styles.eyebrow}>INJIBARA CAMPUS LOST & FOUND</Text>

          <Text style={shared.screenTitle}>Submit a claim</Text>

          <Text style={shared.screenSubtitle}>
            Provide information that helps verify that the reported item belongs
            to you.
          </Text>
        </View>

        <View style={styles.itemCard}>
          <View style={styles.itemIcon}>
            <Text style={styles.itemIconText}>📦</Text>
          </View>

          <View style={styles.itemDetails}>
            <Text style={styles.itemLabel}>ITEM YOU ARE CLAIMING</Text>

            <Text style={styles.itemTitle}>
              {itemTitle || "Selected found item"}
            </Text>

            <Text style={styles.itemId}>Reference: {itemId}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Your explanation</Text>

          <Text style={shared.inputLabel}>
            Why does this item belong to you? *
          </Text>

          <TextInput
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              setFormError("");
            }}
            multiline
            maxLength={2000}
            textAlignVertical="top"
            placeholder="Explain when and where you lost the item. Include any details that can help verify your ownership."
            placeholderTextColor="#98A2B3"
            style={shared.textArea}
          />

          <Text style={styles.counter}>{descriptionCount}/2000 characters</Text>
        </View>

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Contact information</Text>

          <Text style={shared.inputLabel}>Phone number (optional)</Text>

          <TextInput
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
            maxLength={20}
            placeholder="+251 9XX XXX XXX"
            placeholderTextColor="#98A2B3"
            style={shared.input}
          />

          <Text style={styles.helper}>
            Provide a phone number where authorized campus staff can contact
            you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Verification questions</Text>

          <VerificationQuestions
            value={answers}
            onChange={updateVerificationAnswers}
            disabled={submitting}
          />
        </View>

        <View style={styles.privacyNotice}>
          <Text style={styles.privacyIcon}>🛡️</Text>

          <Text style={styles.privacyText}>
            Your answers are submitted for ownership verification. Do not
            include passwords, PINs, or other sensitive account information.
          </Text>
        </View>

        {!!formError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        )}

        <View style={styles.buttons}>
          <Text style={styles.validationHint}>
            {isFormValid
              ? "Your required information is complete."
              : "Complete the required fields before submitting."}
          </Text>

          <View
            style={[
              shared.primaryButton,
              !isFormValid && styles.buttonNotReady,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text onPress={handleSubmit} style={shared.primaryButtonText}>
                Submit ownership claim
              </Text>
            )}
          </View>

          <Text onPress={() => navigation.goBack()} style={styles.cancelText}>
            Cancel and go back
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 45,
  },
  topHeader: {
    marginBottom: 20,
  },
  eyebrow: {
    color: CLAIM_COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconText: {
    fontSize: 25,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemLabel: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  itemTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  itemId: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 10,
  },
  section: {
    marginBottom: 23,
  },
  counter: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 10,
    textAlign: "right",
    marginTop: 6,
  },
  helper: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },
  privacyNotice: {
    flexDirection: "row",
    gap: 10,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#EAF3FF",
    marginBottom: 17,
  },
  privacyIcon: {
    fontSize: 19,
  },
  privacyText: {
    flex: 1,
    color: "#315A86",
    fontSize: 11,
    lineHeight: 18,
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: CLAIM_COLORS.dangerLight,
    marginBottom: 15,
  },
  errorText: {
    color: CLAIM_COLORS.danger,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  buttons: {
    gap: 12,
  },
  validationHint: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  buttonNotReady: {
    opacity: 0.55,
  },
  cancelText: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    padding: 10,
  },
});

export default ClaimFormScreen;
