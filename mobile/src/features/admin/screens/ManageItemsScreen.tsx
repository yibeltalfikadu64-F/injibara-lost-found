// mobile/src/features/admin/screens/ManageItemsScreen.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
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
  AdminItem,
  AdminItemStatus,
  AdminItemType,
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
// TYPES
// ============================================================

type ItemTypeFilter = "ALL" | AdminItemType;

type ItemStatusFilter = "ALL" | AdminItemStatus;

type ItemAction = "APPROVE" | "REJECT" | "RESOLVE" | "CLOSE" | "REOPEN";

interface ManageItemsNavigation {
  navigate: (screen: string, params?: Record<string, unknown>) => void;

  goBack: () => void;
}

interface ManageItemsScreenProps {
  navigation: ManageItemsNavigation;
}

// ============================================================
// FILTER OPTIONS
// ============================================================

const TYPE_FILTERS: {
  label: string;

  value: ItemTypeFilter;
}[] = [
  {
    label: "All Items",

    value: "ALL",
  },
  {
    label: "Lost",

    value: "LOST",
  },
  {
    label: "Found",

    value: "FOUND",
  },
];

const STATUS_FILTERS: {
  label: string;

  value: ItemStatusFilter;
}[] = [
  {
    label: "All Status",

    value: "ALL",
  },
  {
    label: "Pending",

    value: "PENDING",
  },
  {
    label: "Open",

    value: "OPEN",
  },
  {
    label: "Claimed",

    value: "CLAIMED",
  },
  {
    label: "Resolved",

    value: "RESOLVED",
  },
  {
    label: "Returned",

    value: "RETURNED",
  },
  {
    label: "Rejected",

    value: "REJECTED",
  },
  {
    label: "Closed",

    value: "CLOSED",
  },
];

// ============================================================
// ITEM STATUS APPEARANCE
// ============================================================

function getItemStatusAppearance(status: AdminItemStatus): {
  color: string;

  backgroundColor: string;

  icon: keyof typeof Ionicons.glyphMap;
} {
  switch (status) {
    case "OPEN":
      return {
        color: COLORS.success,

        backgroundColor: COLORS.successLight,

        icon: "radio-button-on-outline",
      };

    case "PENDING":
      return {
        color: COLORS.warning,

        backgroundColor: COLORS.warningLight,

        icon: "time-outline",
      };

    case "CLAIMED":
      return {
        color: COLORS.primary,

        backgroundColor: COLORS.primaryLight,

        icon: "hand-left-outline",
      };

    case "RESOLVED":
      return {
        color: COLORS.purple,

        backgroundColor: COLORS.purpleLight,

        icon: "checkmark-circle-outline",
      };

    case "RETURNED":
      return {
        color: COLORS.success,

        backgroundColor: COLORS.successLight,

        icon: "checkmark-done-outline",
      };

    case "REJECTED":
      return {
        color: COLORS.danger,

        backgroundColor: COLORS.dangerLight,

        icon: "close-circle-outline",
      };

    case "CLOSED":
      return {
        color: COLORS.textSecondary,

        backgroundColor: COLORS.border,

        icon: "lock-closed-outline",
      };

    case "EXPIRED":
      return {
        color: COLORS.textMuted,

        backgroundColor: COLORS.background,

        icon: "calendar-outline",
      };
  }
}

// ============================================================
// ITEM TYPE APPEARANCE
// ============================================================

function getItemTypeAppearance(type: AdminItemType): {
  color: string;

  backgroundColor: string;

  icon: keyof typeof Ionicons.glyphMap;
} {
  if (type === "LOST") {
    return {
      color: COLORS.danger,

      backgroundColor: COLORS.dangerLight,

      icon: "search-outline",
    };
  }

  return {
    color: COLORS.success,

    backgroundColor: COLORS.successLight,

    icon: "archive-outline",
  };
}

// ============================================================
// FILTER CHIP
// ============================================================

const FilterChip: React.FC<{
  label: string;

  selected: boolean;

  onPress: () => void;
}> = ({ label, selected, onPress }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={{
      backgroundColor: selected ? COLORS.primary : COLORS.white,

      borderColor: selected ? COLORS.primary : COLORS.border,

      borderWidth: 1,

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

// ============================================================
// STATISTIC CARD
// ============================================================

const ItemStatistic: React.FC<{
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
        width: 36,

        height: 36,

        borderRadius: 11,

        backgroundColor,

        alignItems: "center",

        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={19} color={color} />
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
// ITEM CARD
// ============================================================

interface ItemCardProps {
  item: AdminItem;

  isUpdating: boolean;

  onPress: (item: AdminItem) => void;

  onAction: (item: AdminItem, action: ItemAction) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isUpdating,
  onPress,
  onAction,
}) => {
  const statusAppearance = getItemStatusAppearance(item.status);

  const typeAppearance = getItemTypeAppearance(item.type);

  const category = adminApi.getItemCategory(item);

  const location = adminApi.getItemLocation(item);

  const reporter = adminApi.getItemReporterName(item);

  const firstImage = item.imageUrls?.[0];

  const canApprove = item.status === "PENDING";

  const canResolve = item.status === "OPEN" || item.status === "CLAIMED";

  const canReopen = item.status === "CLOSED" || item.status === "RESOLVED";

  return (
    <View
      style={{
        backgroundColor: COLORS.white,

        borderWidth: 1,

        borderColor: COLORS.border,

        borderRadius: 17,

        padding: 14,

        marginBottom: 13,
      }}
    >
      {/* Image and title */}
      <Pressable accessibilityRole="button" onPress={() => onPress(item)}>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              resizeMode="cover"
              style={{
                width: 92,

                height: 92,

                borderRadius: 13,

                backgroundColor: COLORS.background,
              }}
            />
          ) : (
            <View
              style={{
                width: 92,

                height: 92,

                borderRadius: 13,

                backgroundColor: COLORS.primaryLight,

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <Ionicons name="image-outline" size={30} color={COLORS.primary} />

              <Text
                style={{
                  color: COLORS.primary,

                  fontSize: 9,

                  fontWeight: "700",

                  marginTop: 5,
                }}
              >
                No Image
              </Text>
            </View>
          )}

          <View
            style={{
              flex: 1,

              marginLeft: 12,

              justifyContent: "center",
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                color: COLORS.text,

                fontSize: 14,

                fontWeight: "900",

                lineHeight: 20,
              }}
            >
              {item.title}
            </Text>

            <Text
              numberOfLines={2}
              style={{
                color: COLORS.textSecondary,

                fontSize: 11,

                lineHeight: 17,

                marginTop: 5,
              }}
            >
              {item.description}
            </Text>

            <Text
              style={{
                color: COLORS.textMuted,

                fontSize: 10,

                marginTop: 6,
              }}
            >
              {category}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Type and status */}
      <View
        style={{
          flexDirection: "row",

          flexWrap: "wrap",

          gap: 7,

          marginTop: 13,
        }}
      >
        <View
          style={{
            flexDirection: "row",

            alignItems: "center",

            backgroundColor: typeAppearance.backgroundColor,

            borderRadius: 20,

            paddingHorizontal: 10,

            paddingVertical: 6,
          }}
        >
          <Ionicons
            name={typeAppearance.icon}
            size={12}
            color={typeAppearance.color}
          />

          <Text
            style={{
              color: typeAppearance.color,

              fontSize: 10,

              fontWeight: "900",

              marginLeft: 5,
            }}
          >
            {adminApi.getItemTypeLabel(item.type)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",

            alignItems: "center",

            backgroundColor: statusAppearance.backgroundColor,

            borderRadius: 20,

            paddingHorizontal: 10,

            paddingVertical: 6,
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

              fontWeight: "900",

              marginLeft: 5,
            }}
          >
            {adminApi.getItemStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View
        style={{
          flexDirection: "row",

          alignItems: "center",

          marginTop: 13,
        }}
      >
        <Ionicons name="location-outline" size={15} color={COLORS.textMuted} />

        <Text
          numberOfLines={1}
          style={{
            color: COLORS.textSecondary,

            fontSize: 11,

            marginLeft: 6,

            flex: 1,
          }}
        >
          {location}
        </Text>
      </View>

      {/* Reporter */}
      <View
        style={{
          flexDirection: "row",

          alignItems: "center",

          marginTop: 7,
        }}
      >
        <Ionicons name="person-outline" size={15} color={COLORS.textMuted} />

        <Text
          numberOfLines={1}
          style={{
            color: COLORS.textSecondary,

            fontSize: 11,

            marginLeft: 6,

            flex: 1,
          }}
        >
          Reported by: {reporter}
        </Text>
      </View>

      {/* Date */}
      <View
        style={{
          flexDirection: "row",

          alignItems: "center",

          marginTop: 7,
        }}
      >
        <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />

        <Text
          style={{
            color: COLORS.textMuted,

            fontSize: 10,

            marginLeft: 6,
          }}
        >
          Submitted: {adminApi.formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Rejection reason */}
      {item.rejectionReason ? (
        <View
          style={{
            backgroundColor: COLORS.dangerLight,

            padding: 10,

            borderRadius: 10,

            marginTop: 12,
          }}
        >
          <Text
            style={{
              color: COLORS.danger,

              fontSize: 10,

              fontWeight: "900",
            }}
          >
            Rejection Reason
          </Text>

          <Text
            style={{
              color: COLORS.danger,

              fontSize: 11,

              marginTop: 4,

              lineHeight: 17,
            }}
          >
            {item.rejectionReason}
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      <View
        style={{
          flexDirection: "row",

          flexWrap: "wrap",

          gap: 8,

          marginTop: 14,

          paddingTop: 12,

          borderTopWidth: 1,

          borderTopColor: COLORS.border,
        }}
      >
        {canApprove ? (
          <>
            <Pressable
              disabled={isUpdating}
              onPress={() => onAction(item, "APPROVE")}
              style={{
                flex: 1,

                backgroundColor: COLORS.successLight,

                borderRadius: 10,

                paddingVertical: 10,

                alignItems: "center",

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
                Approve
              </Text>
            </Pressable>

            <Pressable
              disabled={isUpdating}
              onPress={() => onAction(item, "REJECT")}
              style={{
                flex: 1,

                backgroundColor: COLORS.dangerLight,

                borderRadius: 10,

                paddingVertical: 10,

                alignItems: "center",

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
                Reject
              </Text>
            </Pressable>
          </>
        ) : null}

        {canResolve ? (
          <Pressable
            disabled={isUpdating}
            onPress={() => onAction(item, "RESOLVE")}
            style={{
              flex: 1,

              backgroundColor: COLORS.successLight,

              borderRadius: 10,

              paddingVertical: 10,

              alignItems: "center",

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
              Resolve
            </Text>
          </Pressable>
        ) : null}

        {canReopen ? (
          <Pressable
            disabled={isUpdating}
            onPress={() => onAction(item, "REOPEN")}
            style={{
              flex: 1,

              backgroundColor: COLORS.primaryLight,

              borderRadius: 10,

              paddingVertical: 10,

              alignItems: "center",

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
              Reopen
            </Text>
          </Pressable>
        ) : null}

        {item.status !== "CLOSED" &&
        item.status !== "RETURNED" &&
        item.status !== "REJECTED" ? (
          <Pressable
            disabled={isUpdating}
            onPress={() => onAction(item, "CLOSE")}
            style={{
              flex: 1,

              backgroundColor: COLORS.background,

              borderRadius: 10,

              paddingVertical: 10,

              alignItems: "center",

              opacity: isUpdating ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                color: COLORS.textSecondary,

                fontSize: 10,

                fontWeight: "900",
              }}
            >
              Close
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          disabled={isUpdating}
          onPress={() => onPress(item)}
          style={{
            flex: 1,

            backgroundColor: COLORS.primaryLight,

            borderRadius: 10,

            paddingVertical: 10,

            alignItems: "center",

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
            Details
          </Text>
        </Pressable>
      </View>

      {isUpdating ? (
        <View
          style={{
            flexDirection: "row",

            alignItems: "center",

            marginTop: 12,
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
            Updating item record...
          </Text>
        </View>
      ) : null}
    </View>
  );
};

// ============================================================
// MAIN SCREEN
// ============================================================

const ManageItemsScreen: React.FC<ManageItemsScreenProps> = ({
  navigation,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [items, setItems] = useState<AdminItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>("ALL");

  const [statusFilter, setStatusFilter] = useState<ItemStatusFilter>("ALL");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalItems, setTotalItems] = useState(0);

  // ----------------------------------------------------------
  // REJECTION MODAL
  // ----------------------------------------------------------

  const [rejectingItem, setRejectingItem] = useState<AdminItem | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const [isRejecting, setIsRejecting] = useState(false);

  // ==========================================================
  // LOAD ITEMS
  // ==========================================================

  const loadItems = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError("Please sign in to manage item reports.");

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

        const result = await adminApi.getItems(accessToken, {
          page: refresh ? 1 : page,

          limit: 20,

          search: search.trim(),

          type: typeFilter,

          status: statusFilter,

          sortBy: "createdAt",

          sortOrder: "desc",
        });

        setItems(result.data);

        setPage(result.pagination.page);

        setTotalPages(result.pagination.totalPages);

        setTotalItems(result.pagination.total);
      } catch (err) {
        setError(adminApi.getSecurityErrorMessage(err));
      } finally {
        setIsLoading(false);

        setIsRefreshing(false);
      }
    },
    [accessToken, page, search, typeFilter, statusFilter],
  );

  // ==========================================================
  // REFRESH ON FOCUS
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    return {
      total: totalItems,

      lost: items.filter((item) => item.type === "LOST").length,

      found: items.filter((item) => item.type === "FOUND").length,

      pending: items.filter((item) => item.status === "PENDING").length,

      open: items.filter((item) => item.status === "OPEN").length,

      resolved: items.filter((item) => item.status === "RESOLVED").length,
    };
  }, [items, totalItems]);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const openItemDetails = (item: AdminItem) => {
    navigation.navigate("AdminItemDetails", {
      itemId: item.id,
    });
  };

  // ==========================================================
  // UPDATE ITEM
  // ==========================================================

  const updateItem = async (item: AdminItem, action: ItemAction) => {
    if (!accessToken) {
      Alert.alert("Authentication Required", "Please sign in again.");

      return;
    }

    try {
      setUpdatingItemId(item.id);

      let updatedItem: AdminItem;

      switch (action) {
        case "APPROVE":
          updatedItem = await adminApi.approveItem(accessToken, item.id);
          break;

        case "RESOLVE":
          updatedItem = await adminApi.updateItemStatus(
            accessToken,
            item.id,
            "RESOLVED",
          );
          break;

        case "CLOSE":
          updatedItem = await adminApi.updateItemStatus(
            accessToken,
            item.id,
            "CLOSED",
          );
          break;

        case "REOPEN":
          updatedItem = await adminApi.updateItemStatus(
            accessToken,
            item.id,
            "OPEN",
          );
          break;

        default:
          return;
      }

      setItems((previous) =>
        previous.map((entry) => (entry.id === item.id ? updatedItem : entry)),
      );

      Alert.alert("Item Updated", `"${item.title}" was updated successfully.`);
    } catch (err) {
      Alert.alert(
        "Unable to Update Item",
        adminApi.getSecurityErrorMessage(err),
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ==========================================================
  // CONFIRM ITEM ACTION
  // ==========================================================

  const confirmItemAction = (item: AdminItem, action: ItemAction) => {
    if (action === "REJECT") {
      setRejectingItem(item);

      setRejectionReason("");

      return;
    }

    const details: Record<
      Exclude<ItemAction, "REJECT">,
      {
        title: string;

        message: string;

        confirmText: string;
      }
    > = {
      APPROVE: {
        title: "Approve Item Report",

        message: `Approve "${item.title}" and make the report available according to your campus workflow?`,

        confirmText: "Approve",
      },

      RESOLVE: {
        title: "Resolve Item",

        message: `Mark "${item.title}" as resolved? Confirm that the item has actually been resolved before continuing.`,

        confirmText: "Resolve",
      },

      CLOSE: {
        title: "Close Item Record",

        message: `Are you sure you want to close "${item.title}"?`,

        confirmText: "Close",
      },

      REOPEN: {
        title: "Reopen Item",

        message: `Reopen "${item.title}" so it can be managed again?`,

        confirmText: "Reopen",
      },
    };

    const selected = details[action];

    Alert.alert(selected.title, selected.message, [
      {
        text: "Cancel",

        style: "cancel",
      },
      {
        text: selected.confirmText,

        style: action === "CLOSE" ? "destructive" : "default",

        onPress: () => updateItem(item, action),
      },
    ]);
  };

  // ==========================================================
  // SUBMIT REJECTION
  // ==========================================================

  const submitRejection = async () => {
    if (!accessToken || !rejectingItem) {
      return;
    }

    const validation = adminApi.validateRejectionReason(rejectionReason);

    if (validation) {
      Alert.alert("Rejection Reason Required", validation);

      return;
    }

    try {
      setIsRejecting(true);

      const updatedItem = await adminApi.rejectItem(
        accessToken,
        rejectingItem.id,
        rejectionReason.trim(),
      );

      setItems((previous) =>
        previous.map((item) =>
          item.id === rejectingItem.id ? updatedItem : item,
        ),
      );

      setRejectingItem(null);

      setRejectionReason("");

      Alert.alert(
        "Item Rejected",
        "The item report was rejected successfully.",
      );
    } catch (err) {
      Alert.alert(
        "Unable to Reject Item",
        adminApi.getSecurityErrorMessage(err),
      );
    } finally {
      setIsRejecting(false);
    }
  };

  // ==========================================================
  // FILTER HANDLERS
  // ==========================================================

  const handleSearchChange = (value: string) => {
    setSearch(value);

    setPage(1);
  };

  const handleTypeFilter = (value: ItemTypeFilter) => {
    setTypeFilter(value);

    setPage(1);
  };

  const handleStatusFilter = (value: ItemStatusFilter) => {
    setStatusFilter(value);

    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");

    setTypeFilter("ALL");

    setStatusFilter("ALL");

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

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <Ionicons name="cube-outline" size={31} color={COLORS.primary} />
      </View>

      <Text
        style={{
          color: COLORS.text,

          fontSize: 15,

          fontWeight: "900",

          marginTop: 15,
        }}
      >
        No Items Found
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
        No item reports match your search or selected filters.
      </Text>

      <Pressable
        onPress={clearFilters}
        style={{
          backgroundColor: COLORS.primary,

          paddingHorizontal: 20,

          paddingVertical: 11,

          borderRadius: 11,

          marginTop: 17,
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
  // RENDER ITEM
  // ==========================================================

  const renderItem = ({ item }: { item: AdminItem }) => (
    <ItemCard
      item={item}
      isUpdating={updatingItemId === item.id}
      onPress={openItemDetails}
      onAction={confirmItemAction}
    />
  );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,

          backgroundColor: COLORS.background,

          alignItems: "center",

          justifyContent: "center",
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
          Loading item reports...
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

      {/* HEADER */}
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

        <View
          style={{
            flex: 1,

            marginLeft: 12,
          }}
        >
          <Text
            style={{
              color: COLORS.text,

              fontSize: 17,

              fontWeight: "900",
            }}
          >
            Manage Items
          </Text>

          <Text
            style={{
              color: COLORS.textSecondary,

              fontSize: 10,

              marginTop: 3,
            }}
          >
            Lost and found report administration
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => loadItems(true)}
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

      {/* ITEM LIST */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,

          paddingTop: 15,

          paddingBottom: 35,

          flexGrow: items.length === 0 ? 1 : undefined,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadItems(true)}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Introduction */}
            <View
              style={{
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: COLORS.text,

                  fontSize: 21,

                  fontWeight: "900",
                }}
              >
                Item Management
              </Text>

              <Text
                style={{
                  color: COLORS.textSecondary,

                  fontSize: 11,

                  lineHeight: 18,

                  marginTop: 6,
                }}
              >
                Review, approve, reject, and monitor campus lost-and-found item
                reports.
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
              <ItemStatistic
                title="Total Items"
                value={statistics.total}
                icon="cube-outline"
                color={COLORS.primary}
                backgroundColor={COLORS.primaryLight}
              />

              <ItemStatistic
                title="Lost Items on Page"
                value={statistics.lost}
                icon="search-outline"
                color={COLORS.danger}
                backgroundColor={COLORS.dangerLight}
              />

              <ItemStatistic
                title="Found Items on Page"
                value={statistics.found}
                icon="archive-outline"
                color={COLORS.success}
                backgroundColor={COLORS.successLight}
              />

              <ItemStatistic
                title="Pending on Page"
                value={statistics.pending}
                icon="time-outline"
                color={COLORS.warning}
                backgroundColor={COLORS.warningLight}
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
                placeholder="Search title, category, location..."
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

            {/* Type filter */}
            <Text
              style={{
                color: COLORS.text,

                fontSize: 13,

                fontWeight: "900",

                marginBottom: 10,
              }}
            >
              Item Type
            </Text>

            <FlatList
              data={TYPE_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <FilterChip
                  label={item.label}
                  selected={typeFilter === item.value}
                  onPress={() => handleTypeFilter(item.value)}
                />
              )}
              style={{
                marginBottom: 17,
              }}
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
              Item Status
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
                  onPress={() => handleStatusFilter(item.value)}
                />
              )}
              style={{
                marginBottom: 17,
              }}
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

                <Pressable onPress={() => loadItems(true)}>
                  <Text
                    style={{
                      color: COLORS.danger,

                      fontSize: 11,

                      fontWeight: "900",
                    }}
                  >
                    Retry
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* List heading */}
            <View
              style={{
                flexDirection: "row",

                alignItems: "center",

                justifyContent: "space-between",

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
                Reported Items
              </Text>

              <Text
                style={{
                  color: COLORS.textSecondary,

                  fontSize: 10,
                }}
              >
                {items.length} shown
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          items.length > 0 ? (
            <View
              style={{
                flexDirection: "row",

                alignItems: "center",

                justifyContent: "space-between",

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

      {/* ======================================================
          REJECTION REASON MODAL
      ====================================================== */}

      <Modal
        visible={Boolean(rejectingItem)}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isRejecting) {
            setRejectingItem(null);

            setRejectionReason("");
          }
        }}
      >
        <View
          style={{
            flex: 1,

            backgroundColor: "rgba(15,23,42,0.55)",

            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,

              borderTopLeftRadius: 23,

              borderTopRightRadius: 23,

              padding: 22,

              paddingBottom: 35,
            }}
          >
            <View
              style={{
                flexDirection: "row",

                alignItems: "center",

                marginBottom: 15,
              }}
            >
              <View
                style={{
                  width: 43,

                  height: 43,

                  borderRadius: 13,

                  backgroundColor: COLORS.dangerLight,

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={23}
                  color={COLORS.danger}
                />
              </View>

              <View
                style={{
                  flex: 1,

                  marginLeft: 12,
                }}
              >
                <Text
                  style={{
                    color: COLORS.text,

                    fontSize: 17,

                    fontWeight: "900",
                  }}
                >
                  Reject Item Report
                </Text>

                <Text
                  style={{
                    color: COLORS.textSecondary,

                    fontSize: 10,

                    marginTop: 3,
                  }}
                >
                  Provide a reason for this decision.
                </Text>
              </View>

              <Pressable
                disabled={isRejecting}
                onPress={() => {
                  setRejectingItem(null);

                  setRejectionReason("");
                }}
              >
                <Ionicons name="close" size={23} color={COLORS.textMuted} />
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: COLORS.background,

                padding: 12,

                borderRadius: 11,

                marginBottom: 17,
              }}
            >
              <Text
                style={{
                  color: COLORS.textSecondary,

                  fontSize: 10,

                  fontWeight: "700",
                }}
              >
                SELECTED ITEM
              </Text>

              <Text
                style={{
                  color: COLORS.text,

                  fontSize: 13,

                  fontWeight: "900",

                  marginTop: 5,
                }}
              >
                {rejectingItem?.title}
              </Text>
            </View>

            <Text
              style={{
                color: COLORS.text,

                fontSize: 12,

                fontWeight: "800",

                marginBottom: 8,
              }}
            >
              Rejection Reason *
            </Text>

            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Explain why this item report is being rejected..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={1000}
              editable={!isRejecting}
              textAlignVertical="top"
              style={{
                minHeight: 115,

                borderWidth: 1,

                borderColor: COLORS.border,

                borderRadius: 12,

                padding: 13,

                color: COLORS.text,

                fontSize: 12,

                backgroundColor: COLORS.background,
              }}
            />

            <Text
              style={{
                color: COLORS.textMuted,

                fontSize: 10,

                marginTop: 6,

                textAlign: "right",
              }}
            >
              {rejectionReason.length}/1000 characters
            </Text>

            <Pressable
              disabled={isRejecting}
              onPress={submitRejection}
              style={{
                backgroundColor: COLORS.danger,

                borderRadius: 12,

                minHeight: 49,

                alignItems: "center",

                justifyContent: "center",

                flexDirection: "row",

                marginTop: 17,

                opacity: isRejecting ? 0.6 : 1,
              }}
            >
              {isRejecting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={19}
                    color={COLORS.white}
                  />

                  <Text
                    style={{
                      color: COLORS.white,

                      fontSize: 12,

                      fontWeight: "900",

                      marginLeft: 8,
                    }}
                  >
                    Confirm Rejection
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              disabled={isRejecting}
              onPress={() => {
                setRejectingItem(null);

                setRejectionReason("");
              }}
              style={{
                alignItems: "center",

                paddingVertical: 14,
              }}
            >
              <Text
                style={{
                  color: COLORS.textSecondary,

                  fontSize: 12,

                  fontWeight: "800",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageItemsScreen;
