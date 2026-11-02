// mobile/src/features/profile/screens/ProfileScreen.tsx

import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { useAuthStore } from "../../auth/store/authStore";

import ProfileHeader from "../components/ProfileHeader";

import profileApi, {
  UserProfile,
  formatMemberSince,
  getAccountStatusColor,
} from "../services/profileApi";

import styles, { COLORS } from "../styles/ProfileScreen.styles";

// ------------------------------------------------------
// Navigation types
// ------------------------------------------------------

interface ProfileNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
}

interface ProfileScreenProps {
  navigation: ProfileNavigation;
}

// ------------------------------------------------------
// Component
// ------------------------------------------------------

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // ----------------------------------------------------
  // Authentication
  // ----------------------------------------------------

  const accessToken = useAuthStore((state) => state.accessToken);

  // ----------------------------------------------------
  // State
  // ----------------------------------------------------

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------
  // Load profile
  // ----------------------------------------------------

  const loadProfile = useCallback(
    async (showLoader = true) => {
      if (!accessToken) {
        setProfile(null);
        setError("Please sign in to view your profile.");
        setIsLoading(false);
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await profileApi.getMyProfile(accessToken);

        setProfile(result);
      } catch (requestError) {
        const message =
          requestError &&
          typeof requestError === "object" &&
          "message" in requestError
            ? String(requestError.message)
            : "Unable to load your profile.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  // ----------------------------------------------------
  // Refresh whenever the screen becomes active
  // ----------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      loadProfile(true);
    }, [loadProfile]),
  );

  // ----------------------------------------------------
  // Pull to refresh
  // ----------------------------------------------------

  const handleRefresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const result = await profileApi.getMyProfile(accessToken);

      setProfile(result);
    } catch (requestError) {
      const message =
        requestError &&
        typeof requestError === "object" &&
        "message" in requestError
          ? String(requestError.message)
          : "Unable to refresh your profile.";

      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken]);

  // ----------------------------------------------------
  // Edit profile navigation
  // ----------------------------------------------------

  const handleEditProfile = useCallback(() => {
    navigation.navigate("EditProfile", {
      profileId: profile?.id,
    });
  }, [navigation, profile]);

  // ----------------------------------------------------
  // Menu navigation
  // ----------------------------------------------------

  const handleNavigate = useCallback(
    (screen: string) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  // ----------------------------------------------------
  // Account status
  // ----------------------------------------------------

  const accountStatus = profile?.accountStatus ?? "ACTIVE";

  const accountStatusColor = getAccountStatusColor(accountStatus);

  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // Error state
  // ----------------------------------------------------

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.errorContainer}>
          <Ionicons
            name="person-circle-outline"
            size={42}
            color={COLORS.danger}
          />

          <Text style={styles.errorTitle}>Unable to load profile</Text>

          <Text style={styles.errorMessage}>{error}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => loadProfile(true)}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // No profile state
  // ----------------------------------------------------

  if (!profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorTitle}>Profile unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // Information row component
  // ----------------------------------------------------

  const InfoRow = ({
    icon,
    label,
    value,
    isLast = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string | null;
    isLast?: boolean;
  }) => (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>

        <Text style={[styles.infoValue, !value && styles.infoValueMuted]}>
          {value || "Not provided"}
        </Text>
      </View>
    </View>
  );

  // ----------------------------------------------------
  // Menu item component
  // ----------------------------------------------------

  const MenuItem = ({
    icon,
    title,
    description,
    onPress,
    danger = false,
    isLast = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
    danger?: boolean;
    isLast?: boolean;
  }) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        !isLast && styles.menuItemBorder,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons
          name={icon}
          size={19}
          color={danger ? COLORS.danger : COLORS.primary}
        />
      </View>

      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, danger && styles.menuDangerTitle]}>
          {title}
        </Text>

        <Text style={styles.menuDescription}>{description}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={COLORS.textMuted}
        style={styles.menuArrow}
      />
    </Pressable>
  );

  // ----------------------------------------------------
  // Main UI
  // ----------------------------------------------------

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.screenContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Refreshing profile..."
          />
        }
      >
        {/* Profile header */}
        <ProfileHeader profile={profile} onEditPress={handleEditProfile} />

        <View style={styles.contentContainer}>
          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#DBEAFE" },
                ]}
              >
                <Ionicons name="person-outline" size={19} color="#2563EB" />
              </View>

              <Text style={styles.statValue}>
                {profile.studentId || profile.employeeId
                  ? "Verified"
                  : "Account"}
              </Text>

              <Text style={styles.statLabel}>Campus identity</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#DCFCE7" },
                ]}
              >
                <Ionicons name="mail-outline" size={19} color="#16A34A" />
              </View>

              <Text style={styles.statValue}>
                {profile.emailVerified ? "Yes" : "No"}
              </Text>

              <Text style={styles.statLabel}>Email verified</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#F3E8FF" },
                ]}
              >
                <Ionicons name="calendar-outline" size={19} color="#9333EA" />
              </View>

              <Text style={[styles.statValue, { fontSize: 13, marginTop: 4 }]}>
                {formatMemberSince(profile.createdAt)}
              </Text>

              <Text style={styles.statLabel}>Member since</Text>
            </View>
          </View>

          {/* Personal information */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <Text style={styles.sectionSubtitle}>
                  Your basic account details
                </Text>
              </View>

              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoCard}>
              <InfoRow
                icon="person-outline"
                label="First name"
                value={profile.firstName}
              />

              <InfoRow
                icon="person-outline"
                label="Last name"
                value={profile.lastName}
              />

              <InfoRow
                icon="mail-outline"
                label="Email address"
                value={profile.email}
              />

              <InfoRow
                icon="call-outline"
                label="Phone number"
                value={profile.phoneNumber}
              />

              <InfoRow
                icon="document-text-outline"
                label="About me"
                value={profile.bio}
                isLast
              />
            </View>
          </View>

          {/* Campus information */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Campus Information</Text>

                <Text style={styles.sectionSubtitle}>
                  Your Injibara University details
                </Text>
              </View>

              <Ionicons
                name="school-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoCard}>
              <InfoRow
                icon="id-card-outline"
                label="Student ID"
                value={profile.studentId}
              />

              <InfoRow
                icon="briefcase-outline"
                label="Employee ID"
                value={profile.employeeId}
              />

              <InfoRow
                icon="business-outline"
                label="Department"
                value={profile.department}
              />

              <InfoRow
                icon="school-outline"
                label="Faculty"
                value={profile.faculty}
                isLast
              />
            </View>
          </View>

          {/* Account information */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Account Information</Text>

                <Text style={styles.sectionSubtitle}>
                  Security and account status
                </Text>
              </View>

              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusLabelContainer}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color={COLORS.success}
                  />

                  <Text style={styles.statusLabel}>Account status</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${accountStatusColor}18`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: accountStatusColor },
                    ]}
                  >
                    {accountStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusLabelContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={17}
                    color={COLORS.primary}
                  />

                  <Text style={styles.statusLabel}>Email verification</Text>
                </View>

                <Ionicons
                  name={
                    profile.emailVerified
                      ? "checkmark-circle"
                      : "alert-circle-outline"
                  }
                  size={19}
                  color={
                    profile.emailVerified ? COLORS.success : COLORS.warning
                  }
                />
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusLabelContainer}>
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color={COLORS.primary}
                  />

                  <Text style={styles.statusLabel}>Phone verification</Text>
                </View>

                <Ionicons
                  name={
                    profile.phoneVerified
                      ? "checkmark-circle"
                      : "alert-circle-outline"
                  }
                  size={19}
                  color={
                    profile.phoneVerified ? COLORS.success : COLORS.warning
                  }
                />
              </View>
            </View>
          </View>

          {/* Profile actions */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Account Settings</Text>

                <Text style={styles.sectionSubtitle}>
                  Manage your account and preferences
                </Text>
              </View>

              <Ionicons
                name="settings-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.menuCard}>
              <MenuItem
                icon="create-outline"
                title="Edit Profile"
                description="Update your personal information"
                onPress={handleEditProfile}
              />

              <MenuItem
                icon="lock-closed-outline"
                title="Change Password"
                description="Keep your account secure"
                onPress={() => handleNavigate("ChangePassword")}
              />

              <MenuItem
                icon="notifications-outline"
                title="Notifications"
                description="Manage your notifications"
                onPress={() => handleNavigate("Notifications")}
              />

              <MenuItem
                icon="help-circle-outline"
                title="Help and Support"
                description="Get assistance with the application"
                onPress={() => handleNavigate("HelpSupport")}
              />

              <MenuItem
                icon="information-circle-outline"
                title="About Application"
                description="Learn about Campus Lost & Found"
                onPress={() => handleNavigate("About")}
                isLast
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.profileFooter}>
            <Text style={styles.profileFooterText}>
              Injibara Campus Lost & Found
            </Text>

            <Text style={styles.profileFooterText}>
              Your campus. Your community. Your belongings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
