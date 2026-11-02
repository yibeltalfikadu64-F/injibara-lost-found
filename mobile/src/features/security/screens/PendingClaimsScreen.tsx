// mobile/src/features/security/screens/PendingClaimsScreen.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { useAuthStore } from "../../auth/store/authStore";

import ClaimReviewCard from "../components/ClaimReviewCard";

import {
  ClaimReviewPayload,
  SecurityClaim,
  SecurityClaimStatus,
  securityApi,
} from "../services/securityApi";

import styles, { COLORS } from "../styles/SecurityScreen.styles";

// ======================================================
// TYPES
// ======================================================

type ClaimFilter = "ALL" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

type ReviewAction = "APPROVED" | "REJECTED" | "ADDITIONAL_INFORMATION_REQUIRED";

interface PendingClaimsNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
}

interface PendingClaimsScreenProps {
  navigation: PendingClaimsNavigation;
}

// ======================================================
// FILTERS
// ======================================================

const FILTERS: {
  label: string;
  value: ClaimFilter;
}[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

// ======================================================
// SCREEN
// ======================================================

const PendingClaimsScreen: React.FC<PendingClaimsScreenProps> = ({
  navigation,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [claims, setClaims] = useState<SecurityClaim[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<ClaimFilter>("ALL");

  const [search, setSearch] = useState("");

  const [reviewClaim, setReviewClaim] = useState<SecurityClaim | null>(null);

  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);

  const [reviewNotes, setReviewNotes] = useState("");

  // ====================================================
  // LOAD CLAIMS
  // ====================================================

  const loadClaims = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to access security services.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response = await securityApi.getPendingClaims(accessToken, 1, 50);

        setClaims(response.data);
      } catch (err) {
        setError(securityApi.getSecurityErrorMessage(err));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  // ====================================================
  // REFRESH WHEN SCREEN FOCUSED
  // ====================================================

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [loadClaims]),
  );

  // ====================================================
  // FILTER AND SEARCH
  // ====================================================

  const filteredClaims = useMemo(() => {
    let result = [...claims];

    if (filter !== "ALL") {
      result = result.filter((claim) => claim.status === filter);
    }

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((claim) => {
        const itemTitle = claim.item?.title?.toLowerCase() ?? "";

        const claimantName = securityApi
          .getPersonName(claim.claimant)
          .toLowerCase();

        const claimId = claim.id.toLowerCase();

        const claimNumber = claim.claimNumber?.toLowerCase() ?? "";

        return (
          itemTitle.includes(normalizedSearch) ||
          claimantName.includes(normalizedSearch) ||
          claimId.includes(normalizedSearch) ||
          claimNumber.includes(normalizedSearch)
        );
      });
    }

    return result;
  }, [claims, filter, search]);

  // ====================================================
  // STATISTICS
  // ====================================================

  const statistics = useMemo(() => {
    return {
      total: claims.length,

      pending: claims.filter((claim) => claim.status === "PENDING").length,

      underReview: claims.filter((claim) => claim.status === "UNDER_REVIEW")
        .length,

      approved: claims.filter((claim) => claim.status === "APPROVED").length,
    };
  }, [claims]);

  // ====================================================
  // OPEN REVIEW MODAL
  // ====================================================

  const openReviewModal = (claim: SecurityClaim, action: ReviewAction) => {
    setReviewClaim(claim);
    setReviewAction(action);
    setReviewNotes("");
  };

  const closeReviewModal = () => {
    if (isSubmitting) {
      return;
    }

    setReviewClaim(null);
    setReviewAction(null);
    setReviewNotes("");
  };

  // ====================================================
  // SUBMIT REVIEW
  // ====================================================

  const submitReview = async () => {
    if (!accessToken || !reviewClaim || !reviewAction) {
      return;
    }

    const validation = securityApi.validateReviewNotes(reviewNotes);

    if (validation) {
      Alert.alert("Review required", validation);
      return;
    }

    const payload: ClaimReviewPayload = {
      status: reviewAction,
      reviewNotes: reviewNotes.trim(),
    };

    try {
      setIsSubmitting(true);

      await securityApi.reviewClaim(accessToken, reviewClaim.id, payload);

      setClaims((previous) =>
        previous.map((claim) =>
          claim.id === reviewClaim.id
            ? {
                ...claim,
                status: reviewAction as SecurityClaimStatus,
                reviewNotes: reviewNotes.trim(),
              }
            : claim,
        ),
      );

      setReviewClaim(null);
      setReviewAction(null);
      setReviewNotes("");

      Alert.alert(
        "Review submitted",
        "The claim review was successfully submitted.",
      );
    } catch (err) {
      Alert.alert(
        "Unable to review claim",
        securityApi.getSecurityErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================================
  // CLAIM ACTIONS
  // ====================================================

  const handleApprove = (claim: SecurityClaim) => {
    openReviewModal(claim, "APPROVED");
  };

  const handleReject = (claim: SecurityClaim) => {
    openReviewModal(claim, "REJECTED");
  };

  const handleRequestInformation = (claim: SecurityClaim) => {
    openReviewModal(claim, "ADDITIONAL_INFORMATION_REQUIRED");
  };

  const openClaimDetails = (claim: SecurityClaim) => {
    navigation.navigate("ClaimDetails", {
      claimId: claim.id,
    });
  };

  // ====================================================
  // EMPTY STATE
  // ====================================================

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="documents-outline" size={32} color={COLORS.primary} />
      </View>

      <Text style={styles.emptyTitle}>No Claims Found</Text>

      <Text style={styles.emptyDescription}>
        There are no claims matching your current search or selected filter.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setFilter("ALL");
          setSearch("");
        }}
        style={[styles.primaryButton, { marginTop: 20 }]}
      >
        <Text style={styles.primaryButtonText}>Clear Filters</Text>
      </Pressable>
    </View>
  );

  // ====================================================
  // RENDER CLAIM
  // ====================================================

  const renderClaim = ({ item }: { item: SecurityClaim }) => (
    <ClaimReviewCard
      claim={item}
      onPress={openClaimDetails}
      onApprove={handleApprove}
      onReject={handleReject}
      onRequestInformation={handleRequestInformation}
      disabled={isSubmitting}
    />
  );

  // ====================================================
  // LOADING
  // ====================================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Loading pending claims...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={styles.subHeaderContent}>
          <Text style={styles.subHeaderTitle}>Pending Claims</Text>

          <Text style={styles.subHeaderSubtitle}>
            Review ownership claims and verification
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => loadClaims(true)}
          style={styles.backButton}
        >
          <Ionicons name="refresh-outline" size={21} color={COLORS.primary} />
        </Pressable>
      </View>

      {/* Main list */}
      <FlatList
        data={filteredClaims}
        keyExtractor={(item) => item.id}
        renderItem={renderClaim}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 10, paddingBottom: 35 },
          filteredClaims.length === 0 && {
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadClaims(true)}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Introduction */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Review Center</Text>

              <Text style={styles.sectionDescription}>
                Verify ownership claims before authorizing the return of campus
                belongings.
              </Text>
            </View>

            {/* Statistics */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="documents-outline"
                    size={19}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.total}</Text>

                <Text style={styles.summaryLabel}>Total Claims</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.warningLight },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={COLORS.warning}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.pending}</Text>

                <Text style={styles.summaryLabel}>Pending</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="eye-outline"
                    size={19}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.summaryValue}>
                  {statistics.underReview}
                </Text>

                <Text style={styles.summaryLabel}>Under Review</Text>
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: COLORS.successLight },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color={COLORS.success}
                  />
                </View>

                <Text style={styles.summaryValue}>{statistics.approved}</Text>

                <Text style={styles.summaryLabel}>Approved</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={19}
                color={COLORS.textMuted}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search item, claimant, or claim ID..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
                returnKeyType="search"
              />

              {search.length > 0 ? (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
              <Text style={styles.filterTitle}>Filter Claims</Text>

              <FlatList
                data={FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.value}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => {
                  const selected = filter === item.value;

                  return (
                    <Pressable
                      onPress={() => setFilter(item.value)}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selected && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            {error ? (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={COLORS.danger}
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Claim Records</Text>

              <Text style={styles.sectionDescription}>
                {filteredClaims.length} result(s)
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Review Modal */}
      <Modal
        visible={Boolean(reviewClaim && reviewAction)}
        transparent
        animationType="slide"
        onRequestClose={closeReviewModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 22,
              paddingBottom: 35,
            }}
          >
            <Text style={styles.sectionTitle}>
              {reviewAction === "APPROVED"
                ? "Approve Claim"
                : reviewAction === "REJECTED"
                  ? "Reject Claim"
                  : "Request Additional Information"}
            </Text>

            <Text style={styles.sectionDescription}>
              {reviewClaim?.item?.title ?? "Selected ownership claim"}
            </Text>

            <Text style={[styles.formLabel, { marginTop: 20 }]}>
              Review Notes *
            </Text>

            <TextInput
              value={reviewNotes}
              onChangeText={setReviewNotes}
              placeholder="Enter your verification findings and decision notes..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={1000}
              style={styles.textArea}
              editable={!isSubmitting}
            />

            <Text style={styles.helperText}>
              {reviewNotes.length}/1000 characters. Please provide a clear
              reason for your decision.
            </Text>

            <Pressable
              disabled={isSubmitting}
              onPress={submitReview}
              style={[
                styles.primaryButton,
                isSubmitting && styles.disabledButton,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Submit Review</Text>
              )}
            </Pressable>

            <Pressable
              disabled={isSubmitting}
              onPress={closeReviewModal}
              style={styles.secondaryButton}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PendingClaimsScreen;
