import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import SettingsRow from "../components/SettingsRow";

import styles, { COLORS } from "../styles/SettingsScreen.styles";

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "../services/notificationSettingsService";

interface NotificationNavigation {
  goBack: () => void;
}

interface NotificationSettingsScreenProps {
  navigation: NotificationNavigation;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  navigation,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------------------------------
  // Load saved preferences
  // ----------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadPreferences = async () => {
      try {
        const saved = await getNotificationPreferences();

        if (mounted) {
          setPreferences(saved);
        }
      } catch {
        Alert.alert(
          "Settings unavailable",
          "Unable to load notification preferences.",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------
  // Persist preferences
  // ----------------------------------------------------

  const savePreferences = useCallback(async (next: NotificationPreferences) => {
    try {
      await saveNotificationPreferences(next);

      setPreferences(next);
    } catch {
      Alert.alert(
        "Unable to save",
        "Your notification settings could not be saved.",
      );
    }
  }, []);

  // ----------------------------------------------------
  // Update individual preference
  // ----------------------------------------------------

  const updatePreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      const next: NotificationPreferences = {
        ...preferences,
        [key]: value,
      };

      if (key === "allEnabled") {
        next.claimUpdates = value;
        next.itemMatches = value;
        next.itemUpdates = value;
        next.securityAlerts = value;
        next.announcements = value;
        next.messages = value;
      } else if (
        key === "claimUpdates" ||
        key === "itemMatches" ||
        key === "itemUpdates" ||
        key === "securityAlerts" ||
        key === "announcements" ||
        key === "messages"
      ) {
        next.allEnabled =
          next.claimUpdates &&
          next.itemMatches &&
          next.itemUpdates &&
          next.securityAlerts &&
          next.announcements &&
          next.messages;
      }

      savePreferences(next);
    },
    [preferences, savePreferences],
  );

  // ----------------------------------------------------
  // Reset preferences
  // ----------------------------------------------------

  const handleReset = () => {
    Alert.alert(
      "Reset notification settings?",
      "All notification preferences will return to their default values.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () =>
            savePreferences({
              ...DEFAULT_NOTIFICATION_PREFERENCES,
            }),
        },
      ],
    );
  };

  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>
            Loading notification settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.subHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={navigation.goBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <View style={styles.subHeaderContent}>
            <Text style={styles.subHeaderTitle}>Notification Settings</Text>

            <Text style={styles.subHeaderSubtitle}>
              Manage your notification preferences.
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>Notification Preferences</Text>

              <Text style={styles.introDescription}>
                Choose which updates and alerts you want to receive.
              </Text>
            </View>
          </View>

          {/* Master notification control */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Settings</Text>

            <View style={styles.sectionCard}>
              <SettingsRow
                icon="notifications"
                title="All Notifications"
                description="Master notification control"
                switchValue={preferences.allEnabled}
                showDivider={false}
                onSwitchChange={(value) =>
                  updatePreference("allEnabled", value)
                }
              />
            </View>
          </View>

          {/* Activity notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Notifications</Text>

            <Text style={styles.sectionDescription}>
              Choose which application activities notify you.
            </Text>

            <View style={styles.sectionCard}>
              <SettingsRow
                icon="hand-left-outline"
                title="Claim Updates"
                description="Updates about your ownership claims"
                switchValue={preferences.claimUpdates}
                onSwitchChange={(value) =>
                  updatePreference("claimUpdates", value)
                }
              />

              <SettingsRow
                icon="search-outline"
                title="Matching Items"
                description="When an item matches your search or report"
                switchValue={preferences.itemMatches}
                onSwitchChange={(value) =>
                  updatePreference("itemMatches", value)
                }
              />

              <SettingsRow
                icon="cube-outline"
                title="Item Updates"
                description="Updates to lost and found item listings"
                switchValue={preferences.itemUpdates}
                onSwitchChange={(value) =>
                  updatePreference("itemUpdates", value)
                }
              />

              <SettingsRow
                icon="shield-checkmark-outline"
                title="Security Alerts"
                description="Important security and verification alerts"
                switchValue={preferences.securityAlerts}
                onSwitchChange={(value) =>
                  updatePreference("securityAlerts", value)
                }
              />

              <SettingsRow
                icon="megaphone-outline"
                title="Announcements"
                description="Campus news and official announcements"
                switchValue={preferences.announcements}
                onSwitchChange={(value) =>
                  updatePreference("announcements", value)
                }
              />

              <SettingsRow
                icon="chatbubble-outline"
                title="Messages"
                description="Messages and communication updates"
                switchValue={preferences.messages}
                showDivider={false}
                onSwitchChange={(value) => updatePreference("messages", value)}
              />
            </View>
          </View>

          {/* Delivery preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Delivery</Text>

            <Text style={styles.sectionDescription}>
              Customize how notifications are delivered.
            </Text>

            <View style={styles.sectionCard}>
              <SettingsRow
                icon="mail-outline"
                title="Email Notifications"
                description="Receive supported notifications by email"
                switchValue={preferences.emailNotifications}
                onSwitchChange={(value) =>
                  updatePreference("emailNotifications", value)
                }
              />

              <SettingsRow
                icon="volume-high-outline"
                title="Notification Sound"
                description="Play a sound for supported notifications"
                switchValue={preferences.soundEnabled}
                onSwitchChange={(value) =>
                  updatePreference("soundEnabled", value)
                }
              />

              <SettingsRow
                icon="phone-portrait-outline"
                title="Vibration"
                description="Vibrate when supported notifications arrive"
                switchValue={preferences.vibrationEnabled}
                showDivider={false}
                onSwitchChange={(value) =>
                  updatePreference("vibrationEnabled", value)
                }
              />
            </View>
          </View>

          {/* Reset */}
          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              Reset to Default Settings
            </Text>
          </Pressable>

          <Text style={styles.footerText}>
            These preferences are saved locally on this device. Actual push and
            email delivery also requires the corresponding backend and device
            notification integrations.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;
