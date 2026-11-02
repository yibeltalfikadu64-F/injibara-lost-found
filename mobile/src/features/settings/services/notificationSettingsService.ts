import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_KEY = '@campus_lost_found_notification_settings';

export interface NotificationPreferences {
  allEnabled: boolean;
  claimUpdates: boolean;
  itemMatches: boolean;
  itemUpdates: boolean;
  securityAlerts: boolean;
  announcements: boolean;
  messages: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  allEnabled: true,
  claimUpdates: true,
  itemMatches: true,
  itemUpdates: true,
  securityAlerts: true,
  announcements: true,
  messages: true,
  emailNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const saved = await AsyncStorage.getItem(NOTIFICATION_KEY);

    if (!saved) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    const parsed: unknown = JSON.parse(saved);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
    };
  };

export const saveNotificationPreferences = async (
  preferences: NotificationPreferences,
): Promise<void> => {
  await AsyncStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify(preferences),
  );
};

export const resetNotificationPreferences = async (): Promise<void> => {
  await saveNotificationPreferences({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  });
};
