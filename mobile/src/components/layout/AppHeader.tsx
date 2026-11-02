import React from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

interface HeaderAction {
  label?: string;
  icon?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  badgeCount?: number;
  disabled?: boolean;
}

interface AppHeaderProps {
  title?: string;
  subtitle?: string;

  showBackButton?: boolean;
  onBackPress?: () => void;

  leftAction?: HeaderAction;
  rightAction?: HeaderAction;

  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;

  showAvatar?: boolean;
  avatarUri?: string;
  avatarSource?: ImageSourcePropType;
  avatarName?: string;
  onAvatarPress?: () => void;

  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  iconColor?: string;

  borderBottom?: boolean;

  centered?: boolean;

  containerStyle?: ViewStyle;

  logo?: React.ReactNode;

  rightComponent?: React.ReactNode;
}

const COLORS = {
  primary: '#2563EB',
  text: '#172033',
  secondary: '#718096',
  border: '#E2E8F0',
  white: '#FFFFFF',
  muted: '#F1F5F9',
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Campus Lost & Found',
  subtitle,

  showBackButton = false,
  onBackPress,

  leftAction,
  rightAction,

  showNotification = false,
  notificationCount = 0,
  onNotificationPress,

  showAvatar = false,
  avatarUri,
  avatarSource,
  avatarName,
  onAvatarPress,

  backgroundColor = COLORS.white,
  titleColor = COLORS.text,
  subtitleColor = COLORS.secondary,
  iconColor = COLORS.text,

  borderBottom = true,

  centered = false,

  containerStyle,

  logo,

  rightComponent,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const renderAction = (
    action: HeaderAction,
    defaultLabel: string,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        action.accessibilityLabel || defaultLabel
      }
      accessibilityState={{
        disabled: action.disabled,
      }}
      disabled={action.disabled}
      onPress={action.onPress}
      style={styles.actionButton}
    >
      {action.icon ? (
        <Text
          style={[
            styles.actionIcon,
            { color: iconColor },
          ]}
        >
          {action.icon}
        </Text>
      ) : null}

      {action.label ? (
        <Text style={styles.actionLabel}>
          {action.label}
        </Text>
      ) : null}

      {action.badgeCount && action.badgeCount > 0 ? (
        <View style={styles.actionBadge}>
          <Text style={styles.badgeText}>
            {action.badgeCount > 99
              ? '99+'
              : action.badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );

  const renderAvatar = () => {
    if (avatarSource) {
      return (
        <Image
          source={avatarSource}
          style={styles.avatar}
        />
      );
    }

    if (avatarUri) {
      return (
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
        />
      );
    }

    const initials = avatarName
      ? avatarName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join('')
      : 'U';

    return (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarInitials}>
          {initials}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderBottomColor: borderBottom
            ? COLORS.border
            : 'transparent',
          borderBottomWidth: borderBottom ? 1 : 0,
        },
        containerStyle,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              style={styles.backButton}
            >
              <Text
                style={[
                  styles.backIcon,
                  { color: iconColor },
                ]}
              >
                ‹
              </Text>
            </Pressable>
          ) : null}

          {leftAction
            ? renderAction(leftAction, 'Left action')
            : null}

          {logo ? (
            <View style={styles.logoContainer}>
              {logo}
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.titleContainer,
            centered && styles.centeredTitle,
          ]}
        >
          {title ? (
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                { color: titleColor },
              ]}
            >
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                { color: subtitleColor },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightContainer}>
          {rightAction
            ? renderAction(rightAction, 'Right action')
            : null}

          {showNotification && onNotificationPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Notifications${
                notificationCount > 0
                  ? `, ${notificationCount} unread`
                  : ''
              }`}
              onPress={onNotificationPress}
              style={styles.iconButton}
            >
              <Text
                style={[
                  styles.notificationIcon,
                  { color: iconColor },
                ]}
              >
                ♧
              </Text>

              {notificationCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99
                      ? '99+'
                      : notificationCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}

          {showAvatar && onAvatarPress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={onAvatarPress}
              style={styles.avatarButton}
            >
              {renderAvatar()}
            </Pressable>
          ) : null}

          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 38,
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 38,
    gap: 7,
  },

  titleContainer: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },

  centeredTitle: {
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 10,
    marginTop: 3,
  },

  backButton: {
    width: 37,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '400',
  },

  actionButton: {
    minHeight: 38,
    minWidth: 38,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    paddingHorizontal: 5,
  },

  actionIcon: {
    fontSize: 20,
    fontWeight: '700',
  },

  actionLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  actionBadge: {
    position: 'absolute',
    top: 0,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  iconButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 22,
  },

  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: -1,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },

  avatarButton: {
    padding: 2,
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.muted,
  },

  avatarFallback: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitials: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },

  logoContainer: {
    marginRight: 5,
  },
});

export default AppHeader;