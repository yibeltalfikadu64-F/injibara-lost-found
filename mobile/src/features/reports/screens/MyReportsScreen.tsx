// mobile/src/features/reports/screens/MyReportsScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuthStore } from "../../auth/store/authStore";

import ReportCard from "../components/ReportCard";
import ReportFilters from "../components/ReportFilters";

import reportsApi, {
  DEFAULT_REPORT_FILTERS,
  ReportsApiError,
  type Report,
  type ReportFilters as ReportFilterValues,
} from "../services/reportsApi";

import {
  REPORT_COLORS,
  reportsScreenStyles as shared,
} from "../styles/ReportsScreen.styles";

type ReportsStackParamList = {
  MyReports: undefined;

  // Register ReportDetails in your navigator before using this route.
  ReportDetails: {
    reportId: string;
  };
};

type Props = NativeStackScreenProps<ReportsStackParamList, "MyReports">;

const MyReportsScreen: React.FC<Props> = ({ navigation }) => {
  const accessToken = useAuthStore((state: any) => state.accessToken);

  const [reports, setReports] = useState<Report[]>([]);

  const [filters, setFilters] = useState<ReportFilterValues>({
    ...DEFAULT_REPORT_FILTERS,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const currentPageRef = useRef(1);
  const hasNextPageRef = useRef(false);

  /**
   * Load reports from the backend.
   *
   * A request ID prevents an older response from replacing
   * results returned by a more recent filter request.
   */
  const loadReports = useCallback(
    async (requestedPage = 1, append = false, refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to view the reports you submitted.");
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
        return;
      }

      const requestId = ++requestIdRef.current;

      try {
        if (refresh) {
          setRefreshing(true);
        } else if (append) {
          loadingMoreRef.current = true;
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await reportsApi.getMyReports(accessToken, {
          ...filters,
          page: requestedPage,
          limit: 10,
        });

        // Ignore a response if a newer request has started.
        if (requestId !== requestIdRef.current) {
          return;
        }

        setReports((previous) => {
          if (!append) {
            return response.reports;
          }

          const existingIds = new Set(previous.map((report) => report.id));

          const newReports = response.reports.filter(
            (report) => !existingIds.has(report.id),
          );

          return [...previous, ...newReports];
        });

        setCurrentPage(response.pagination.page);
        currentPageRef.current = response.pagination.page;

        setHasNextPage(response.pagination.hasNextPage);
        hasNextPageRef.current = response.pagination.hasNextPage;

        setTotalReports(response.pagination.total);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof ReportsApiError
            ? err.message
            : "Unable to load your reports. Please try again.";

        setError(message);

        if (!append) {
          setReports([]);
          setTotalReports(0);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [accessToken, filters],
  );

  /**
   * Reload when filters change.
   */
  useEffect(() => {
    setReports([]);
    setCurrentPage(1);
    currentPageRef.current = 1;

    setHasNextPage(false);
    hasNextPageRef.current = false;

    loadReports(1, false);
  }, [loadReports]);

  /**
   * Pull-to-refresh.
   */
  const handleRefresh = useCallback(() => {
    loadReports(1, false, true);
  }, [loadReports]);

  /**
   * Load the next page.
   */
  const handleLoadMore = useCallback(() => {
    if (
      loading ||
      refreshing ||
      loadingMoreRef.current ||
      !hasNextPageRef.current
    ) {
      return;
    }

    loadReports(currentPageRef.current + 1, true);
  }, [loading, refreshing, loadReports]);

  /**
   * Update report filters.
   */
  const handleFiltersChange = (nextFilters: ReportFilterValues) => {
    setFilters({
      ...nextFilters,
      page: 1,
    });
  };

  /**
   * Reset all report filters.
   */
  const handleResetFilters = () => {
    setFilters({
      ...DEFAULT_REPORT_FILTERS,
    });
  };

  /**
   * Open a report's details screen.
   */
  const handleReportPress = (report: Report) => {
    navigation.navigate("ReportDetails", {
      reportId: report.id,
    });
  };

  /**
   * Withdraw a pending report.
   */
  const handleWithdrawReport = (report: Report) => {
    Alert.alert(
      "Withdraw report?",
      "Are you sure you want to withdraw this report? This action may not be reversible.",
      [
        {
          text: "Keep report",
          style: "cancel",
        },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => confirmWithdraw(report),
        },
      ],
    );
  };

  const confirmWithdraw = async (report: Report) => {
    if (!accessToken) {
      Alert.alert(
        "Sign in required",
        "Please sign in again to withdraw this report.",
      );
      return;
    }

    try {
      const updated = await reportsApi.withdrawReport(
        report.id,
        accessToken,
        "Withdrawn by report owner",
      );

      setReports((previous) =>
        previous.map((entry) => (entry.id === updated.id ? updated : entry)),
      );

      Alert.alert(
        "Report withdrawn",
        "Your report has been withdrawn successfully.",
      );
    } catch (err) {
      Alert.alert(
        "Unable to withdraw report",
        err instanceof ReportsApiError
          ? err.message
          : "Please try again later.",
      );
    }
  };

  /**
   * Count currently displayed reports by status.
   */
  const reportSummary = useMemo(() => {
    return {
      pending: reports.filter((report) => report.status === "PENDING").length,

      underReview: reports.filter((report) => report.status === "UNDER_REVIEW")
        .length,

      resolved: reports.filter((report) => report.status === "RESOLVED").length,
    };
  }, [reports]);

  const activeFilterCount = useMemo(() => {
    return [
      filters.status && filters.status !== "ALL",
      filters.type && filters.type !== "ALL",
      filters.priority && filters.priority !== "ALL",
      Boolean(filters.search?.trim()),
    ].filter(Boolean).length;
  }, [filters]);

  /**
   * Empty list component.
   */
  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    if (error) {
      return (
        <View style={shared.emptyContainer}>
          <View style={shared.emptyIcon}>
            <Text style={shared.emptyIconText}>⚠️</Text>
          </View>

          <Text style={shared.emptyTitle}>Unable to load reports</Text>

          <Text style={shared.emptyDescription}>{error}</Text>

          <Pressable
            onPress={() => loadReports(1, false)}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={shared.emptyContainer}>
        <View style={shared.emptyIcon}>
          <Text style={shared.emptyIconText}>📝</Text>
        </View>

        <Text style={shared.emptyTitle}>No reports found</Text>

        <Text style={shared.emptyDescription}>
          {activeFilterCount > 0
            ? "No reports match your selected filters. Try changing or resetting your filters."
            : "You have not submitted any reports yet. Reports you submit will appear here."}
        </Text>

        {activeFilterCount > 0 && (
          <Pressable
            onPress={handleResetFilters}
            style={styles.resetEmptyButton}
          >
            <Text style={styles.resetEmptyButtonText}>Reset filters</Text>
          </Pressable>
        )}
      </View>
    );
  };

  /**
   * Render one report card.
   */
  const renderReport = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onPress={handleReportPress}
      onWithdraw={handleWithdrawReport}
      showWithdrawButton
      style={styles.reportCard}
    />
  );

  /**
   * Footer for pagination.
   */
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator color={REPORT_COLORS.primary} size="small" />

          <Text style={styles.footerText}>Loading more reports...</Text>
        </View>
      );
    }

    if (reports.length > 0 && hasNextPage) {
      return (
        <Pressable onPress={handleLoadMore} style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Load more reports</Text>
        </Pressable>
      );
    }

    if (reports.length > 0) {
      return (
        <Text style={styles.endOfList}>
          You have reached the end of your reports.
        </Text>
      );
    }

    return null;
  };

  if (loading && reports.length === 0) {
    return (
      <View style={shared.loadingContainer}>
        <ActivityIndicator size="large" color={REPORT_COLORS.primary} />

        <Text style={shared.loadingText}>Loading your reports...</Text>
      </View>
    );
  }

  return (
    <View style={shared.screen}>
      {/* Screen header */}
      <View style={styles.header}>
        <Text style={shared.eyebrow}>INJIBARA CAMPUS LOST & FOUND</Text>

        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={shared.title}>My Reports</Text>

            <Text style={shared.subtitle}>
              View and track the reports you have submitted.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>📋</Text>
          </View>
        </View>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalReports}</Text>

          <Text style={styles.summaryLabel}>Total</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={[styles.summaryNumber, { color: REPORT_COLORS.warning }]}
          >
            {reportSummary.pending}
          </Text>

          <Text style={styles.summaryLabel}>Pending</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: REPORT_COLORS.info }]}>
            {reportSummary.underReview}
          </Text>

          <Text style={styles.summaryLabel}>Reviewing</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={[styles.summaryNumber, { color: REPORT_COLORS.success }]}
          >
            {reportSummary.resolved}
          </Text>

          <Text style={styles.summaryLabel}>Resolved</Text>
        </View>
      </View>

      {/* Filter toolbar */}
      <View style={styles.toolbar}>
        <View>
          <Text style={styles.toolbarTitle}>Your submissions</Text>

          <Text style={styles.toolbarSubtitle}>
            {totalReports} report{totalReports === 1 ? "" : "s"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show or hide report filters"
          onPress={() => setShowFilters((previous) => !previous)}
          style={[
            styles.filterToggle,
            showFilters && styles.filterToggleActive,
          ]}
        >
          <Text
            style={[
              styles.filterToggleText,
              showFilters && styles.filterToggleTextActive,
            ]}
          >
            ⚙ Filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Text>
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersWrapper}>
          <ReportFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            disabled={loading}
          />
        </View>
      )}

      {/* Report list */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
        contentContainerStyle={[
          styles.listContent,
          reports.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={REPORT_COLORS.primary}
            colors={[REPORT_COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EAF1FC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: {
    fontSize: 23,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 17,
  },
  summaryCard: {
    flex: 1,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 9,
  },
  summaryNumber: {
    color: REPORT_COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  summaryLabel: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  toolbarTitle: {
    color: REPORT_COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  toolbarSubtitle: {
    color: REPORT_COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  filterToggle: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  filterToggleActive: {
    borderColor: REPORT_COLORS.primary,
    backgroundColor: REPORT_COLORS.primaryLight,
  },
  filterToggleText: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "800",
  },
  filterToggleTextActive: {
    color: REPORT_COLORS.primary,
  },
  filtersWrapper: {
    paddingHorizontal: 18,
    marginBottom: 13,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 35,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  reportCard: {
    marginBottom: 0,
  },
  footerLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 10,
  },
  loadMoreButton: {
    minHeight: 43,
    marginTop: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: REPORT_COLORS.primary,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    color: REPORT_COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  endOfList: {
    color: REPORT_COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    paddingVertical: 18,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: REPORT_COLORS.primary,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  resetEmptyButton: {
    marginTop: 15,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: REPORT_COLORS.primaryLight,
  },
  resetEmptyButtonText: {
    color: REPORT_COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
});

export default MyReportsScreen;
