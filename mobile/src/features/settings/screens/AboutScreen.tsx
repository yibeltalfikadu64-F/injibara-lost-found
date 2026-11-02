// mobile/src/features/settings/screens/AboutScreen.tsx

import React from "react";

import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Constants from "expo-constants";

import styles, { COLORS } from "../styles/SettingsScreen.styles";

// ------------------------------------------------------
// Application information
// ------------------------------------------------------

const APP_NAME = "Injibara Campus Lost & Found";

const APP_DESCRIPTION =
  "A campus platform that helps students and staff report lost belongings, discover found items, and securely reconnect belongings with their rightful owners.";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const APP_DEVELOPER = "Injibara Campus Lost & Found Team";

// ------------------------------------------------------
// Navigation
// ------------------------------------------------------

interface AboutNavigation {
  goBack: () => void;
}

interface AboutScreenProps {
  navigation: AboutNavigation;
}

// ------------------------------------------------------
// Feature data
// ------------------------------------------------------

const FEATURES = [
  {
    icon: "search-outline" as const,
    title: "Find Lost Items",
    description:
      "Search for belongings reported as lost or found across the campus.",
  },
  {
    icon: "create-outline" as const,
    title: "Report Lost and Found Items",
    description:
      "Submit item descriptions, photos, and relevant location information.",
  },
  {
    icon: "hand-left-outline" as const,
    title: "Ownership Claims",
    description:
      "Submit claims and provide verification information to establish ownership.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Secure Handover",
    description:
      "Support secure item handover through authorized campus personnel.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Notifications",
    description:
      "Receive relevant updates about item reports and ownership claims.",
  },
  {
    icon: "people-outline" as const,
    title: "Campus Community",
    description: "Connect students, staff, and authorized security personnel.",
  },
];

// ------------------------------------------------------
// Feature item
// ------------------------------------------------------

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => (
  <View style={styles.aboutFeature}>
    <View style={styles.aboutFeatureIcon}>
      <Ionicons name={icon} size={19} color={COLORS.primary} />
    </View>

    <View style={styles.aboutFeatureContent}>
      <Text style={styles.aboutFeatureTitle}>{title}</Text>

      <Text style={styles.aboutFeatureDescription}>{description}</Text>
    </View>
  </View>
);

// ------------------------------------------------------
// Component
// ------------------------------------------------------

const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  // ----------------------------------------------------
  // Open external links
  // ----------------------------------------------------

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Unable to open link",
          "This link is not supported on your device.",
        );

        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "Unable to open the requested link.");
    }
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={styles.subHeaderContent}>
          <Text style={styles.subHeaderTitle}>About Application</Text>

          <Text style={styles.subHeaderSubtitle}>
            Learn more about our platform
          </Text>
        </View>

        <Ionicons
          name="information-circle-outline"
          size={23}
          color={COLORS.primary}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.aboutHero}>
          <View style={styles.aboutLogo}>
            <Ionicons name="search" size={55} color={COLORS.white} />
          </View>

          <Text style={styles.aboutTitle}>{APP_NAME}</Text>

          <Text style={styles.aboutSubtitle}>{APP_DESCRIPTION}</Text>

          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Purpose</Text>

          <View style={styles.privacyInfoCard}>
            <Text style={styles.privacyInfoTitle}>
              Reconnecting people with their belongings
            </Text>

            <Text style={styles.privacyInfoText}>
              Losing personal belongings on campus can be stressful. Our
              platform provides a centralized place where members of the
              Injibara University community can report lost belongings, publish
              found items, and coordinate secure ownership verification.
              {"\n\n"}
              The goal is to make campus item recovery more organized,
              accessible, and secure.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Features</Text>

          <Text style={styles.sectionDescription}>
            Tools available to support campus item recovery.
          </Text>

          <View style={[styles.privacyInfoCard, { marginTop: 15 }]}>
            {FEATURES.map((feature) => (
              <FeatureItem
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </View>
        </View>

        {/* User groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Can Use the Application?</Text>

          <View style={styles.sectionCard}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsRowIcon}>
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingsRowContent}>
                <Text style={styles.settingsRowTitle}>Students</Text>

                <Text style={styles.settingsRowDescription}>
                  Report lost and found belongings and submit ownership claims.
                </Text>
              </View>
            </View>

            <View style={styles.settingsRow}>
              <View style={styles.settingsRowIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingsRowContent}>
                <Text style={styles.settingsRowTitle}>Staff Members</Text>

                <Text style={styles.settingsRowDescription}>
                  Participate in item reporting and recovery activities.
                </Text>
              </View>
            </View>

            <View style={styles.settingsRow}>
              <View style={styles.settingsRowIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingsRowContent}>
                <Text style={styles.settingsRowTitle}>Security Personnel</Text>

                <Text style={styles.settingsRowDescription}>
                  Support verification, claims, and authorized handovers.
                </Text>
              </View>
            </View>

            <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingsRowIcon}>
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingsRowContent}>
                <Text style={styles.settingsRowTitle}>Administrators</Text>

                <Text style={styles.settingsRowDescription}>
                  Manage users, reports, categories, locations, and application
                  operations.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Developer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Information</Text>

          <View style={styles.privacyInfoCard}>
            <Text style={styles.privacyInfoTitle}>
              Developed for Injibara University
            </Text>

            <Text style={styles.privacyInfoText}>
              Developer / Project Team: {APP_DEVELOPER}
              {"\n\n"}
              Application: {APP_NAME}
              {"\n\n"}
              Current Version: {APP_VERSION}
            </Text>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Information</Text>

          <View style={styles.sectionCard}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  "Privacy Information",
                  "Review the Privacy section in Settings for information about local preferences and account data.",
                )
              }
              style={styles.settingsRow}
            >
              <View style={styles.settingsRowIcon}>
                <Ionicons
                  name="shield-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingsRowContent}>
                <Text style={styles.settingsRowTitle}>Privacy Information</Text>

                <Text style={styles.settingsRowDescription}>
                  Learn about privacy preferences
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textMuted}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  "Terms of Use",
                  "Use this application responsibly. Submit accurate reports and only claim items that belong to you. Follow campus security instructions during item handover.",
                )
              }
              style={[styles.settingsRow, { borderBottomWidth: 0 }]}
            >
              <View style={styles.settingsRowIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.settingsRowContent}>
                <Text style={styles.settingsRowTitle}>Terms of Use</Text>

                <Text style={styles.settingsRowDescription}>
                  Responsible use of the platform
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="heart" size={16} color={COLORS.danger} />

          <Text style={styles.footerText}>
            Made to support the Injibara campus community.
          </Text>

          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {APP_NAME}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
