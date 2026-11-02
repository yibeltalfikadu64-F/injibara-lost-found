// mobile/src/features/notifications/components/NotificationItem.tsx

import React, { memo, useMemo } from "react";
import {
  Image,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type {
  AppNotification,
  NotificationPriority,
} from "../services/notificationsApi";

import styles from "../styles/NotificationsScreen.styles";

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onMarkAsRead?: (notification: AppNotification) => void;
  onDelete?: (notification: AppNotification) => void;
  showDeleteButton?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface NotificationAppearance {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
  label: string;
}

const NOTIFICATION_APPEARANCES: Record<string, NotificationAppearance> = {
  CLAIM_SUBMITTED: {
    icon: "document-text-outline",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    label: "New claim",
  },
  CLAIM_APPROVED: {
    icon: "checkmark-circle-outline",
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    label: "Claim approved",
  },
  CLAIM_REJECTED: {
    icon: "close-circle-outline",
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    label: "Claim rejected",
  },
  CLAIM_UPDATED: {
    icon: "refresh-circle-outline",
    color: "#7C3AED",
    backgroundColor: "#EDE9FE",
    label: "Claim update",
  },
  ITEM_MATCHED: {
    icon: "git-compare-outline",
    color: "#0D9488",
    backgroundColor: "#CCFBF1",
    label: "Possible match",
  },
  ITEM_APPROVED: {
    icon: "checkmark-done-circle-outline",
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    label: "Item approved",
  },
  ITEM_REJECTED: {
    icon: "alert-circle-outline",
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    label: "Item rejected",
  },
  ITEM_UPDATED: {
    icon: "create-outline",
    color: "#7C3AED",
    backgroundColor: "#EDE9FE",
    label: "Item updated",
  },
  ITEM_CLAIMED: {
    icon: "hand-left-outline",
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    label: "Item claimed",
  },
  ITEM_RETURNED: {
    icon: "gift-outline",
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    label: "Item returned",
  },
  MESSAGE_RECEIVED: {
    icon: "chatbubble-ellipses-outline",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    label: "New message",
  },
  SYSTEM: {
    icon: "settings-outline",
    color: "#475569",
    backgroundColor: "#E2E8F0",
    label: "System",
  },
  ANNOUNCEMENT: {
    icon: "megaphone-outline",
    color: "#9333EA",
    backgroundColor: "#F3E8FF",
    label: "Announcement",
  },
  REMINDER: {
    icon: "alarm-outline",
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    label: "Reminder",
  },
  GENERAL: {
    icon: "notifications-outline",
    color: "#475569",
    backgroundColor: "#E2E8F0",
    label: "Notification",
  },
};

const DEFAULT_APPEARANCE = NOTIFICATION_APPEARANCES.GENERAL;

function getAppearance(type: string): NotificationAppearance {
  return NOTIFICATION_APPEARANCES[type.toUpperCase()] ?? DEFAULT_APPEARANCE;
}

function getPriorityAppearance(
  priority?: NotificationPriority,
): { label: string; color: string } | null {
  switch (priority) {
    case "URGENT":
      return { label: "Urgent", color: "#DC2626" };

    case "HIGH":
      return { label: "High priority", color: "#D97706" };

    case "LOW":
      return { label: "Low priority", color: "#64748B" };

    default:
      return null;
  }
}

function formatNotificationDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const difference = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute && difference >= 0) {
    return "Just now";
  }

  if (difference < hour && difference >= 0) {
    const minutes = Math.floor(difference / minute);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  if (difference < day && difference >= 0) {
    const hours = Math.floor(difference / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (difference < 2 * day && difference >= 0) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
  showDeleteButton = true,
  disabled = false,
  style,
}) => {
  const appearance = useMemo(
    () => getAppearance(notification.type),
    [notification.type],
  );

  const priority = useMemo(
    () => getPriorityAppearance(notification.priority),
    [notification.priority],
  );

  const formattedDate = useMemo(
    () => formatNotificationDate(notification.createdAt),
    [notification.createdAt],
  );

  const senderName = notification.sender
    ? notification.sender.name ||
      [notification.sender.firstName, notification.sender.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  const handlePress = () => {
    if (!disabled) {
      onPress(notification);
    }
  };

  const handleMarkAsRead = () => {
    if (!disabled && onMarkAsRead) {
      onMarkAsRead(notification);
    }
  };

  const handleDelete = () => {
    if (!disabled && onDelete) {
      onDelete(notification);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.message}. ${
        notification.isRead ? "Read" : "Unread"
      }`}
      accessibilityHint="Opens notification details"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.notificationCard,
        !notification.isRead && styles.notificationCardUnread,
        pressed && styles.notificationCardPressed,
        style,
      ]}
    >
      <View style={styles.notificationCardContent}>
        <View
          style={[
            styles.notificationIconContainer,
            { backgroundColor: appearance.backgroundColor },
          ]}
        >
          <Ionicons name={appearance.icon} size={23} color={appearance.color} />
        </View>

        <View style={styles.notificationMain}>
          <View style={styles.notificationTopRow}>
            <View style={styles.notificationTitleContainer}>
              <Text
                style={[
                  styles.notificationTitle,
                  !notification.isRead && styles.notificationTitleUnread,
                ]}
                numberOfLines={2}
              >
                {notification.title}
              </Text>

              {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
          </View>

          <Text style={styles.notificationMessage} numberOfLines={3}>
            {notification.message ||
              notification.body ||
              "You have a new notification."}
          </Text>

          {senderName ? (
            <View style={styles.notificationSenderRow}>
              {notification.sender?.avatarUrl ? (
                <Image
                  source={{ uri: notification.sender.avatarUrl }}
                  style={styles.senderAvatar}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={15}
                  color="#64748B"
                />
              )}

              <Text style={styles.notificationSender} numberOfLines={1}>
                {senderName}
              </Text>
            </View>
          ) : null}

          <View style={styles.notificationMetaRow}>
            <View
              style={[
                styles.notificationTypeBadge,
                { backgroundColor: appearance.backgroundColor },
              ]}
            >
              <Text
                style={[
                  styles.notificationTypeText,
                  { color: appearance.color },
                ]}
              >
                {appearance.label}
              </Text>
            </View>

            {priority ? (
              <Text
                style={[styles.notificationPriority, { color: priority.color }]}
              >
                {priority.label}
              </Text>
            ) : null}

            <View style={styles.notificationDateContainer}>
              <Ionicons name="time-outline" size={13} color="#94A3B8" />
              <Text style={styles.notificationDate}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.notificationActions}>
            {!notification.isRead && onMarkAsRead ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark notification as read"
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  handleMarkAsRead();
                }}
                style={styles.notificationActionButton}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={16}
                  color="#2563EB"
                />
                <Text style={styles.markReadText}>Mark as read</Text>
              </Pressable>
            ) : null}

            {showDeleteButton && onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete notification"
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  handleDelete();
                }}
                style={styles.deleteNotificationButton}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default memo(NotificationItem);
