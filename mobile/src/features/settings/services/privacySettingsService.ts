import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIVACY_KEY = "@campus_lost_found_privacy";

export interface PrivacyPreferences {
  showPhoneNumber: boolean;
  showEmailAddress: boolean;
  showProfileToUsers: boolean;
  allowItemContact: boolean;
  allowActivityNotifications: boolean;
}

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  showPhoneNumber: false,
  showEmailAddress: false,
  showProfileToUsers: true,
  allowItemContact: true,
  allowActivityNotifications: true,
};

export const getPrivacyPreferences = async (): Promise<PrivacyPreferences> => {
  const saved = await AsyncStorage.getItem(PRIVACY_KEY);

  if (!saved) {
    return { ...DEFAULT_PRIVACY_PREFERENCES };
  }

  const parsed: unknown = JSON.parse(saved);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ...DEFAULT_PRIVACY_PREFERENCES };
  }

  return {
    ...DEFAULT_PRIVACY_PREFERENCES,
    ...parsed,
  };
};

export const savePrivacyPreferences = async (
  preferences: PrivacyPreferences,
): Promise<void> => {
  await AsyncStorage.setItem(PRIVACY_KEY, JSON.stringify(preferences));
};

export const resetPrivacyPreferences = async (): Promise<void> => {
  await savePrivacyPreferences({ ...DEFAULT_PRIVACY_PREFERENCES });
};
