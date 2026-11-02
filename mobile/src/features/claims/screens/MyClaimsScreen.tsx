// mobile/src/features/claims/screens/MyClaimsScreen.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuthStore } from "../../auth/store/authStore";
import ClaimStatusBadge from "../components/ClaimStatusBadge";
import claimsApi, {
  ClaimsApiError,
  type Claim,
  type ClaimStatus,
} from "../services/claimsApi";
import {
  CLAIM_COLORS,
  claimsScreenStyles as shared,
} from "../styles/ClaimsScreen.styles";

type ClaimsStackParamList = {
  MyClaims: undefined;
  ClaimDetails: {
    claimId: string;
  };
};

type Props = NativeStackScreenProps<ClaimsStackParamList, "MyClaims">;

type FilterValue = "ALL" | ClaimStatus;

const FILTERS: {
  label: string;
  value: FilterValue;
}[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
];

const MyClaimsScreen: React.FC<Props> = ({ navigation }) => {
  const accessToken = useAuthStore((state: any) => state.accessToken);

  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadClaims = useCallback(
    async (requestedPage = 1, append = false, refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to view your claims.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await claimsApi.getMyClaims(accessToken, {
          status: selectedFilter,
          page: requestedPage,
          limit: 10,
          sort: "newest",
        });

        setClaims((previous) =>
          append ? [...previous, ...response.claims] : response.claims,
        );

        setPage(response.pagination.page);
        setHasNextPage(response.pagination.hasNextPage);
      } catch (err) {
        const message =
          err instanceof ClaimsApiError
            ? err.message
            : "Unable to load your claims. Please try again.";

        setError(message);

        if (!append) {
          setClaims([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [accessToken, selectedFilter],
  );

  useEffect(() => {
    setClaims([]);
    setPage(1);
    setHasNextPage(false);
    loadClaims(1, false);
  }, [loadClaims]);

  const handleRefresh = () => {
    loadClaims(1, false, true);
  };

  const handleLoadMore = () => {
    if (loading || refreshing || loadingMore || !hasNextPage) {
      return;
    }

    loadClaims(page + 1, true);
  };

  const renderClaim = ({ item }: { item: Claim }) => {
    const itemTitle = item.item?.title || "Campus lost and found item";

    const imageUrl = item.item?.imageUrls?.[0];

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          navigation.navigate("ClaimDetails", {
            claimId: item.id,
          })
        }
        style={({ pressed }) => [
          styles.claimCard,
          pressed && styles.cardPressed,
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={shared.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={shared.itemImagePlaceholder}>
            <Text style={shared.itemImagePlaceholderText}>📦</Text>
          </View>
        )}

        <View style={styles.claimContent}>
          <View style={styles.claimTop}>
            <Text numberOfLines={2} style={shared.itemTitle}>
              {itemTitle}
            </Text>

            <ClaimStatusBadge status={item.status} size="small" />
          </View>

          <Text style={shared.itemMeta}>Claim ID: {item.id.slice(0, 8)}</Text>

          <Text numberOfLines={2} style={styles.description}>
            {item.description || "No explanation provided."}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.date}>
              Submitted {formatDate(item.createdAt)}
            </Text>

            <Text style={styles.viewDetails}>View details →</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    if (error) {
      return (
        <View style={shared.emptyContainer}>
          <View style={shared.emptyIcon}>
            <Text style={shared.emptyIconText}>⚠️</Text>
          </View>

          <Text style={shared.emptyTitle}>Unable to load claims</Text>

          <Text style={shared.emptyDescription}>{error}</Text>

          <Pressable
            onPress={() => loadClaims(1, false)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={shared.emptyContainer}>
        <View style={shared.emptyIcon}>
          <Text style={shared.emptyIconText}>📋</Text>
        </View>

        <Text style={shared.emptyTitle}>No claims found</Text>

        <Text style={shared.emptyDescription}>
          {selectedFilter === "ALL"
            ? "You have not submitted any ownership claims yet. When you claim a found item, it will appear here."
            : `You do not have any ${selectedFilter.toLowerCase().replace("_", " ")} claims.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={shared.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR ACTIVITY</Text>

        <Text style={shared.screenTitle}>My Claims</Text>

        <Text style={shared.screenSubtitle}>
          Follow the progress of items you have claimed.
        </Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryIconText}>📑</Text>
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>Your claim history</Text>
          <Text style={styles.summaryDescription}>
            Keep track of review and handover updates.
          </Text>
        </View>

        <Text style={styles.totalCount}>{claims.length}</Text>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = selectedFilter === item.value;

            return (
              <Pressable
                onPress={() => setSelectedFilter(item.value)}
                style={[shared.filterChip, active && shared.filterChipActive]}
              >
                <Text
                  style={[
                    shared.filterChipText,
                    active && shared.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {loading && claims.length === 0 ? (
        <View style={shared.loadingContainer}>
          <ActivityIndicator color={CLAIM_COLORS.primary} size="large" />
          <Text style={shared.loadingText}>Loading your claims...</Text>
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item.id}
          renderItem={renderClaim}
          contentContainerStyle={[
            styles.listContent,
            claims.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={CLAIM_COLORS.primary}
              colors={[CLAIM_COLORS.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={CLAIM_COLORS.primary} />
                <Text style={styles.footerText}>Loading more claims...</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

function formatDate(value?: string): string {
  if (!value) return "recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 15,
  },
  eyebrow: {
    color: CLAIM_COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    gap: 11,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconText: {
    fontSize: 20,
  },
  summaryText: {
    flex: 1,
    gap: 3,
  },
  summaryTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryDescription: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 10,
  },
  totalCount: {
    color: CLAIM_COLORS.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 35,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  claimCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  cardPressed: {
    opacity: 0.75,
  },
  claimContent: {
    flex: 1,
    gap: 6,
  },
  claimTop: {
    gap: 7,
  },
  description: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 4,
  },
  date: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 9,
  },
  viewDetails: {
    color: CLAIM_COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  retryButton: {
    marginTop: 16,
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
  footerLoading: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
  },
});

export default MyClaimsScreen;
