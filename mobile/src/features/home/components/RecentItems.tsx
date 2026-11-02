// mobile/src/features/home/components/RecentItems.tsx

import React from "react";

import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import type {
  HomeItem,
  HomeItemStatus,
  HomeItemType,
} from "../services/homeApi";

import styles from "../styles/HomeScreen.styles";

/* =========================================================
   TYPES
========================================================= */

interface RecentItemsProps {
  items: HomeItem[];

  loading?: boolean;

  error?: string | null;

  onItemPress: (item: HomeItem) => void;

  onSeeAllPress: () => void;

  onRetry?: () => void;
}

/* =========================================================
   HELPERS
========================================================= */

/**
 * Format an ISO date for display.
 */
function formatDate(dateValue?: string): string {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Display readable item type.
 */
function getItemTypeLabel(type: HomeItemType): string {
  return type === "LOST" ? "LOST ITEM" : "FOUND ITEM";
}

/**
 * Get status label.
 */
function getStatusLabel(status: HomeItemStatus): string {
  const labels: Record<HomeItemStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    ACTIVE: "Active",
    CLAIMED: "Claimed",
    RETURNED: "Returned",
    REJECTED: "Rejected",
    RESOLVED: "Resolved",
    EXPIRED: "Expired",
  };

  return labels[status] ?? status;
}

/**
 * Return a style based on the status.
 */
function getStatusStyle(status: HomeItemStatus) {
  switch (status) {
    case "RETURNED":
    case "RESOLVED":
      return styles.statusReturned;

    case "ACTIVE":
    case "APPROVED":
      return styles.statusActive;

    case "REJECTED":
    case "EXPIRED":
      return styles.statusRejected;

    case "CLAIMED":
      return styles.statusClaimed;

    case "PENDING":
    default:
      return styles.statusPending;
  }
}

/* =========================================================
   ITEM CARD
========================================================= */

interface RecentItemCardProps {
  item: HomeItem;

  onPress: () => void;
}

const RecentItemCard: React.FC<RecentItemCardProps> = ({ item, onPress }) => {
  const isLost = item.type === "LOST";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${getItemTypeLabel(item.type)}`}
      style={({ pressed }) => [
        styles.recentItemCard,
        pressed && styles.recentItemPressed,
      ]}
    >
      {/* Image */}

      <View style={styles.recentItemImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{
              uri: item.imageUrl,
            }}
            style={styles.recentItemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.recentItemImagePlaceholder}>
            <Text style={styles.recentItemPlaceholderIcon}>
              {isLost ? "🔍" : "📦"}
            </Text>

            <Text style={styles.recentItemPlaceholderText}>No image</Text>
          </View>
        )}

        {/* Lost or found label */}

        <View
          style={[
            styles.itemTypeBadge,
            isLost ? styles.lostItemBadge : styles.foundItemBadge,
          ]}
        >
          <Text style={styles.itemTypeBadgeText}>
            {getItemTypeLabel(item.type)}
          </Text>
        </View>
      </View>

      {/* Item details */}

      <View style={styles.recentItemDetails}>
        <View style={styles.recentItemTitleRow}>
          <Text numberOfLines={1} style={styles.recentItemTitle}>
            {item.title}
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.recentItemCategory}>
          {item.category || "Uncategorized"}
        </Text>

        <View style={styles.recentItemMetadata}>
          <Text numberOfLines={1} style={styles.recentItemMetadataText}>
            📍 {item.location || "Location unavailable"}
          </Text>
        </View>

        <View style={styles.recentItemBottomRow}>
          <Text style={styles.recentItemDate}>
            {formatDate(item.reportedAt || item.createdAt)}
          </Text>

          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusBadgeText}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const RecentItemsEmpty: React.FC = () => (
  <View style={styles.recentEmptyContainer}>
    <Text style={styles.recentEmptyIcon}>📭</Text>

    <Text style={styles.recentEmptyTitle}>No items reported yet</Text>

    <Text style={styles.recentEmptyDescription}>
      Recently reported lost and found items will appear here.
    </Text>
  </View>
);

/* =========================================================
   ERROR STATE
========================================================= */

interface RecentItemsErrorProps {
  message: string;

  onRetry?: () => void;
}

const RecentItemsError: React.FC<RecentItemsErrorProps> = ({
  message,
  onRetry,
}) => (
  <View style={styles.recentErrorContainer}>
    <Text style={styles.recentErrorIcon}>⚠️</Text>

    <Text style={styles.recentErrorText}>{message}</Text>

    {onRetry && (
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={styles.retryButton}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    )}
  </View>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const RecentItems: React.FC<RecentItemsProps> = ({
  items,
  loading = false,
  error,
  onItemPress,
  onSeeAllPress,
  onRetry,
}) => {
  return (
    <View style={styles.recentItemsSection}>
      {/* Heading */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent Items</Text>

          <Text style={styles.sectionSubtitle}>
            Latest reports from the campus community.
          </Text>
        </View>

        <Pressable
          onPress={onSeeAllPress}
          accessibilityRole="button"
          accessibilityLabel="See all reported items"
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See all →</Text>
        </Pressable>
      </View>

      {/* Loading */}

      {loading && items.length === 0 && (
        <View style={styles.recentLoadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />

          <Text style={styles.recentLoadingText}>Loading recent items...</Text>
        </View>
      )}

      {/* Error */}

      {!loading && error && items.length === 0 && (
        <RecentItemsError message={error} onRetry={onRetry} />
      )}

      {/* Empty */}

      {!loading && !error && items.length === 0 && <RecentItemsEmpty />}

      {/* Item list */}

      {items.length > 0 && (
        <View style={styles.recentItemsList}>
          {items.map((item) => (
            <RecentItemCard
              key={item.id}
              item={item}
              onPress={() => onItemPress(item)}
            />
          ))}
        </View>
      )}

      {/* Refresh indicator for existing content */}

      {loading && items.length > 0 && (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color="#2563EB" />

          <Text style={styles.inlineLoadingText}>Updating items...</Text>
        </View>
      )}
    </View>
  );
};

export default RecentItems;
