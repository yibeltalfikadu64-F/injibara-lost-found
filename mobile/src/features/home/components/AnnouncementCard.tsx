// mobile/src/features/home/components/AnnouncementCard.tsx

import React from "react";

import { Image, Pressable, Text, View } from "react-native";

import type { HomeAnnouncement } from "../services/homeApi";

import styles from "../styles/HomeScreen.styles";

/* =========================================================
   TYPES
========================================================= */

interface AnnouncementCardProps {
  announcements: HomeAnnouncement[];

  loading?: boolean;

  onAnnouncementPress?: (announcement: HomeAnnouncement) => void;

  onSeeAllPress?: () => void;
}

/* =========================================================
   HELPERS
========================================================= */

function formatAnnouncementDate(dateValue?: string): string {
  if (!dateValue) {
    return "Recently published";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently published";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPriorityLabel(priority?: HomeAnnouncement["priority"]): string {
  switch (priority) {
    case "HIGH":
      return "IMPORTANT";

    case "LOW":
      return "GENERAL";

    case "NORMAL":
    default:
      return "ANNOUNCEMENT";
  }
}

function getPriorityStyle(priority?: HomeAnnouncement["priority"]) {
  switch (priority) {
    case "HIGH":
      return styles.announcementHighPriority;

    case "LOW":
      return styles.announcementLowPriority;

    case "NORMAL":
    default:
      return styles.announcementNormalPriority;
  }
}

/* =========================================================
   ANNOUNCEMENT ITEM
========================================================= */

interface AnnouncementItemProps {
  announcement: HomeAnnouncement;

  onPress?: () => void;
}

const AnnouncementItem: React.FC<AnnouncementItemProps> = ({
  announcement,
  onPress,
}) => {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`Announcement: ${announcement.title}`}
      style={({ pressed }) => [
        styles.announcementCard,
        pressed && styles.announcementPressed,
      ]}
    >
      {/* Announcement image */}

      {announcement.imageUrl && (
        <Image
          source={{
            uri: announcement.imageUrl,
          }}
          style={styles.announcementImage}
          resizeMode="cover"
        />
      )}

      {/* Announcement content */}

      <View style={styles.announcementContent}>
        <View style={styles.announcementTopRow}>
          <View
            style={[
              styles.announcementPriorityBadge,
              getPriorityStyle(announcement.priority),
            ]}
          >
            <Text style={styles.announcementPriorityText}>
              {getPriorityLabel(announcement.priority)}
            </Text>
          </View>

          <Text style={styles.announcementDate}>
            {formatAnnouncementDate(
              announcement.publishedAt || announcement.createdAt,
            )}
          </Text>
        </View>

        <Text numberOfLines={2} style={styles.announcementTitle}>
          {announcement.title}
        </Text>

        <Text numberOfLines={3} style={styles.announcementMessage}>
          {announcement.message}
        </Text>

        {announcement.category && (
          <Text style={styles.announcementCategory}>
            {announcement.category}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const AnnouncementEmpty: React.FC = () => (
  <View style={styles.announcementEmpty}>
    <Text style={styles.announcementEmptyIcon}>📢</Text>

    <Text style={styles.announcementEmptyTitle}>No announcements yet</Text>

    <Text style={styles.announcementEmptyDescription}>
      University announcements will appear here when published.
    </Text>
  </View>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcements,
  loading = false,
  onAnnouncementPress,
  onSeeAllPress,
}) => {
  return (
    <View style={styles.announcementSection}>
      {/* Section heading */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Campus Announcements</Text>

          <Text style={styles.sectionSubtitle}>
            Stay updated with university news.
          </Text>
        </View>

        {onSeeAllPress && (
          <Pressable
            onPress={onSeeAllPress}
            accessibilityRole="button"
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>See all →</Text>
          </Pressable>
        )}
      </View>

      {/* Loading */}

      {loading && announcements.length === 0 && (
        <View style={styles.announcementLoading}>
          <Text style={styles.announcementLoadingText}>
            Loading announcements...
          </Text>
        </View>
      )}

      {/* Empty state */}

      {!loading && announcements.length === 0 && <AnnouncementEmpty />}

      {/* Announcements */}

      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
          onPress={
            onAnnouncementPress
              ? () => onAnnouncementPress(announcement)
              : undefined
          }
        />
      ))}
    </View>
  );
};

export default AnnouncementCard;
