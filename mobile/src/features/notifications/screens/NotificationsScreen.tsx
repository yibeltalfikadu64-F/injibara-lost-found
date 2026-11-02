// mobile/src/features/notifications/screens/NotificationsScreen.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import NotificationItem from "../components/NotificationItem";

import notificationsApi, {
  AppNotification,
  NotificationFilters,
  NotificationPagination,
} from "../services/notificationsApi";

import styles, { COLORS } from "../styles/NotificationsScreen.styles";

import { useAuthStore } from "../../auth/store/authStore";

// ------------------------------------------------------
// Navigation types
// ------------------------------------------------------

interface NotificationsNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack?: () => void;
}

interface NotificationsScreenProps {
  navigation: NotificationsNavigation;
}

type NotificationFilter = "ALL" | "UNREAD" | "READ";

// ------------------------------------------------------
// Constants
// ------------------------------------------------------

const PAGE_SIZE = 15;

const INITIAL_PAGINATION: NotificationPagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

// ------------------------------------------------------
// Helper functions
// ------------------------------------------------------

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const value = error as { message?: string };

    if (value.message) {
      return value.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function getFilterLabel(filter: NotificationFilter): string {
  switch (filter) {
    case "UNREAD":
      return "Unread";

    case "READ":
      return "Read";

    default:
      return "All";
  }
}

function getNotificationNavigation(
  notification: AppNotification,
): { screen: string; params: Record<string, unknown> } | null {
  if (notification.relatedClaimId) {
    return {
      screen: "ClaimDetails",
      params: {
        claimId: notification.relatedClaimId,
      },
    };
  }

  if (notification.relatedItemId) {
    return {
      screen: "ItemDetails",
      params: {
        itemId: notification.relatedItemId,
      },
    };
  }

  if (notification.actionUrl) {
    return {
      screen: notification.actionUrl,
      params: {},
    };
  }

  return null;
}

// ------------------------------------------------------
// Main component
// ------------------------------------------------------

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  // ----------------------------------------------------
  // Authentication
  // ----------------------------------------------------

  const accessToken = useAuthStore((state) => state.accessToken);

  // ----------------------------------------------------
  // Component state
  // ----------------------------------------------------

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("ALL");

  const [pagination, setPagination] =
    useState<NotificationPagination>(INITIAL_PAGINATION);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // ----------------------------------------------------
  // Derived values
  // ----------------------------------------------------

  const readCount = useMemo(
    () => Math.max(0, pagination.total - unreadCount),
    [pagination.total, unreadCount],
  );

  const filterOptions = useMemo(
    () => [
      {
        key: "ALL" as NotificationFilter,
        label: "All",
        count: pagination.total,
      },
      {
        key: "UNREAD" as NotificationFilter,
        label: "Unread",
        count: unreadCount,
      },
      {
        key: "READ" as NotificationFilter,
        label: "Read",
        count: readCount,
      },
    ],
    [pagination.total, unreadCount, readCount],
  );

  const filteredNotifications = useMemo(() => notifications, [notifications]);

  // ----------------------------------------------------
  // API filter conversion
  // ----------------------------------------------------

  const getApiFilters = useCallback(
    (page: number): NotificationFilters => {
      const filters: NotificationFilters = {
        page,
        limit: PAGE_SIZE,
        sortBy: "newest",
      };

      if (activeFilter === "UNREAD") {
        filters.isRead = false;
      }

      if (activeFilter === "READ") {
        filters.isRead = true;
      }

      return filters;
    },
    [activeFilter],
  );

  // ----------------------------------------------------
  // Load notifications
  // ----------------------------------------------------

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      if (!accessToken) {
        setNotifications([]);
        setUnreadCount(0);
        setPagination(INITIAL_PAGINATION);
        setError("Please sign in to view your notifications.");
        setIsLoading(false);
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await notificationsApi.getNotifications(
          accessToken,
          getApiFilters(1),
        );

        setNotifications(response.notifications);
        setPagination(response.pagination);
        setUnreadCount(response.unreadCount);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, getApiFilters],
  );

  // ----------------------------------------------------
  // Initial loading and filter changes
  // ----------------------------------------------------

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // ----------------------------------------------------
  // Pull to refresh
  // ----------------------------------------------------

  const handleRefresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await notificationsApi.getNotifications(
        accessToken,
        getApiFilters(1),
      );

      setNotifications(response.notifications);
      setPagination(response.pagination);
      setUnreadCount(response.unreadCount);
    } catch (refreshError) {
      setError(getErrorMessage(refreshError));
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken, getApiFilters]);

  // ----------------------------------------------------
  // Load more notifications
  // ----------------------------------------------------

  const handleLoadMore = useCallback(async () => {
    if (!accessToken || isLoadingMore || !pagination.hasNextPage || isLoading) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = pagination.page + 1;

      const response = await notificationsApi.getNotifications(
        accessToken,
        getApiFilters(nextPage),
      );

      setNotifications((previous) => {
        const existingIds = new Set(previous.map((item) => item.id));

        const newNotifications = response.notifications.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...previous, ...newNotifications];
      });

      setPagination(response.pagination);
      setUnreadCount(response.unreadCount);
    } catch (loadError) {
      Alert.alert("Unable to load more", getErrorMessage(loadError));
    } finally {
      setIsLoadingMore(false);
    }
  }, [accessToken, isLoadingMore, pagination, isLoading, getApiFilters]);

  // ----------------------------------------------------
  // Prevent duplicate actions
  // ----------------------------------------------------

  const setProcessing = useCallback(
    (notificationId: string, processing: boolean) => {
      setProcessingIds((previous) => {
        if (processing) {
          return previous.includes(notificationId)
            ? previous
            : [...previous, notificationId];
        }

        return previous.filter((id) => id !== notificationId);
      });
    },
    [],
  );

  // ----------------------------------------------------
  // Mark one notification as read
  // ----------------------------------------------------

  const handleMarkAsRead = useCallback(
    async (notification: AppNotification) => {
      if (!accessToken || notification.isRead) {
        return;
      }

      if (processingIds.includes(notification.id)) {
        return;
      }

      setProcessing(notification.id, true);

      // Optimistic UI update.
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));

      try {
        await notificationsApi.markAsRead(notification.id, accessToken);
      } catch (requestError) {
        // Restore previous state if the request fails.
        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  isRead: false,
                  readAt: null,
                }
              : item,
          ),
        );

        setUnreadCount((previous) => previous + 1);

        Alert.alert(
          "Unable to update notification",
          getErrorMessage(requestError),
        );
      } finally {
        setProcessing(notification.id, false);
      }
    },
    [accessToken, processingIds, setProcessing],
  );

  // ----------------------------------------------------
  // Mark all notifications as read
  // ----------------------------------------------------

  const handleMarkAllAsRead = useCallback(async () => {
    if (!accessToken || unreadCount === 0 || isMarkingAll) {
      return;
    }

    Alert.alert(
      "Mark all as read",
      "Are you sure you want to mark all notifications as read?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark all",
          onPress: async () => {
            setIsMarkingAll(true);

            const previousNotifications = notifications;
            const previousUnreadCount = unreadCount;

            setNotifications((previous) =>
              previous.map((item) => ({
                ...item,
                isRead: true,
                readAt: item.readAt ?? new Date().toISOString(),
              })),
            );

            setUnreadCount(0);

            try {
              await notificationsApi.markAllAsRead(accessToken);
            } catch (requestError) {
              setNotifications(previousNotifications);
              setUnreadCount(previousUnreadCount);

              Alert.alert("Update failed", getErrorMessage(requestError));
            } finally {
              setIsMarkingAll(false);
            }
          },
        },
      ],
    );
  }, [accessToken, unreadCount, isMarkingAll, notifications]);

  // ----------------------------------------------------
  // Delete one notification
  // ----------------------------------------------------

  const handleDeleteNotification = useCallback(
    (notification: AppNotification) => {
      Alert.alert(
        "Delete notification",
        "Are you sure you want to delete this notification?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              if (!accessToken) {
                return;
              }

              const previousNotifications = notifications;
              const wasUnread = !notification.isRead;

              setNotifications((previous) =>
                previous.filter((item) => item.id !== notification.id),
              );

              setPagination((previous) => ({
                ...previous,
                total: Math.max(0, previous.total - 1),
              }));

              if (wasUnread) {
                setUnreadCount((previous) => Math.max(0, previous - 1));
              }

              try {
                await notificationsApi.deleteNotification(
                  notification.id,
                  accessToken,
                );
              } catch (deleteError) {
                setNotifications(previousNotifications);

                setPagination((previous) => ({
                  ...previous,
                  total: previous.total + 1,
                }));

                if (wasUnread) {
                  setUnreadCount((previous) => previous + 1);
                }

                Alert.alert("Delete failed", getErrorMessage(deleteError));
              }
            },
          },
        ],
      );
    },
    [accessToken, notifications],
  );

  // ----------------------------------------------------
  // Notification press
  // ----------------------------------------------------

  const handleNotificationPress = useCallback(
    async (notification: AppNotification) => {
      if (!notification.isRead) {
        await handleMarkAsRead(notification);
      }

      const destination = getNotificationNavigation(notification);

      if (destination) {
        navigation.navigate(destination.screen, destination.params);
      }
    },
    [handleMarkAsRead, navigation],
  );

  // ----------------------------------------------------
  // Filter selection
  // ----------------------------------------------------

  const handleFilterChange = useCallback(
    (filter: NotificationFilter) => {
      if (filter === activeFilter) {
        return;
      }

      setActiveFilter(filter);
    },
    [activeFilter],
  );

  // ----------------------------------------------------
  // Filter reset
  // ----------------------------------------------------

  const handleResetFilters = useCallback(() => {
    setActiveFilter("ALL");
  }, []);

  // ----------------------------------------------------
  // Notification card renderer
  // ----------------------------------------------------

  const renderNotification: ListRenderItem<AppNotification> = useCallback(
    ({ item }) => (
      <NotificationItem
        notification={item}
        onPress={handleNotificationPress}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteNotification}
        disabled={processingIds.includes(item.id)}
      />
    ),
    [
      handleNotificationPress,
      handleMarkAsRead,
      handleDeleteNotification,
      processingIds,
    ],
  );

  // ----------------------------------------------------
  // Key extractor
  // ----------------------------------------------------

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  // ----------------------------------------------------
  // Empty state
  // ----------------------------------------------------

  const renderEmptyState = useCallback(() => {
    const isFiltered = activeFilter !== "ALL";

    let title = "No notifications yet";
    let message =
      "When something important happens in your account, your notifications will appear here.";

    if (activeFilter === "UNREAD") {
      title = "All caught up!";
      message = "You do not have any unread notifications. You are up to date.";
    }

    if (activeFilter === "READ") {
      title = "No read notifications";
      message = "Notifications you have already read will appear here.";
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name={
              activeFilter === "UNREAD"
                ? "checkmark-done-circle-outline"
                : "notifications-off-outline"
            }
            size={42}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>{title}</Text>

        <Text style={styles.emptyMessage}>{message}</Text>

        {isFiltered ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleResetFilters}
            style={styles.emptyActionButton}
          >
            <Text style={styles.emptyActionText}>View all notifications</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }, [activeFilter, handleResetFilters]);

  // ----------------------------------------------------
  // Error state
  // ----------------------------------------------------

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={34} color={COLORS.danger} />

      <Text style={styles.errorTitle}>Unable to load notifications</Text>

      <Text style={styles.errorMessage}>{error}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => loadNotifications(true)}
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>Try again</Text>
      </Pressable>
    </View>
  );

  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>

          <Text style={styles.headerSubtitle}>
            Stay updated with your lost and found activity.
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Loading your notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // Main screen UI
  // ----------------------------------------------------

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <FlatList
        data={filteredNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderNotification}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        // Pull-to-refresh.
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Refreshing notifications..."
          />
        }
        // Pagination.
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        // Header and filters.
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Notifications</Text>

                  <Text style={styles.headerSubtitle}>
                    Stay updated with your lost and found activity.
                  </Text>
                </View>

                <View style={styles.headerActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Refresh notifications"
                    disabled={isRefreshing}
                    onPress={handleRefresh}
                    style={[
                      styles.headerActionButton,
                      isRefreshing && styles.headerActionButtonDisabled,
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={19}
                      color={COLORS.text}
                    />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Mark all notifications as read"
                    disabled={unreadCount === 0 || isMarkingAll}
                    onPress={handleMarkAllAsRead}
                    style={[
                      styles.headerActionButton,
                      styles.headerActionButtonPrimary,
                      (unreadCount === 0 || isMarkingAll) &&
                        styles.headerActionButtonDisabled,
                    ]}
                  >
                    {isMarkingAll ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Notification summary cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <View
                  style={[
                    styles.summaryIconContainer,
                    {
                      backgroundColor: "#DBEAFE",
                    },
                  ]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={19}
                    color="#2563EB"
                  />
                </View>

                <View>
                  <Text style={styles.summaryValue}>{pagination.total}</Text>

                  <Text style={styles.summaryLabel}>Total notifications</Text>
                </View>
              </View>

              <View style={[styles.summaryCard, styles.summaryCardUnread]}>
                <View
                  style={[
                    styles.summaryIconContainer,
                    {
                      backgroundColor: "#BFDBFE",
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-unread-outline"
                    size={19}
                    color="#1D4ED8"
                  />
                </View>

                <View>
                  <Text style={styles.summaryValue}>{unreadCount}</Text>

                  <Text style={styles.summaryLabel}>Unread notifications</Text>
                </View>
              </View>
            </View>

            {/* Filters */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filter notifications</Text>

                {activeFilter !== "ALL" ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.clearFilterText}>Clear filter</Text>
                  </Pressable>
                ) : null}
              </View>

              <FlatList
                horizontal
                data={filterOptions}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
                renderItem={({ item }) => {
                  const isActive = activeFilter === item.key;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: isActive,
                      }}
                      onPress={() => handleFilterChange(item.key)}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {item.label} ({item.count})
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            {/* List heading */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  {getFilterLabel(activeFilter)} notifications
                </Text>

                <Text style={styles.listCount}>
                  {filteredNotifications.length} shown
                </Text>
              </View>
            </View>

            {error && notifications.length > 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{error}</Text>

                <Pressable
                  onPress={() => loadNotifications(false)}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        // Empty state.
        ListEmptyComponent={error ? renderError() : renderEmptyState()}
        // Loading more state.
        ListFooterComponent={
          <View>
            {isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />

                <Text style={styles.loadingMoreText}>
                  Loading more notifications...
                </Text>
              </View>
            ) : pagination.hasNextPage && notifications.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleLoadMore}
                style={styles.loadMoreButton}
              >
                <Text style={styles.loadMoreText}>Load more notifications</Text>
              </Pressable>
            ) : notifications.length > 0 ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  You have reached the end of your notifications.
                </Text>
              </View>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
