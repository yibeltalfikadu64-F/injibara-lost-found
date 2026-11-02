
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import SettingsRow from '../components/SettingsRow';

import styles, { COLORS } from '../styles/SettingsScreen.styles';

import {
  DEFAULT_PRIVACY_PREFERENCES,
  getPrivacyPreferences,
  savePrivacyPreferences,
  type PrivacyPreferences,
} from '../services/privacySettingsService';

interface PrivacyNavigation {
  goBack: () => void;
  navigate: (screen: string) => void;
}

interface PrivacyScreenProps {
  navigation: PrivacyNavigation;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  const [preferences, setPreferences] =
    useState<PrivacyPreferences>(DEFAULT_PRIVACY_PREFERENCES);

  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------------------------------
  // Load privacy preferences
  // ----------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadPreferences = async () => {
      try {
        const saved = await getPrivacyPreferences();

        if (mounted) {
          setPreferences(saved);
        }
      } catch {
        Alert.alert(
          'Unable to load',
          'Your privacy preferences could not be loaded.',
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
  // Save preferences
  // ----------------------------------------------------

  const savePreferences = useCallback(
    async (next: PrivacyPreferences) => {
      try {
        await savePrivacyPreferences(next);

        setPreferences(next);
      } catch {
        Alert.alert(
          'Unable to save',
          'Your privacy preferences could not be saved.',
        );
      }
    },
    [],
  );

  // ----------------------------------------------------
  // Update individual preference
  // ----------------------------------------------------

  const updatePreference = useCallback(
    (key: keyof PrivacyPreferences, value: boolean) => {
      const next: PrivacyPreferences = {
        ...preferences,
        [key]: value,
      };

      savePreferences(next);
    },
    [preferences, savePreferences],
  );

  // ----------------------------------------------------
  // Reset preferences
  // ----------------------------------------------------

  const handleReset = () => {
    Alert.alert(
      'Reset privacy settings?',
      'Your privacy preferences will return to their default values.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () =>
            savePreferences({
              ...DEFAULT_PRIVACY_PREFERENCES,
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
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loadingText}>
            Loading privacy settings...
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      {/* Header */}
      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={COLORS.text}
          />
        </Pressable>

        <View style={styles.subHeaderContent}>
          <Text style={styles.subHeaderTitle}>Privacy</Text>

          <Text style={styles.subHeaderSubtitle}>
            Control your information and visibility
          </Text>
        </View>

        <Ionicons
          name="shield-checkmark-outline"
          size={23}
          color={COLORS.primary}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy notice */}
        <View style={styles.privacyNotice}>
          <Ionicons
            name="shield-checkmark"
            size={22}
            color={COLORS.success}
          />

          <Text style={styles.privacyNoticeText}>
            Your privacy matters. Review these preferences to understand how
            your information may be displayed and used within the campus
            community.
          </Text>
        </View>

        {/* Profile visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Profile Visibility
          </Text>

          <Text style={styles.sectionDescription}>
            Control how other users can view your profile.
          </Text>

          <View style={styles.sectionCard}>
            <SettingsRow
              icon="person-circle-outline"
              title="Profile Visibility"
              description="Allow other authenticated users to view your profile"
              switchValue={preferences.showProfileToUsers}
              onSwitchChange={(value) =>
                updatePreference('showProfileToUsers', value)
              }
            />

            <SettingsRow
              icon="mail-outline"
              title="Show Email Address"
              description="Allow your email address to be displayed to other users"
              switchValue={preferences.showEmailAddress}
              onSwitchChange={(value) =>
                updatePreference('showEmailAddress', value)
              }
            />

            <SettingsRow
              icon="call-outline"
              title="Show Phone Number"
              description="Allow your phone number to be displayed to other users"
              switchValue={preferences.showPhoneNumber}
              showDivider={false}
              onSwitchChange={(value) =>
                updatePreference('showPhoneNumber', value)
              }
            />
          </View>
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Communication Preferences
          </Text>

          <Text style={styles.sectionDescription}>
            Manage how other campus members can contact you.
          </Text>

          <View style={styles.sectionCard}>
            <SettingsRow
              icon="chatbubbles-outline"
              title="Item-related Contact"
              description="Allow contact for legitimate lost and found item coordination"
              switchValue={preferences.allowItemContact}
              onSwitchChange={(value) =>
                updatePreference('allowItemContact', value)
              }
            />

            <SettingsRow
              icon="notifications-outline"
              title="Activity Notifications"
              description="Allow notifications about your account activity"
              switchValue={preferences.allowActivityNotifications}
              showDivider={false}
              onSwitchChange={(value) =>
                updatePreference('allowActivityNotifications', value)
              }
            />
          </View>
        </View>

        {/* Account security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Security
          </Text>

          <Text style={styles.sectionDescription}>
            Protect access to your account.
          </Text>

          <View style={styles.sectionCard}>
            <SettingsRow
              icon="lock-closed-outline"
              title="Change Password"
              description="Update your account password"
              onPress={() =>
                navigation.navigate('ChangePassword')
              }
            />

            <SettingsRow
              icon="shield-checkmark-outline"
              title="Account Verification"
              description="Review your account verification information"
              onPress={() => navigation.navigate('Profile')}
              showDivider={false}
            />
          </View>
        </View>

        {/* Data information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Personal Data
          </Text>

          <View style={styles.privacyInfoCard}>
            <Text style={styles.privacyInfoTitle}>
              Information we handle
            </Text>

            <Text style={styles.privacyInfoText}>
              The application may process your account details, contact
              information, item reports, ownership claims, and activity records
              to provide campus lost and found services.
              {'\n\n'}
              Access to personal information should be restricted according to
              user roles and backend authorization rules.
              {'\n\n'}
              Privacy switches on this screen save local preferences. Your
              backend must enforce actual profile visibility and data-sharing
              rules before these settings affect other users.
            </Text>
          </View>
        </View>

        {/* Reset */}
        <Pressable
          accessibilityRole="button"
          onPress={handleReset}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Reset Privacy Preferences
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          Changing a local preference does not replace server-side privacy and
          access controls.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyScreen;
