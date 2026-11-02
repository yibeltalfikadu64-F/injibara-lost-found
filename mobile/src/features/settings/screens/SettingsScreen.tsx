// mobile/src/features/settings/screens/SettingsScreen.tsx

import React, { useCallback } from "react";

import { SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import SettingsRow from "../components/SettingsRow";

import styles, { COLORS } from "../styles/SettingsScreen.styles";

const LANGUAGE_KEY = "@campus_lost_found_language";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  am: "Amharic",
  om: "Afaan Oromo",
  aw: "Awi",
};

interface SettingsNavigation {
  navigate: (screen: string) => void;
}

interface SettingsScreenProps {
  navigation: SettingsNavigation;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [language, setLanguage] = React.useState("en");

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.warn("Unable to load language preference:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLanguage();
    }, [loadLanguage]),
  );

  const navigate = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Settings</Text>

              <Text style={styles.headerSubtitle}>
                Customize your Campus Lost & Found experience.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="settings-outline"
                size={25}
                color={COLORS.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Intro */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons
                name="options-outline"
                size={23}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>Application Preferences</Text>

              <Text style={styles.introDescription}>
                Manage your language, notifications, privacy, and application
                information.
              </Text>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <Text style={styles.sectionDescription}>
                  Personalize your application
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <SettingsRow
                icon="language-outline"
                title="Language"
                description="Choose your preferred application language"
                value={LANGUAGE_NAMES[language] ?? "English"}
                onPress={() => navigate("Language")}
              />

              <SettingsRow
                icon="notifications-outline"
                title="Notifications"
                description="Manage alerts and notification preferences"
                onPress={() => navigate("NotificationSettings")}
              />

              <SettingsRow
                icon="moon-outline"
                title="Appearance"
                description="Manage your application display preferences"
                value="System default"
                showArrow={false}
                showDivider={false}
                onPress={() => navigate("Appearance")}
              />
            </View>
          </View>

          {/* Security */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Security and Privacy</Text>

                <Text style={styles.sectionDescription}>
                  Manage your personal information
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <SettingsRow
                icon="shield-checkmark-outline"
                title="Privacy"
                description="Control privacy and data preferences"
                onPress={() => navigate("Privacy")}
              />

              <SettingsRow
                icon="lock-closed-outline"
                title="Change Password"
                description="Protect your account with a strong password"
                onPress={() => navigate("ChangePassword")}
                showDivider={false}
              />
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Support and Information</Text>

                <Text style={styles.sectionDescription}>
                  Learn more about the application
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <SettingsRow
                icon="information-circle-outline"
                title="About Application"
                description="Application version and information"
                onPress={() => navigate("About")}
              />

              <SettingsRow
                icon="help-circle-outline"
                title="Help and Support"
                description="Find assistance and support"
                onPress={() => navigate("HelpSupport")}
                showDivider={false}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Injibara Campus Lost & Found</Text>

            <Text style={styles.footerText}>Settings and Preferences</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
