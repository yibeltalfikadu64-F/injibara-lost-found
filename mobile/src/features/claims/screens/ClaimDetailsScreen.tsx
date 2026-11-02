// mobile/src/features/claims/screens/ClaimDetailsScreen.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuthStore } from "../../auth/store/authStore";
import ClaimStatusBadge from "../components/ClaimStatusBadge";
import HandoverCode from "../components/HandoverCode";
import claimsApi, { ClaimsApiError, type Claim } from "../services/claimsApi";
import {
  CLAIM_COLORS,
  claimsScreenStyles as shared,
} from "../styles/ClaimsScreen.styles";

type ClaimsStackParamList = {
  ClaimDetails: {
    claimId: string;
  };
  ClaimTimeline: {
    claimId: string;
  };
};

type Props = NativeStackScreenProps<ClaimsStackParamList, "ClaimDetails">;

const ClaimDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { claimId } = route.params;

  const accessToken = useAuthStore((state: any) => state.accessToken);

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadClaim = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError("Please sign in again to view this claim.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const result = await claimsApi.getClaimById(claimId, accessToken);

        setClaim(result);
      } catch (err) {
        setError(
          err instanceof ClaimsApiError
            ? err.message
            : "Unable to load claim details.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, claimId],
  );

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  const handleCancel = () => {
    if (!claim || cancelling) return;

    Alert.alert(
      "Cancel this claim?",
      "Are you sure you want to cancel your ownership claim? This action may not be reversible.",
      [
        {
          text: "Keep claim",
          style: "cancel",
        },
        {
          text: "Cancel claim",
          style: "destructive",
          onPress: async () => {
            if (!accessToken) return;

            try {
              setCancelling(true);

              const updated = await claimsApi.cancelClaim(
                claim.id,
                accessToken,
                "Cancelled by claimant",
              );

              setClaim(updated);

              Alert.alert("Claim cancelled", "Your claim has been cancelled.");
            } catch (err) {
              Alert.alert(
                "Unable to cancel",
                err instanceof ClaimsApiError
                  ? err.message
                  : "Please try again.",
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handleHandoverSubmit = async (code: string) => {
    if (!accessToken || !claim) return;

    try {
      setHandoverLoading(true);

      const updated = await claimsApi.confirmHandover(
        claim.id,
        code,
        accessToken,
      );

      setClaim(updated);

      Alert.alert(
        "Handover confirmed",
        "The handover confirmation was accepted by the server.",
      );
    } catch (err) {
      Alert.alert(
        "Confirmation failed",
        err instanceof ClaimsApiError
          ? err.message
          : "The handover code could not be verified.",
      );
    } finally {
      setHandoverLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!accessToken || !claim) return;

    try {
      setRequestingCode(true);

      const result = await claimsApi.requestHandoverCode(claim.id, accessToken);

      Alert.alert(
        "Request submitted",
        result.message ||
          "Your handover code request has been submitted. Follow the instructions from authorized campus staff.",
      );

      await loadClaim(true);
    } catch (err) {
      Alert.alert(
        "Unable to request code",
        err instanceof ClaimsApiError ? err.message : "Please try again later.",
      );
    } finally {
      setRequestingCode(false);
    }
  };

  if (loading && !claim) {
    return (
      <View style={shared.loadingContainer}>
        <ActivityIndicator size="large" color={CLAIM_COLORS.primary} />
        <Text style={shared.loadingText}>Loading claim details...</Text>
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={shared.screen}>
        <View style={shared.emptyContainer}>
          <View style={shared.emptyIcon}>
            <Text style={shared.emptyIconText}>⚠️</Text>
          </View>

          <Text style={shared.emptyTitle}>Claim unavailable</Text>

          <Text style={shared.emptyDescription}>
            {error || "We could not find this claim."}
          </Text>

          <Pressable onPress={() => loadClaim()} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const item = claim.item;
  const itemImage = item?.imageUrls?.[0];

  const canCancel = claimsApi.isClaimEditable(claim.status);

  const canConfirmHandover = claim.status === "APPROVED";

  return (
    <View style={shared.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadClaim(true)}
            colors={[CLAIM_COLORS.primary]}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CLAIM INFORMATION</Text>

          <Text style={shared.screenTitle}>Claim details</Text>

          <Text style={shared.screenSubtitle}>
            Review your submission and follow its progress.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View>
              <Text style={styles.statusLabel}>CURRENT STATUS</Text>

              <Text style={styles.statusHeading}>
                {claimsApi.getStatusLabel(claim.status)}
              </Text>
            </View>

            <ClaimStatusBadge status={claim.status} size="medium" />
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusBottom}>
            <View>
              <Text style={styles.smallLabel}>CLAIM REFERENCE</Text>
              <Text style={styles.reference}>{claim.id}</Text>
            </View>

            <View>
              <Text style={styles.smallLabel}>SUBMITTED</Text>
              <Text style={styles.reference}>
                {formatDate(claim.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Claimed item</Text>

          <View style={styles.itemCard}>
            {itemImage ? (
              <Image
                source={{ uri: itemImage }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.itemPlaceholder}>
                <Text style={styles.itemPlaceholderIcon}>📦</Text>
              </View>
            )}

            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>
                {item?.title || "Lost and found item"}
              </Text>

              {!!item?.category?.name && (
                <Text style={styles.itemMeta}>
                  Category: {item.category.name}
                </Text>
              )}

              {!!item?.location?.name && (
                <Text style={styles.itemMeta}>
                  Location: {item.location.name}
                </Text>
              )}

              {!!item?.type && (
                <Text style={styles.itemMeta}>Type: {item.type}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Your explanation</Text>

          <View style={shared.card}>
            <Text style={styles.description}>
              {claim.description ||
                "No explanation was included in this claim."}
            </Text>

            {!!claim.contactPhone && (
              <>
                <View style={styles.innerDivider} />

                <Text style={styles.smallLabel}>CONTACT PHONE</Text>

                <Text style={styles.contactPhone}>{claim.contactPhone}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Verification answers</Text>

          {claim.verificationAnswers?.length ? (
            claim.verificationAnswers.map((answer, index) => (
              <View
                key={`${index}-${answer.question}`}
                style={styles.answerCard}
              >
                <Text style={styles.question}>
                  {index + 1}. {answer.question}
                </Text>

                <Text style={styles.answer}>{answer.answer}</Text>
              </View>
            ))
          ) : (
            <View style={shared.card}>
              <Text style={shared.bodyText}>
                No verification answers were returned by the server.
              </Text>
            </View>
          )}
        </View>

        {!!claim.reviewNote && (
          <View style={styles.section}>
            <Text style={shared.sectionTitle}>Review note</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewText}>{claim.reviewNote}</Text>
            </View>
          </View>
        )}

        {!!claim.rejectionReason && (
          <View style={styles.section}>
            <Text style={shared.sectionTitle}>Reason for rejection</Text>

            <View style={styles.rejectionCard}>
              <Text style={styles.rejectionText}>{claim.rejectionReason}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={shared.sectionTitle}>Claim history</Text>

          <Pressable
            onPress={() =>
              navigation.navigate("ClaimTimeline", {
                claimId: claim.id,
              })
            }
            style={styles.timelineButton}
          >
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>🕒</Text>
            </View>

            <View style={styles.timelineTextContainer}>
              <Text style={styles.timelineTitle}>View claim timeline</Text>
              <Text style={styles.timelineSubtitle}>
                See submission, review, and status updates.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {canConfirmHandover && (
          <View style={styles.section}>
            <HandoverCode
              onSubmit={handleHandoverSubmit}
              onRequestCode={handleRequestCode}
              expiresAt={claim.handoverCodeExpiresAt}
              loading={handoverLoading || requestingCode}
              disabled={claim.status !== "APPROVED"}
            />
          </View>
        )}

        {claim.status === "COMPLETED" && (
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>✓</Text>
            <Text style={styles.completedTitle}>Claim completed</Text>
            <Text style={styles.completedDescription}>
              The item handover has been marked as completed.
            </Text>
          </View>
        )}

        {claim.status === "REJECTED" && (
          <View style={styles.rejectedCard}>
            <Text style={styles.rejectedTitle}>Claim not approved</Text>
            <Text style={styles.rejectedDescription}>
              Review the rejection reason above. Contact the authorized campus
              office if you need clarification.
            </Text>
          </View>
        )}

        {canCancel && (
          <Pressable
            disabled={cancelling}
            onPress={handleCancel}
            style={styles.cancelButton}
          >
            {cancelling ? (
              <ActivityIndicator color={CLAIM_COLORS.danger} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel this claim</Text>
            )}
          </Pressable>
        )}

        <Text style={styles.footerNote}>
          Claim information is provided by the campus lost and found system.
          Contact authorized campus staff if you believe any information is
          incorrect.
        </Text>
      </ScrollView>
    </View>
  );
};

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 45,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: CLAIM_COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  statusCard: {
    padding: 17,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    marginBottom: 23,
  },
  statusTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  statusLabel: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  statusHeading: {
    color: CLAIM_COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 5,
  },
  statusDivider: {
    height: 1,
    backgroundColor: CLAIM_COLORS.divider,
    marginVertical: 16,
  },
  statusBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  smallLabel: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  reference: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  section: {
    marginBottom: 23,
  },
  itemCard: {
    flexDirection: "row",
    gap: 13,
    padding: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  itemImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#EDF0F5",
  },
  itemPlaceholder: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  itemPlaceholderIcon: {
    fontSize: 29,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  itemTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  itemMeta: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
  },
  description: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },
  innerDivider: {
    height: 1,
    backgroundColor: CLAIM_COLORS.divider,
    marginVertical: 14,
  },
  contactPhone: {
    color: CLAIM_COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  answerCard: {
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    gap: 9,
  },
  question: {
    color: CLAIM_COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 19,
  },
  answer: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 13,
    borderLeftWidth: 4,
    borderLeftColor: CLAIM_COLORS.info,
    backgroundColor: CLAIM_COLORS.infoLight,
  },
  reviewText: {
    color: "#315A86",
    fontSize: 12,
    lineHeight: 19,
  },
  rejectionCard: {
    padding: 14,
    borderRadius: 13,
    borderLeftWidth: 4,
    borderLeftColor: CLAIM_COLORS.danger,
    backgroundColor: CLAIM_COLORS.dangerLight,
  },
  rejectionText: {
    color: "#8C3030",
    fontSize: 12,
    lineHeight: 19,
  },
  timelineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
  },
  timelineIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIconText: {
    fontSize: 19,
  },
  timelineTextContainer: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  timelineSubtitle: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 10,
  },
  arrow: {
    color: CLAIM_COLORS.primary,
    fontSize: 27,
    fontWeight: "400",
  },
  completedCard: {
    padding: 18,
    borderRadius: 15,
    backgroundColor: CLAIM_COLORS.successLight,
    alignItems: "center",
    marginBottom: 20,
  },
  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C9EED9",
    color: CLAIM_COLORS.success,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
  },
  completedTitle: {
    color: CLAIM_COLORS.success,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
  completedDescription: {
    color: "#347553",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 5,
  },
  rejectedCard: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: CLAIM_COLORS.dangerLight,
    marginBottom: 18,
  },
  rejectedTitle: {
    color: CLAIM_COLORS.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  rejectedDescription: {
    color: "#8C3030",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  cancelButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E8B8B8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  cancelButtonText: {
    color: CLAIM_COLORS.danger,
    fontSize: 12,
    fontWeight: "800",
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: CLAIM_COLORS.primary,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  footerNote: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 5,
  },
});

export default ClaimDetailsScreen;
