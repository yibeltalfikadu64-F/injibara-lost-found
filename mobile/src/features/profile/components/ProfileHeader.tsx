// mobile/src/features/profile/components/ProfileHeader.tsx

import React, { memo } from "react";

import { Image, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { UserProfile } from "../services/profileApi";

import { getFullName, getInitials, getRoleLabel } from "../services/profileApi";

import styles, { COLORS } from "../styles/ProfileScreen.styles";

// ------------------------------------------------------
// Props
// ------------------------------------------------------

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditPress?: () => void;
  showEditButton?: boolean;
}

// ------------------------------------------------------
// Component
// ------------------------------------------------------

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditPress,
  showEditButton = true,
}) => {
  const fullName = getFullName(profile);
  const initials = getInitials(profile);
  const roleLabel = getRoleLabel(profile.role);

  return (
    <View style={styles.profileHeader}>
      {/* Decorative background */}
      <View style={styles.profileHeaderDecorationOne} />
      <View style={styles.profileHeaderDecorationTwo} />

      {/* Top section */}
      <View style={styles.profileHeaderTop}>
        <View style={styles.profileHeaderHeading}>
          <Text style={styles.profileHeaderTitle}>My Profile</Text>

          <Text style={styles.profileHeaderSubtitle}>
            Manage your personal information
          </Text>
        </View>

        {showEditButton && onEditPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={onEditPress}
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="create-outline" size={17} color={COLORS.primary} />

            <Text style={styles.editProfileButtonText}>Edit</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Avatar */}
      <View style={styles.profileAvatarSection}>
        <View style={styles.profileAvatarWrapper}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileAvatarFallback}>
              <Text style={styles.profileAvatarInitials}>{initials}</Text>
            </View>
          )}

          <View style={styles.profileAvatarStatus}>
            <Ionicons name="checkmark" size={13} color={COLORS.white} />
          </View>
        </View>

        <Text style={styles.profileFullName} numberOfLines={2}>
          {fullName || "Campus User"}
        </Text>

        <Text style={styles.profileEmail} numberOfLines={1}>
          {profile.email}
        </Text>

        <View style={styles.profileRoleBadge}>
          <Ionicons name="school-outline" size={14} color={COLORS.primary} />

          <Text style={styles.profileRoleText}>{roleLabel}</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(ProfileHeader);
