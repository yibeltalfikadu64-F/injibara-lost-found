// mobile/src/features/admin/screens/ManageUsersScreen.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { useAuthStore } from "../../auth/store/authStore";

import {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  adminApi,
} from "../services/adminApi";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  primary: "#2563EB",

  primaryDark: "#1D4ED8",

  primaryLight: "#DBEAFE",

  background: "#F5F7FB",

  white: "#FFFFFF",

  text: "#172033",

  textSecondary: "#64748B",

  textMuted: "#94A3B8",

  border: "#E2E8F0",

  success: "#16A34A",

  successLight: "#DCFCE7",

  warning: "#D97706",

  warningLight: "#FEF3C7",

  danger: "#DC2626",

  dangerLight: "#FEE2E2",

  purple: "#7C3AED",

  purpleLight: "#EDE9FE",
};

// ============================================================
// TYPES
// ============================================================

type RoleFilter = "ALL" | AdminUserRole;

type StatusFilter = "ALL" | AdminUserStatus;

type UserAction = "ACTIVATE" | "DEACTIVATE" | "SUSPEND";

interface ManageUsersNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;

  goBack: () => void;
}

interface ManageUsersScreenProps {
  navigation: ManageUsersNavigation;
}

// ============================================================
// FILTER OPTIONS
// ============================================================

const ROLE_FILTERS: {
  label: string;

  value: RoleFilter;
}[] = [
  {
    label: "All Roles",

    value: "ALL",
  },
  {
    label: "Students",

    value: "STUDENT",
  },
  {
    label: "Staff",

    value: "STAFF",
  },
  {
    label: "Security",

    value: "SECURITY",
  },
  {
    label: "Admins",

    value: "ADMIN",
  },
];

const STATUS_FILTERS: {
  label: string;

  value: StatusFilter;
}[] = [
  {
    label: "All Status",

    value: "ALL",
  },
  {
    label: "Active",

    value: "ACTIVE",
  },
  {
    label: "Inactive",

    value: "INACTIVE",
  },
  {
    label: "Suspended",

    value: "SUSPENDED",
  },
  {
    label: "Pending",

    value: "PENDING",
  },
];

// ============================================================
// HELPERS
// ============================================================

function getUserStatus(user: AdminUser): AdminUserStatus {
  if (user.status) {
    return user.status;
  }

  if (user.isActive === true) {
    return "ACTIVE";
  }

  if (user.isActive === false) {
    return "INACTIVE";
  }

  return "PENDING";
}

function getStatusAppearance(status: AdminUserStatus): {
  color: string;

  backgroundColor: string;

  icon: keyof typeof Ionicons.glyphMap;
} {
  switch (status) {
    case "ACTIVE":
      return {
        color: COLORS.success,

        backgroundColor: COLORS.successLight,

        icon: "checkmark-circle-outline",
      };

    case "INACTIVE":
      return {
        color: COLORS.textSecondary,

        backgroundColor: COLORS.border,

        icon: "pause-circle-outline",
      };

    case "SUSPENDED":
      return {
        color: COLORS.danger,

        backgroundColor: COLORS.dangerLight,

        icon: "ban-outline",
      };

    case "PENDING":
      return {
        color: COLORS.warning,

        backgroundColor: COLORS.warningLight,

        icon: "time-outline",
      };
  }
}

function getRoleAppearance(role: AdminUserRole): {
  color: string;

  backgroundColor: string;

  icon: keyof typeof Ionicons.glyphMap;
} {
  switch (role) {
    case "STUDENT":
      return {
        color: COLORS.primary,

        backgroundColor: COLORS.primaryLight,

        icon: "school-outline",
      };

    case "STAFF":
      return {
        color: COLORS.purple,

        backgroundColor: COLORS.purpleLight,

        icon: "briefcase-outline",
      };

    case "SECURITY":
      return {
        color: COLORS.success,

        backgroundColor: COLORS.successLight,

        icon: "shield-checkmark-outline",
      };

    case "ADMIN":
      return {
        color: COLORS.danger,

        backgroundColor: COLORS.dangerLight,

        icon: "shield-outline",
      };
  }
}

// ============================================================
// FILTER CHIP
// ============================================================

interface FilterChipProps {
  label: string;

  selected: boolean;

  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        backgroundColor: selected ? COLORS.primary : COLORS.white,

        borderWidth: 1,

        borderColor: selected ? COLORS.primary : COLORS.border,

        borderRadius: 20,

        paddingHorizontal: 14,

        paddingVertical: 9,

        marginRight: 8,
      }}
    >
      <Text
        style={{
          color: selected ? COLORS.white : COLORS.textSecondary,

          fontSize: 11,

          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

// ============================================================
// USER STATISTIC
// ============================================================

const UserStatistic: React.FC<{
  title: string;

  value: number;

  icon: keyof typeof Ionicons.glyphMap;

  color: string;

  backgroundColor: string;
}> = ({ title, value, icon, color, backgroundColor }) => (
  <View
    style={{
      flex: 1,
      minWidth: "46%",
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 14,
      padding: 13,
      marginBottom: 10,
    }}
  >
    <View
      style={{
        width: 35,
        height: 35,
        borderRadius: 11,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={18} color={color} />
    </View>

    <Text
      style={{
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "900",
        marginTop: 10,
      }}
    >
      {value}
    </Text>

    <Text
      style={{
        color: COLORS.textSecondary,
        fontSize: 11,
        marginTop: 3,
      }}
    >
      {title}
    </Text>
  </View>
);

// ============================================================
// USER CARD
// ============================================================

interface UserCardProps {
  user: AdminUser;

  isUpdating: boolean;

  onPress: (user: AdminUser) => void;

  onAction: (user: AdminUser, action: UserAction) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isUpdating,
  onPress,
  onAction,
}) => {
  const status = getUserStatus(user);

  const statusAppearance = getStatusAppearance(status);

  const roleAppearance = getRoleAppearance(user.role);

  const fullName = adminApi.getUserName(user);

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 17,
        padding: 15,
        marginBottom: 12,
      }}
    >
      {/* User information */}
      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(user)}
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {user.avatarUrl || user.profileImage ? (
          <Image
            source={{
              uri: user.avatarUrl ?? user.profileImage ?? "",
            }}
            style={{
              width: 49,
              height: 49,
              borderRadius: 16,
              backgroundColor: COLORS.background,
            }}
          />
        ) : (
          <View
            style={{
              width: 49,
              height: 49,
              borderRadius: 16,
              backgroundColor: COLORS.primaryLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: COLORS.primary,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              {initials || "U"}
            </Text>
          </View>
        )}

        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.text,
              fontSize: 14,
              fontWeight: "900",
            }}
          >
            {fullName}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: COLORS.textSecondary,
              fontSize: 11,
              marginTop: 4,
            }}
          >
            {user.email}
          </Text>

          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: 10,
              marginTop: 3,
            }}
          >
            ID: {user.universityId ?? user.studentId ?? "Not provided"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={19} color={COLORS.textMuted} />
      </Pressable>

      {/* Badges */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 14,
          gap: 7,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: roleAppearance.backgroundColor,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Ionicons
            name={roleAppearance.icon}
            size={12}
            color={roleAppearance.color}
          />

          <Text
            style={{
              color: roleAppearance.color,
              fontSize: 10,
              fontWeight: "800",
              marginLeft: 5,
            }}
          >
            {adminApi.getRoleLabel(user.role)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: statusAppearance.backgroundColor,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Ionicons
            name={statusAppearance.icon}
            size={12}
            color={statusAppearance.color}
          />

          <Text
            style={{
              color: statusAppearance.color,
              fontSize: 10,
              fontWeight: "800",
              marginLeft: 5,
            }}
          >
            {adminApi.getUserStatusLabel(status)}
          </Text>
        </View>
      </View>

      {/* Department */}
      {user.department ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Ionicons
            name="business-outline"
            size={14}
            color={COLORS.textMuted}
          />

          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 11,
              marginLeft: 7,
            }}
          >
            {user.department}
          </Text>
        </View>
      ) : null}

      {/* Account information */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 13,
          paddingTop: 11,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: 10,
          }}
        >
          Joined {adminApi.formatDate(user.createdAt)}
        </Text>

        <Text
          style={{
            color: user.isVerified ? COLORS.success : COLORS.textMuted,
            fontSize: 10,
            fontWeight: "700",
          }}
        >
          {user.isVerified ? "Verified account" : "Verification not confirmed"}
        </Text>
      </View>

      {/* Actions */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 14,
        }}
      >
        {status !== "ACTIVE" ? (
          <Pressable
            disabled={isUpdating}
            onPress={() => onAction(user, "ACTIVATE")}
            style={{
              flex: 1,
              minWidth: "28%",
              backgroundColor: COLORS.successLight,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "center",
              opacity: isUpdating ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                color: COLORS.success,
                fontSize: 10,
                fontWeight: "900",
              }}
            >
              Activate
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={isUpdating}
            onPress={() => onAction(user, "DEACTIVATE")}
            style={{
              flex: 1,
              minWidth: "28%",
              backgroundColor: COLORS.warningLight,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "center",
              opacity: isUpdating ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                color: COLORS.warning,
                fontSize: 10,
                fontWeight: "900",
              }}
            >
              Deactivate
            </Text>
          </Pressable>
        )}

        {status !== "SUSPENDED" ? (
          <Pressable
            disabled={isUpdating}
            onPress={() => onAction(user, "SUSPEND")}
            style={{
              flex: 1,
              minWidth: "28%",
              backgroundColor: COLORS.dangerLight,
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "center",
              opacity: isUpdating ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                color: COLORS.danger,
                fontSize: 10,
                fontWeight: "900",
              }}
            >
              Suspend
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          disabled={isUpdating}
          onPress={() => onPress(user)}
          style={{
            flex: 1,
            minWidth: "28%",
            backgroundColor: COLORS.primaryLight,
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
            opacity: isUpdating ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 10,
              fontWeight: "900",
            }}
          >
            View Details
          </Text>
        </Pressable>
      </View>

      {isUpdating ? (
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color={COLORS.primary} />

          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 10,
              marginLeft: 8,
            }}
          >
            Updating account...
          </Text>
        </View>
      ) : null}
    </View>
  );
};

// ============================================================
// MAIN SCREEN
// ============================================================

const ManageUsersScreen: React.FC<ManageUsersScreenProps> = ({
  navigation,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalUsers, setTotalUsers] = useState(0);

  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to manage users.");

        setIsLoading(false);

        setIsRefreshing(false);

        return;
      }

      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const result = await adminApi.getUsers(accessToken, {
          page: refresh ? 1 : page,

          limit: 20,

          search: search.trim(),

          role: roleFilter,

          status: statusFilter,

          sortBy: "createdAt",

          sortOrder: "desc",
        });

        setUsers(result.data);

        setPage(result.pagination.page);

        setTotalPages(result.pagination.totalPages);

        setTotalUsers(result.pagination.total);
      } catch (err) {
        setError(adminApi.getSecurityErrorMessage(err));
      } finally {
        setIsLoading(false);

        setIsRefreshing(false);
      }
    },
    [accessToken, page, search, roleFilter, statusFilter],
  );

  // ==========================================================
  // RELOAD ON FILTER CHANGE AND SCREEN FOCUS
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers]),
  );

  // ==========================================================
  // USER STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    return {
      total: totalUsers,

      active: users.filter((user) => getUserStatus(user) === "ACTIVE").length,

      inactive: users.filter((user) => getUserStatus(user) === "INACTIVE")
        .length,

      suspended: users.filter((user) => getUserStatus(user) === "SUSPENDED")
        .length,
    };
  }, [users, totalUsers]);

  // ==========================================================
  // OPEN USER DETAILS
  // ==========================================================

  const openUserDetails = (user: AdminUser) => {
    navigation.navigate("AdminUserDetails", {
      userId: user.id,
    });
  };

  // ==========================================================
  // UPDATE USER STATUS
  // ==========================================================

  const performUserAction = async (user: AdminUser, action: UserAction) => {
    if (!accessToken) {
      Alert.alert("Authentication Required", "Please sign in again.");

      return;
    }

    // Prevent an administrator from changing their own
    // account status from this screen.
    if (currentUser && (currentUser as { id?: string }).id === user.id) {
      Alert.alert(
        "Action Not Allowed",
        "You cannot change your own administrator account status here.",
      );

      return;
    }

    try {
      setUpdatingUserId(user.id);

      let updatedUser: AdminUser;

      if (action === "ACTIVATE") {
        updatedUser = await adminApi.activateUser(accessToken, user.id);
      } else if (action === "DEACTIVATE") {
        updatedUser = await adminApi.deactivateUser(accessToken, user.id);
      } else {
        updatedUser = await adminApi.suspendUser(accessToken, user.id);
      }

      setUsers((previous) =>
        previous.map((entry) => (entry.id === user.id ? updatedUser : entry)),
      );

      Alert.alert(
        "Account Updated",
        `${adminApi.getUserName(user)}'s account was updated successfully.`,
      );
    } catch (err) {
      Alert.alert("Update Failed", adminApi.getSecurityErrorMessage(err));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ==========================================================
  // CONFIRM USER ACTION
  // ==========================================================

  const confirmUserAction = (user: AdminUser, action: UserAction) => {
    const actionDetails: Record<
      UserAction,
      {
        title: string;

        message: string;

        button: string;
      }
    > = {
      ACTIVATE: {
        title: "Activate Account",

        message: `Are you sure you want to activate ${adminApi.getUserName(user)}'s account?`,

        button: "Activate",
      },

      DEACTIVATE: {
        title: "Deactivate Account",

        message: `Are you sure you want to deactivate ${adminApi.getUserName(user)}'s account?`,

        button: "Deactivate",
      },

      SUSPEND: {
        title: "Suspend Account",

        message: `Are you sure you want to suspend ${adminApi.getUserName(user)}'s account? This may prevent the user from accessing the application.`,

        button: "Suspend",
      },
    };

    const details = actionDetails[action];

    Alert.alert(details.title, details.message, [
      {
        text: "Cancel",

        style: "cancel",
      },
      {
        text: details.button,

        style:
          action === "SUSPEND" || action === "DEACTIVATE"
            ? "destructive"
            : "default",

        onPress: () => performUserAction(user, action),
      },
    ]);
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchChange = (value: string) => {
    setSearch(value);

    setPage(1);
  };

  // ==========================================================
  // FILTER CHANGE
  // ==========================================================

  const handleRoleChange = (value: RoleFilter) => {
    setRoleFilter(value);

    setPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);

    setPage(1);
  };

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((previous) => previous - 1);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage((previous) => previous + 1);
    }
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");

    setRoleFilter("ALL");

    setStatusFilter("ALL");

    setPage(1);
  };

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  const renderEmptyState = () => (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 17,
        padding: 30,
        alignItems: "center",
        marginTop: 15,
      }}
    >
      <View
        style={{
          width: 65,
          height: 65,
          borderRadius: 22,
          backgroundColor: COLORS.primaryLight,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="people-outline" size={31} color={COLORS.primary} />
      </View>

      <Text
        style={{
          color: COLORS.text,
          fontSize: 15,
          fontWeight: "900",
          marginTop: 15,
        }}
      >
        No Users Found
      </Text>

      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: 11,
          textAlign: "center",
          lineHeight: 18,
          marginTop: 7,
        }}
      >
        No accounts match your search or selected filters.
      </Text>

      <Pressable
        onPress={clearFilters}
        style={{
          marginTop: 17,
          backgroundColor: COLORS.primary,
          borderRadius: 11,
          paddingHorizontal: 20,
          paddingVertical: 11,
        }}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: 11,
            fontWeight: "900",
          }}
        >
          Clear Filters
        </Text>
      </Pressable>
    </View>
  );

  // ==========================================================
  // USER LIST ITEM
  // ==========================================================

  const renderUser = ({ item }: { item: AdminUser }) => (
    <UserCard
      user={item}
      isUpdating={updatingUserId === item.id}
      onPress={openUserDetails}
      onAction={confirmUserAction}
    />
  );

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text
          style={{
            color: COLORS.textSecondary,
            marginTop: 12,
            fontSize: 13,
          }}
        >
          Loading user accounts...
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.white,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 17,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            backgroundColor: COLORS.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 17,
              fontWeight: "900",
            }}
          >
            Manage Users
          </Text>

          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 10,
              marginTop: 3,
            }}
          >
            Campus account administration
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => loadUsers(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            backgroundColor: COLORS.primaryLight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
        </Pressable>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 15,
          paddingBottom: 35,
          flexGrow: users.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadUsers(true)}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Intro */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 21,
                  fontWeight: "900",
                }}
              >
                User Management
              </Text>

              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 11,
                  lineHeight: 18,
                  marginTop: 6,
                }}
              >
                Manage student, staff, security, and administrator accounts.
              </Text>
            </View>

            {/* Statistics */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <UserStatistic
                title="Total Users"
                value={statistics.total}
                icon="people-outline"
                color={COLORS.primary}
                backgroundColor={COLORS.primaryLight}
              />

              <UserStatistic
                title="Active on This Page"
                value={statistics.active}
                icon="checkmark-circle-outline"
                color={COLORS.success}
                backgroundColor={COLORS.successLight}
              />

              <UserStatistic
                title="Inactive on This Page"
                value={statistics.inactive}
                icon="pause-circle-outline"
                color={COLORS.warning}
                backgroundColor={COLORS.warningLight}
              />

              <UserStatistic
                title="Suspended on This Page"
                value={statistics.suspended}
                icon="ban-outline"
                color={COLORS.danger}
                backgroundColor={COLORS.dangerLight}
              />
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 13,
                paddingHorizontal: 13,
                marginTop: 9,
                marginBottom: 18,
              }}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color={COLORS.textMuted}
              />

              <TextInput
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Search name, email, ID, department..."
                placeholderTextColor={COLORS.textMuted}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  color: COLORS.text,
                  fontSize: 12,
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {search.length > 0 ? (
                <Pressable onPress={() => handleSearchChange("")}>
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={COLORS.textMuted}
                  />
                </Pressable>
              ) : null}
            </View>

            {/* Role filter */}
            <Text
              style={{
                color: COLORS.text,
                fontSize: 13,
                fontWeight: "900",
                marginBottom: 10,
              }}
            >
              Filter by Role
            </Text>

            <FlatList
              data={ROLE_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <FilterChip
                  label={item.label}
                  selected={roleFilter === item.value}
                  onPress={() => handleRoleChange(item.value)}
                />
              )}
              style={{ marginBottom: 17 }}
            />

            {/* Status filter */}
            <Text
              style={{
                color: COLORS.text,
                fontSize: 13,
                fontWeight: "900",
                marginBottom: 10,
              }}
            >
              Filter by Account Status
            </Text>

            <FlatList
              data={STATUS_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <FilterChip
                  label={item.label}
                  selected={statusFilter === item.value}
                  onPress={() => handleStatusChange(item.value)}
                />
              )}
              style={{ marginBottom: 17 }}
            />

            {/* Error */}
            {error ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: COLORS.dangerLight,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 15,
                }}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={COLORS.danger}
                />

                <Text
                  style={{
                    flex: 1,
                    color: COLORS.danger,
                    fontSize: 11,
                    marginLeft: 8,
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* List header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: 15,
                  fontWeight: "900",
                }}
              >
                Registered Accounts
              </Text>

              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 10,
                }}
              >
                {users.length} shown
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          users.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 13,
                padding: 12,
                marginTop: 5,
              }}
            >
              <Pressable
                disabled={page <= 1}
                onPress={goToPreviousPage}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 8,
                  opacity: page <= 1 ? 0.35 : 1,
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={17}
                  color={COLORS.primary}
                />

                <Text
                  style={{
                    color: COLORS.primary,
                    fontSize: 11,
                    fontWeight: "800",
                  }}
                >
                  Previous
                </Text>
              </Pressable>

              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Page {page} of {totalPages}
              </Text>

              <Pressable
                disabled={page >= totalPages}
                onPress={goToNextPage}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 8,
                  opacity: page >= totalPages ? 0.35 : 1,
                }}
              >
                <Text
                  style={{
                    color: COLORS.primary,
                    fontSize: 11,
                    fontWeight: "800",
                  }}
                >
                  Next
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={COLORS.primary}
                />
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default ManageUsersScreen;
