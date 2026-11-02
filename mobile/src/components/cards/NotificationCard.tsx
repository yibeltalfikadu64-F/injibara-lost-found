import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type NotificationType =
  | 'NEW_ITEM'
  | 'ITEM_MATCH'
  | 'NEW_CLAIM'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'CLAIM_COMPLETED'
  | 'ITEM_RETURNED'
  | 'ANNOUNCEMENT'
  | 'SYSTEM'
  | 'GENERAL';

export interface NotificationCardData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt?: string;
  isRead: boolean;
  referenceId?: string;
}

interface NotificationCardProps {
  notification: NotificationCardData;
  onPress?: (notification: NotificationCardData) => void;
  onMarkAsRead?: (notification: NotificationCardData) => void;
  compact?: boolean;
  showMarkAsRead?: boolean;
  style?: StyleProp<ViewStyle>;
}

const NOTIFICATION_STYLES: Record<
  NotificationType,
  {
    icon: string;
    background: string;
    color: string;
  }
> = {
  NEW_ITEM: {
    icon: '📦',
    background: '#E8EEFF',
    color: '#2563EB',
  },
  ITEM_MATCH: {
    icon: '🔎',
    background: '#E0F2FE',
    color: '#0284C7',
  },
  NEW_CLAIM: {
    icon: '📋',
    background: '#FFF4D6',
    color: '#D97706',
  },
  CLAIM_APPROVED: {
    icon: '✓',
    background: '#DCFCE7',
    color: '#16A34A',
  },
  CLAIM_REJECTED: {
    icon: '✕',
    background: '#FEE2E2',
    color: '#DC2626',
  },
  CLAIM_COMPLETED: {
    icon: '🎉',
    background: '#CCFBF1',
    color: '#0D9488',
  },
  ITEM_RETURNED: {
    icon: '🤝',
    background: '#DCFCE7',
    color: '#15803D',
  },
  ANNOUNCEMENT: {
    icon: '📢',
    background: '#F3E8FF',
    color: '#7C3AED',
  },
  SYSTEM: {
    icon: '⚙',
    background: '#F1F5F9',
    color: '#475569',
  },
  GENERAL: {
    icon: '🔔',
    background: '#E8EEFF',
    color: '#2563EB',
  },
};

const formatRelativeTime = (date?: string): string => {
  if (!date) return 'Recently';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  const difference = Date.now() - parsedDate.getTime();

  if (difference < 0) {
    return 'Just now';
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return parsedDate.toLocaleDateString();
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  compact = false,
  showMarkAsRead = true,
  style,
}) => {
  const notificationStyle =
    NOTIFICATION_STYLES[notification.type];

  const handlePress = () => {
    onPress?.(notification);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead?.(notification);
  };

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${notification.title}. ${notification.message}. ${
        notification.isRead ? 'Read' : 'Unread'
      }`}
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        !notification.isRead && styles.unreadCard,
        compact && styles.compactCard,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: notificationStyle.background },
          ]}
        >
          <Text
            style={[
              styles.icon,
              { color: notificationStyle.color },
            ]}
          >
            {notificationStyle.icon}
          </Text>
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headingRow}>
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                !notification.isRead && styles.unreadTitle,
              ]}
            >
              {notification.title}
            </Text>

            {!notification.isRead ? (
              <View style={styles.unreadDot} />
            ) : null}
          </View>

          <Text
            numberOfLines={compact ? 2 : 3}
            style={styles.message}
          >
            {notification.message}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.time}>
              {formatRelativeTime(notification.createdAt)}
            </Text>

            {!notification.isRead &&
            showMarkAsRead &&
            onMarkAsRead ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark notification as read"
                onPress={handleMarkAsRead}
                hitSlop={8}
                style={styles.markReadButton}
              >
                <Text style={styles.markReadText}>
                  Mark as read
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF4',
  },
  unreadCard: {
    backgroundColor: '#F8FAFF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  compactCard: {
    padding: 11,
    marginBottom: 7,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 19,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: '#526078',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  unreadTitle: {
    color: '#172033',
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  message: {
    color: '#718096',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
  },
  time: {
    color: '#94A3B8',
    fontSize: 10,
  },
  markReadButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  markReadText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default NotificationCard;