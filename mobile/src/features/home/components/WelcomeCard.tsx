// mobile/src/features/home/components/WelcomeCard.tsx

import React from "react";

import { Image, Text, View } from "react-native";

import { HomeStatistics } from "../services/homeApi";

import styles from "../styles/HomeScreen.styles";

/* =========================================================
   TYPES
========================================================= */

interface WelcomeCardProps {
  fullName?: string | null;

  statistics: HomeStatistics;

  onNotificationPress?: () => void;

  logoSource?: any;
}

/* =========================================================
   HELPERS
========================================================= */

function getFirstName(fullName?: string | null): string {
  if (!fullName) {
    return "there";
  }

  const parts = fullName.trim().split(/\s+/);

  return parts[0] || "there";
}

/* =========================================================
   COMPONENT
========================================================= */

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  fullName,
  statistics,
  onNotificationPress,
  logoSource,
}) => {
  const firstName = getFirstName(fullName);

  return (
    <View style={styles.welcomeCard}>
      {/* Top row */}

      <View style={styles.welcomeTopRow}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeEyebrow}>INJIBARA UNIVERSITY</Text>

          <Text style={styles.welcomeTitle}>Hello, {firstName}!</Text>

          <Text style={styles.welcomeSubtitle}>
            Welcome to your campus lost and found community.
          </Text>
        </View>

        <View style={styles.welcomeLogoContainer}>
          {logoSource ? (
            <Image
              source={logoSource}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.welcomeLogoPlaceholder}>IU</Text>
          )}
        </View>
      </View>

      {/* Notification action */}

      {onNotificationPress && (
        <View style={styles.welcomeNotificationRow}>
          <Text style={styles.welcomeNotificationText}>
            Find what is lost. Return what is found.
          </Text>

          <Text
            onPress={onNotificationPress}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            style={styles.notificationAction}
          >
            Notifications
          </Text>
        </View>
      )}

      {/* Statistics */}

      <View style={styles.statisticsContainer}>
        <View style={styles.statisticItem}>
          <Text style={styles.statisticNumber}>
            {statistics.totalLostItems}
          </Text>

          <Text style={styles.statisticLabel}>Lost items</Text>
        </View>

        <View style={styles.statisticDivider} />

        <View style={styles.statisticItem}>
          <Text style={styles.statisticNumber}>
            {statistics.totalFoundItems}
          </Text>

          <Text style={styles.statisticLabel}>Found items</Text>
        </View>

        <View style={styles.statisticDivider} />

        <View style={styles.statisticItem}>
          <Text style={styles.statisticNumber}>
            {statistics.totalReturnedItems}
          </Text>

          <Text style={styles.statisticLabel}>Returned</Text>
        </View>
      </View>
    </View>
  );
};

export default WelcomeCard;
