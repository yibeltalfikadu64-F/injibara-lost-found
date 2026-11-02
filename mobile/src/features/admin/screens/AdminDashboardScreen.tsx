// mobile/src/features/admin/screens/AdminDashboardScreen.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
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

import {
  AdminActivity,
  AdminDashboardStatistics,
  AdminDateRange,
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

  cyan: "#0891B2",

  cyanLight: "#CFFAFE",
};

// ============================================================
// NAVIGATION TYPES
// ============================================================

interface AdminDashboardNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;

  goBack: () => void;
}

interface AdminDashboardScreenProps {
  navigation: AdminDashboardNavigation;
}

// ============================================================
// DEFAULT STATISTICS
// ============================================================

const EMPTY_STATISTICS: AdminDashboardStatistics = {
  totalUsers: 0,

  totalStudents: 0,

  totalStaff: 0,

  totalSecurityUsers: 0,

  totalAdmins: 0,

  activeUsers: 0,

  inactiveUsers: 0,

  totalItems: 0,

  lostItems: 0,

  foundItems: 0,

  openItems: 0,

  resolvedItems: 0,

  totalClaims: 0,

  pendingClaims: 0,

  approvedClaims: 0,

  rejectedClaims: 0,

  completedClaims: 0,

  returnedItems: 0,
};

// ============================================================
// DATE FILTERS
// ============================================================

const DATE_FILTERS: {
  label: string;

  value: AdminDateRange;
}[] = [
  {
    label: "Today",

    value: "TODAY",
  },
  {
    label: "Week",

    value: "WEEK",
  },
  {
    label: "Month",

    value: "MONTH",
  },
  {
    label: "Year",

    value: "YEAR",
  },
  {
    label: "All",

    value: "ALL",
  },
];

// ============================================================
// STATISTIC CARD
// ============================================================

interface StatisticCardProps {
  title: string;

  value: number;

  subtitle: string;

  icon: keyof typeof Ionicons.glyphMap;

  color: string;

  backgroundColor: string;

  onPress?: () => void;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  backgroundColor,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={{
        flex: 1,
        minWidth: "46%",
        backgroundColor: COLORS.white,
        borderRadius: 17,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 43,
            height: 43,
            borderRadius: 13,
            backgroundColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={21} color={color} />
        </View>

        {onPress ? (
          <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
        ) : null}
      </View>

      <Text
        style={{
          color: COLORS.text,
          fontSize: 25,
          fontWeight: "900",
          marginTop: 15,
        }}
      >
        {value.toLocaleString()}
      </Text>

      <Text
        style={{
          color: COLORS.text,
          fontSize: 13,
          fontWeight: "800",
          marginTop: 4,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: 11,
          marginTop: 5,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
};

// ============================================================
// QUICK ACTION CARD
// ============================================================

interface QuickActionProps {
  title: string;

  description: string;

  icon: keyof typeof Ionicons.glyphMap;

  color: string;

  backgroundColor: string;

  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  color,
  backgroundColor,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        width: "48%",
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          height: 42,
          width: 42,
          borderRadius: 13,
          backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={21} color={color} />
      </View>

      <Text
        style={{
          color: COLORS.text,
          fontSize: 14,
          fontWeight: "800",
          marginTop: 13,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: 11,
          lineHeight: 17,
          marginTop: 5,
        }}
      >
        {description}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text
          style={{
            color,
            fontSize: 11,
            fontWeight: "800",
          }}
        >
          Open
        </Text>

        <Ionicons
          name="arrow-forward"
          size={14}
          color={color}
          style={{ marginLeft: 5 }}
        />
      </View>
    </Pressable>
  );
};

// ============================================================
// ACTIVITY ICON
// ============================================================

function getActivityAppearance(type: AdminActivity["type"]): {
  icon: keyof typeof Ionicons.glyphMap;

  color: string;

  backgroundColor: string;
} {
  switch (type) {
    case "USER_REGISTERED":
      return {
        icon: "person-add-outline",

        color: COLORS.primary,

        backgroundColor: COLORS.primaryLight,
      };

    case "ITEM_REPORTED":
      return {
        icon: "cube-outline",

        color: COLORS.cyan,

        backgroundColor: COLORS.cyanLight,
      };

    case "CLAIM_SUBMITTED":
      return {
        icon: "document-text-outline",

        color: COLORS.warning,

        backgroundColor: COLORS.warningLight,
      };

    case "CLAIM_APPROVED":
      return {
        icon: "checkmark-circle-outline",

        color: COLORS.success,

        backgroundColor: COLORS.successLight,
      };

    case "CLAIM_REJECTED":
      return {
        icon: "close-circle-outline",

        color: COLORS.danger,

        backgroundColor: COLORS.dangerLight,
      };

    case "ITEM_RETURNED":
      return {
        icon: "checkmark-done-outline",

        color: COLORS.success,

        backgroundColor: COLORS.successLight,
      };

    case "USER_SUSPENDED":
      return {
        icon: "person-remove-outline",

        color: COLORS.danger,

        backgroundColor: COLORS.dangerLight,
      };

    case "USER_ACTIVATED":
      return {
        icon: "person-outline",

        color: COLORS.success,

        backgroundColor: COLORS.successLight,
      };

    case "ITEM_REMOVED":
      return {
        icon: "trash-outline",

        color: COLORS.danger,

        backgroundColor: COLORS.dangerLight,
      };

    default:
      return {
        icon: "time-outline",

        color: COLORS.purple,

        backgroundColor: COLORS.purpleLight,
      };
  }
}

// ============================================================
// ACTIVITY CARD
// ============================================================

const ActivityCard: React.FC<{
  activity: AdminActivity;
}> = ({ activity }) => {
  const appearance = getActivityAppearance(activity.type);

  const actor = activity.actor?.fullName ?? activity.actor?.name ?? "System";

  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          backgroundColor: appearance.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Ionicons name={appearance.icon} size={19} color={appearance.color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: COLORS.text,
            fontSize: 13,
            fontWeight: "800",
          }}
        >
          {activity.title}
        </Text>

        {activity.description ? (
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 11,
              lineHeight: 17,
              marginTop: 4,
            }}
          >
            {activity.description}
          </Text>
        ) : null}

        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: 10,
            marginTop: 5,
          }}
        >
          {actor} • {adminApi.formatDateTime(activity.createdAt)}
        </Text>
      </View>
    </View>
  );
};

// ============================================================
// SCREEN
// ============================================================

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  navigation,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const user = useAuthStore((state) => state.user);

  const [statistics, setStatistics] =
    useState<AdminDashboardStatistics>(EMPTY_STATISTICS);

  const [activities, setActivities] = useState<AdminActivity[]>([]);

  const [dateRange, setDateRange] = useState<AdminDateRange>("MONTH");

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to access the admin dashboard.");

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

        const result = await adminApi.getDashboard(accessToken, {
          dateRange,
        });

        setStatistics(result.statistics);

        setActivities(result.recentActivities);
      } catch (err) {
        setError(adminApi.getSecurityErrorMessage(err));
      } finally {
        setIsLoading(false);

        setIsRefreshing(false);
      }
    },
    [accessToken, dateRange],
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  // ==========================================================
  // USER DISPLAY NAME
  // ==========================================================

  const adminName = useMemo(() => {
    if (!user) {
      return "Administrator";
    }

    const currentUser = user as {
      fullName?: string;

      name?: string;

      firstName?: string;
    };

    return (
      currentUser.fullName ??
      currentUser.name ??
      currentUser.firstName ??
      "Administrator"
    );
  }, [user]);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const openUsers = () => {
    navigation.navigate("ManageUsers");
  };

  const openItems = () => {
    navigation.navigate("ManageItems");
  };

  const openClaims = () => {
    navigation.navigate("PendingClaims");
  };

  const openCustody = () => {
    navigation.navigate("CustodyRegister");
  };

  // ==========================================================
  // STATISTICS DATA
  // ==========================================================

  const userStatistics = [
    {
      title: "Total Users",

      value: statistics.totalUsers,

      subtitle: `${statistics.activeUsers} active accounts`,

      icon: "people-outline" as const,

      color: COLORS.primary,

      backgroundColor: COLORS.primaryLight,

      onPress: openUsers,
    },
    {
      title: "Students",

      value: statistics.totalStudents,

      subtitle: "Registered students",

      icon: "school-outline" as const,

      color: COLORS.purple,

      backgroundColor: COLORS.purpleLight,

      onPress: openUsers,
    },
    {
      title: "Staff",

      value: statistics.totalStaff,

      subtitle: "Campus staff accounts",

      icon: "briefcase-outline" as const,

      color: COLORS.cyan,

      backgroundColor: COLORS.cyanLight,

      onPress: openUsers,
    },
    {
      title: "Security",

      value: statistics.totalSecurityUsers,

      subtitle: "Security accounts",

      icon: "shield-checkmark-outline" as const,

      color: COLORS.success,

      backgroundColor: COLORS.successLight,

      onPress: openUsers,
    },
  ];

  const itemStatistics = [
    {
      title: "Total Items",

      value: statistics.totalItems,

      subtitle: "All registered items",

      icon: "cube-outline" as const,

      color: COLORS.primary,

      backgroundColor: COLORS.primaryLight,

      onPress: openItems,
    },
    {
      title: "Lost Items",

      value: statistics.lostItems,

      subtitle: "Reported lost belongings",

      icon: "search-outline" as const,

      color: COLORS.danger,

      backgroundColor: COLORS.dangerLight,

      onPress: openItems,
    },
    {
      title: "Found Items",

      value: statistics.foundItems,

      subtitle: "Recovered belongings",

      icon: "archive-outline" as const,

      color: COLORS.success,

      backgroundColor: COLORS.successLight,

      onPress: openItems,
    },
    {
      title: "Resolved",

      value: statistics.resolvedItems,

      subtitle: "Resolved item records",

      icon: "checkmark-done-outline" as const,

      color: COLORS.purple,

      backgroundColor: COLORS.purpleLight,

      onPress: openItems,
    },
  ];

  const claimStatistics = [
    {
      title: "Total Claims",

      value: statistics.totalClaims,

      subtitle: "All ownership claims",

      icon: "documents-outline" as const,

      color: COLORS.primary,

      backgroundColor: COLORS.primaryLight,

      onPress: openClaims,
    },
    {
      title: "Pending Claims",

      value: statistics.pendingClaims,

      subtitle: "Awaiting review",

      icon: "time-outline" as const,

      color: COLORS.warning,

      backgroundColor: COLORS.warningLight,

      onPress: openClaims,
    },
    {
      title: "Approved",

      value: statistics.approvedClaims,

      subtitle: "Approved claims",

      icon: "checkmark-circle-outline" as const,

      color: COLORS.success,

      backgroundColor: COLORS.successLight,

      onPress: openClaims,
    },
    {
      title: "Returned Items",

      value: statistics.returnedItems,

      subtitle: "Items returned to owners",

      icon: "hand-left-outline" as const,

      color: COLORS.purple,

      backgroundColor: COLORS.purpleLight,

      onPress: openCustody,
    },
  ];

  // ==========================================================
  // STATISTICS SECTION
  // ==========================================================

  const renderStatistics = (
    title: string,
    description: string,
    data: typeof userStatistics,
  ) => (
    <View style={{ marginTop: 23 }}>
      <View
        style={{
          marginBottom: 13,
        }}
      >
        <Text
          style={{
            color: COLORS.text,
            fontSize: 17,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: 11,
            marginTop: 4,
          }}
        >
          {description}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {data.map((item) => (
          <StatisticCard
            key={item.title}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
            color={item.color}
            backgroundColor={item.backgroundColor}
            onPress={item.onPress}
          />
        ))}
      </View>
    </View>
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
          Loading admin dashboard...
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryDark}
      />

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        ListHeaderComponent={
          <>
            {/* Dashboard Header */}
            <View
              style={{
                backgroundColor: COLORS.primaryDark,
                paddingHorizontal: 21,
                paddingTop: 20,
                paddingBottom: 27,
                borderBottomLeftRadius: 25,
                borderBottomRightRadius: 25,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#BFDBFE",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    INJIBARA CAMPUS
                  </Text>

                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 23,
                      fontWeight: "900",
                      marginTop: 7,
                    }}
                  >
                    Admin Dashboard
                  </Text>

                  <Text
                    style={{
                      color: "#DBEAFE",
                      fontSize: 12,
                      marginTop: 6,
                    }}
                  >
                    Welcome back, {adminName}
                  </Text>
                </View>

                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={25}
                    color={COLORS.white}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 22,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: 13,
                  padding: 12,
                }}
              >
                <Ionicons
                  name="analytics-outline"
                  size={21}
                  color={COLORS.white}
                />

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    Campus Management Overview
                  </Text>

                  <Text
                    style={{
                      color: "#DBEAFE",
                      fontSize: 10,
                      marginTop: 3,
                    }}
                  >
                    Monitor users, reports, claims and returns.
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: 17 }}>
              {/* Date Filter */}
              <View style={{ marginTop: 21 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 14,
                    fontWeight: "900",
                    marginBottom: 11,
                  }}
                >
                  Dashboard Period
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {DATE_FILTERS.map((filter) => {
                    const selected = dateRange === filter.value;

                    return (
                      <Pressable
                        key={filter.value}
                        onPress={() => setDateRange(filter.value)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          marginRight: 8,
                          borderRadius: 20,
                          backgroundColor: selected
                            ? COLORS.primary
                            : COLORS.white,
                          borderWidth: 1,
                          borderColor: selected
                            ? COLORS.primary
                            : COLORS.border,
                        }}
                      >
                        <Text
                          style={{
                            color: selected
                              ? COLORS.white
                              : COLORS.textSecondary,
                            fontSize: 11,
                            fontWeight: "800",
                          }}
                        >
                          {filter.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Error */}
              {error ? (
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: COLORS.dangerLight,
                    padding: 13,
                    borderRadius: 12,
                    marginTop: 16,
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={21}
                    color={COLORS.danger}
                  />

                  <Text
                    style={{
                      flex: 1,
                      color: COLORS.danger,
                      fontSize: 11,
                      marginLeft: 9,
                    }}
                  >
                    {error}
                  </Text>

                  <Pressable onPress={() => loadDashboard(true)}>
                    <Text
                      style={{
                        color: COLORS.danger,
                        fontWeight: "900",
                        fontSize: 11,
                      }}
                    >
                      Retry
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Quick Actions */}
              <View style={{ marginTop: 24 }}>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 17,
                    fontWeight: "900",
                  }}
                >
                  Quick Management
                </Text>

                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 11,
                    marginTop: 4,
                    marginBottom: 13,
                  }}
                >
                  Access important administration tools.
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  <QuickAction
                    title="Manage Users"
                    description="View and manage campus accounts."
                    icon="people-outline"
                    color={COLORS.primary}
                    backgroundColor={COLORS.primaryLight}
                    onPress={openUsers}
                  />

                  <QuickAction
                    title="Manage Items"
                    description="Review lost and found reports."
                    icon="cube-outline"
                    color={COLORS.success}
                    backgroundColor={COLORS.successLight}
                    onPress={openItems}
                  />

                  <QuickAction
                    title="Pending Claims"
                    description="Review ownership verification."
                    icon="documents-outline"
                    color={COLORS.warning}
                    backgroundColor={COLORS.warningLight}
                    onPress={openClaims}
                  />

                  <QuickAction
                    title="Custody Register"
                    description="Monitor stored campus property."
                    icon="archive-outline"
                    color={COLORS.purple}
                    backgroundColor={COLORS.purpleLight}
                    onPress={openCustody}
                  />
                </View>
              </View>

              {/* User Statistics */}
              {renderStatistics(
                "User Statistics",
                "Campus account overview.",
                userStatistics,
              )}

              {/* Item Statistics */}
              {renderStatistics(
                "Lost & Found Statistics",
                "Overview of reported belongings.",
                itemStatistics,
              )}

              {/* Claim Statistics */}
              {renderStatistics(
                "Claim Statistics",
                "Ownership verification and item returns.",
                claimStatistics,
              )}

              {/* Recent Activity Header */}
              <View
                style={{
                  marginTop: 22,
                  marginBottom: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 17,
                      fontWeight: "900",
                    }}
                  >
                    Recent Activity
                  </Text>

                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    Latest campus administration events.
                  </Text>
                </View>

                <Ionicons
                  name="time-outline"
                  size={21}
                  color={COLORS.primary}
                />
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View
            style={{
              marginHorizontal: 17,
              padding: 24,
              alignItems: "center",
              backgroundColor: COLORS.white,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="time-outline" size={31} color={COLORS.textMuted} />

            <Text
              style={{
                color: COLORS.text,
                fontWeight: "800",
                fontSize: 13,
                marginTop: 10,
              }}
            >
              No Recent Activity
            </Text>

            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 11,
                marginTop: 5,
                textAlign: "center",
              }}
            >
              Activity records will appear here when available.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 25,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Injibara Campus Lost & Found
            </Text>

            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 10,
                marginTop: 4,
              }}
            >
              Administration Management System
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;
