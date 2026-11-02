// mobile/src/features/home/screens/HomeScreen.tsx

/**
 * Injibara Campus Lost & Found
 * Main Home Screen
 *
 * Features:
 * - Personalized welcome
 * - Dashboard statistics
 * - Quick navigation actions
 * - Recent lost and found items
 * - Campus announcements
 * - Pull-to-refresh
 * - Loading state
 * - Error state
 * - Empty states
 * - Authentication integration
 */

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import type {
  HomeDashboard,
  HomeItem,
  HomeAnnouncement,
} from "../services/homeApi";

import { DEFAULT_HOME_STATISTICS, homeApi } from "../services/homeApi";

import { useAuth } from "../../auth/hooks/useAuth";

import { useAuthStore } from "../../auth/store/authStore";

import WelcomeCard from "../components/WelcomeCard";

import QuickActions from "../components/QuickActions";

import RecentItems from "../components/RecentItems";

import AnnouncementCard from "../components/AnnouncementCard";

import styles from "../styles/HomeScreen.styles";

/* =========================================================
   TYPES
========================================================= */

interface HomeScreenProps {
  /**
   * Optional custom navigation callbacks.
   * Use these if your navigator has different route names.
   */
  onReportLost?: () => void;

  onReportFound?: () => void;

  onSearch?: () => void;

  onMyClaims?: () => void;

  onNotifications?: () => void;

  onSeeAllItems?: () => void;

  onAnnouncementPress?: (announcement: HomeAnnouncement) => void;
}

/**
 * Initial dashboard state.
 */
const INITIAL_DASHBOARD: HomeDashboard = {
  statistics: DEFAULT_HOME_STATISTICS,
  recentItems: [],
  announcements: [],
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const HomeScreen: React.FC<HomeScreenProps> = ({
  onReportLost,
  onReportFound,
  onSearch,
  onMyClaims,
  onNotifications,
  onSeeAllItems,
  onAnnouncementPress,
}) => {
  /* =======================================================
     1. NAVIGATION
  ======================================================= */

  const navigation = useNavigation<any>();

  /* =======================================================
     2. AUTHENTICATION
  ======================================================= */

  const { user, isAuthenticated } = useAuth();

  const accessToken = useAuthStore((state) => state.accessToken);

  /* =======================================================
     3. LOCAL STATE
  ======================================================= */

  const [dashboard, setDashboard] = useState<HomeDashboard>(INITIAL_DASHBOARD);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [hasLoaded, setHasLoaded] = useState(false);

  /* =======================================================
     4. LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (!hasLoaded) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await homeApi.getDashboard(accessToken ?? undefined);

        setDashboard(response);

        setHasLoaded(true);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard information.";

        setError(message);

        /**
         * Keep existing dashboard information
         * if refreshing fails.
         */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, hasLoaded],
  );

  /* =======================================================
     5. INITIAL DATA LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     6. REFRESH WHEN SCREEN GETS FOCUS
  ======================================================= */

  useFocusEffect(
    useCallback(() => {
      if (hasLoaded) {
        loadDashboard(true);
      }
    }, [hasLoaded, loadDashboard]),
  );

  /* =======================================================
     7. PULL TO REFRESH
  ======================================================= */

  const handleRefresh = useCallback(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  /* =======================================================
     8. NAVIGATION HELPERS
  ======================================================= */

  /**
   * Navigate to the appropriate report screen.
   *
   * These route names must match your actual navigator.
   */
  const navigateToReport = useCallback(
    (type: "LOST" | "FOUND") => {
      const routeName =
        type === "LOST" ? "CreateLostReport" : "CreateFoundReport";

      try {
        navigation.navigate(routeName);
      } catch {
        Alert.alert(
          "Navigation unavailable",
          "The report screen is not currently registered in your navigation configuration.",
        );
      }
    },
    [navigation],
  );

  /**
   * Report lost item.
   */
  const handleReportLost = useCallback(() => {
    if (onReportLost) {
      onReportLost();
      return;
    }

    navigateToReport("LOST");
  }, [onReportLost, navigateToReport]);

  /**
   * Report found item.
   */
  const handleReportFound = useCallback(() => {
    if (onReportFound) {
      onReportFound();
      return;
    }

    navigateToReport("FOUND");
  }, [onReportFound, navigateToReport]);

  /**
   * Search items.
   */
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch();
      return;
    }

    navigation.navigate("Search");
  }, [onSearch, navigation]);

  /**
   * View user claims.
   */
  const handleMyClaims = useCallback(() => {
    if (onMyClaims) {
      onMyClaims();
      return;
    }

    navigation.navigate("MyClaims");
  }, [onMyClaims, navigation]);

  /**
   * Open notifications.
   */
  const handleNotifications = useCallback(() => {
    if (onNotifications) {
      onNotifications();
      return;
    }

    navigation.navigate("Notifications");
  }, [onNotifications, navigation]);

  /**
   * View all items.
   */
  const handleSeeAllItems = useCallback(() => {
    if (onSeeAllItems) {
      onSeeAllItems();
      return;
    }

    navigation.navigate("Search");
  }, [onSeeAllItems, navigation]);

  /**
   * Open item details.
   */
  const handleItemPress = useCallback(
    (item: HomeItem) => {
      navigation.navigate("ItemDetails", {
        itemId: item.id,
        item,
      });
    },
    [navigation],
  );

  /**
   * Open announcement.
   */
  const handleAnnouncementPress = useCallback(
    (announcement: HomeAnnouncement) => {
      if (onAnnouncementPress) {
        onAnnouncementPress(announcement);
        return;
      }

      navigation.navigate("AnnouncementDetails", {
        announcementId: announcement.id,
        announcement,
      });
    },
    [navigation, onAnnouncementPress],
  );

  /* =======================================================
     9. RETRY
  ======================================================= */

  const handleRetry = useCallback(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     10. RENDER LOADING SCREEN
  ======================================================= */

  if (loading && !hasLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

        <View style={styles.initialLoadingContainer}>
          <View style={styles.loadingLogoContainer}>
            <Text style={styles.loadingLogoText}>IU</Text>
          </View>

          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.initialLoadingIndicator}
          />

          <Text style={styles.initialLoadingTitle}>Loading your dashboard</Text>

          <Text style={styles.initialLoadingDescription}>
            Please wait while we get the latest campus information.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     11. RENDER MAIN HOME SCREEN
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {/* ================================================
            HEADER
        ================================================= */}

        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.pageHeaderTitle}>Campus Connect</Text>

            <Text style={styles.pageHeaderSubtitle}>Lost & Found</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.connectionStatus}>
              {isAuthenticated ? "● Connected" : "● Guest"}
            </Text>

            <View style={styles.headerUniversityBadge}>
              <Text style={styles.headerUniversityBadgeText}>IU</Text>
            </View>
          </View>
        </View>

        {/* ================================================
            ERROR BANNER
        ================================================= */}

        {error && (
          <View style={styles.dashboardErrorBanner}>
            <Text style={styles.dashboardErrorIcon}>⚠️</Text>

            <View style={styles.dashboardErrorContent}>
              <Text style={styles.dashboardErrorTitle}>
                Unable to update dashboard
              </Text>

              <Text style={styles.dashboardErrorMessage}>{error}</Text>

              <Text
                onPress={handleRetry}
                accessibilityRole="button"
                style={styles.dashboardRetryText}
              >
                Try again
              </Text>
            </View>
          </View>
        )}

        {/* ================================================
            WELCOME CARD
        ================================================= */}

        <WelcomeCard
          fullName={user?.fullName}
          statistics={dashboard.statistics}
          onNotificationPress={handleNotifications}
        />

        {/* ================================================
            QUICK ACTIONS
        ================================================= */}

        <QuickActions
          onReportLost={handleReportLost}
          onReportFound={handleReportFound}
          onSearch={handleSearch}
          onMyClaims={handleMyClaims}
        />

        {/* ================================================
            RECENT ITEMS
        ================================================= */}

        <RecentItems
          items={dashboard.recentItems}
          loading={refreshing}
          error={error}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllItems}
          onRetry={handleRetry}
        />

        {/* ================================================
            ANNOUNCEMENTS
        ================================================= */}

        <AnnouncementCard
          announcements={dashboard.announcements}
          loading={refreshing}
          onAnnouncementPress={handleAnnouncementPress}
          onSeeAllPress={() => {
            navigation.navigate("Announcements");
          }}
        />

        {/* ================================================
            FOOTER
        ================================================= */}

        <View style={styles.homeFooter}>
          <View style={styles.footerDivider} />

          <Text style={styles.footerTitle}>Injibara University</Text>

          <Text style={styles.footerDescription}>
            Together, we help lost belongings find their way home.
          </Text>

          <Text style={styles.footerCopyright}>Campus Lost & Found</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
