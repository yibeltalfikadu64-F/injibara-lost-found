// mobile/src/features/items/screens/ItemDetailsScreen.tsx

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import type { RouteProp } from "@react-navigation/native";

import { useAuthStore } from "../../auth/store/authStore";

/* =========================================================
   TYPES
========================================================= */

type ItemType = "LOST" | "FOUND";

type ItemStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "CLAIMED"
  | "RETURNED"
  | "REJECTED"
  | "RESOLVED"
  | "EXPIRED";

interface ItemRecord {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  status: ItemStatus;
  category?: string;
  location?: string;
  dateLostOrFound?: string;
  reportedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrls: string[];
  color?: string;
  brand?: string;
  identifyingFeatures?: string;
  ownerId?: string;
  reporterId?: string;
  reporter?: {
    id: string;
    fullName: string;
    email?: string;
  };
}

interface ItemDetailsRouteParams {
  itemId?: string;
  item?: ItemRecord;
}

interface ClaimResponse {
  message?: string;
}

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  purple: "#7C3AED",
  gray: "#F1F5F9",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string): string {
  if (!value) {
    return "Date not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusColor(status: ItemStatus) {
  switch (status) {
    case "ACTIVE":
    case "APPROVED":
      return {
        backgroundColor: COLORS.successLight,
        color: COLORS.success,
      };

    case "PENDING":
      return {
        backgroundColor: COLORS.warningLight,
        color: COLORS.warning,
      };

    case "CLAIMED":
      return {
        backgroundColor: "#F5F3FF",
        color: COLORS.purple,
      };

    case "RETURNED":
    case "RESOLVED":
      return {
        backgroundColor: COLORS.successLight,
        color: COLORS.success,
      };

    case "REJECTED":
    case "EXPIRED":
      return {
        backgroundColor: COLORS.dangerLight,
        color: COLORS.danger,
      };

    default:
      return {
        backgroundColor: COLORS.gray,
        color: COLORS.secondary,
      };
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();

    return body.message || body.error || "The request could not be completed.";
  } catch {
    return "The request could not be completed.";
  }
}

/* =========================================================
   REUSABLE INFORMATION ROW
========================================================= */

interface InformationRowProps {
  icon: string;
  label: string;
  value?: string;
}

const InformationRow: React.FC<InformationRowProps> = ({
  icon,
  label,
  value,
}) => {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.informationRow}>
      <View style={styles.informationIcon}>
        <Text style={styles.informationIconText}>{icon}</Text>
      </View>

      <View style={styles.informationTextContainer}>
        <Text style={styles.informationLabel}>{label}</Text>

        <Text style={styles.informationValue}>{value}</Text>
      </View>
    </View>
  );
};

/* =========================================================
   MAIN SCREEN
========================================================= */

const ItemDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route =
    useRoute<RouteProp<Record<string, ItemDetailsRouteParams>, string>>();

  const params = route.params || {};

  const itemId = params.itemId || params.item?.id;

  const token = useAuthStore((state) => state.accessToken);

  const currentUser = useAuthStore((state) => state.user);

  const [item, setItem] = useState<ItemRecord | null>(params.item || null);

  const [loading, setLoading] = useState(!params.item);

  const [refreshing, setRefreshing] = useState(false);

  const [claimLoading, setClaimLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     LOAD ITEM DETAILS
  ======================================================= */

  const loadItem = useCallback(
    async (refresh = false) => {
      if (!itemId) {
        setError("Item information was not provided.");
        setLoading(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/items/${encodeURIComponent(itemId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          },
        );

        if (!response.ok) {
          throw new Error(await readError(response));
        }

        const result = await response.json();

        const itemData: ItemRecord =
          result.data?.item || result.item || result.data || result;

        setItem({
          ...itemData,
          imageUrls: Array.isArray(itemData.imageUrls)
            ? itemData.imageUrls
            : [],
        });
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load item details.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [itemId, token],
  );

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const isOwner =
    Boolean(currentUser?.id) &&
    (item?.ownerId === currentUser?.id ||
      item?.reporterId === currentUser?.id ||
      item?.reporter?.id === currentUser?.id);

  const canClaim =
    item?.type === "FOUND" && item.status === "ACTIVE" && !isOwner;

  const canEdit =
    isOwner && item?.status !== "RETURNED" && item?.status !== "RESOLVED";

  /* =======================================================
     OPEN IMAGE VIEWER
  ======================================================= */

  const handleImagePress = useCallback(
    (index: number) => {
      if (!item) {
        return;
      }

      navigation.navigate("ImageViewer", {
        images: item.imageUrls,
        initialIndex: index,
        title: item.title,
      });
    },
    [item, navigation],
  );

  /* =======================================================
     CLAIM ITEM
  ======================================================= */

  const handleClaimItem = useCallback(async () => {
    if (!item) {
      return;
    }

    if (!token) {
      Alert.alert("Login required", "Please log in before submitting a claim.");
      return;
    }

    if (isOwner) {
      Alert.alert("Not allowed", "You cannot claim an item that you reported.");
      return;
    }

    Alert.alert(
      "Submit a claim",
      `Do you want to submit a claim for "${item.title}"? You may need to provide proof of ownership.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            navigation.navigate("CreateClaim", {
              itemId: item.id,
              itemTitle: item.title,
            });
          },
        },
      ],
    );
  }, [item, token, isOwner, navigation]);

  /* =======================================================
     EDIT ITEM
  ======================================================= */

  const handleEditItem = useCallback(() => {
    if (!item) {
      return;
    }

    navigation.navigate("EditItem", {
      itemId: item.id,
      item,
    });
  }, [item, navigation]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading && !item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.stateText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.centerState}>
          <Text style={styles.stateIcon}>⚠️</Text>

          <Text style={styles.stateTitle}>Unable to open item</Text>

          <Text style={styles.stateText}>
            {error || "This item could not be found."}
          </Text>

          <Pressable onPress={() => loadItem()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(item.status);

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Item Details</Text>

        {canEdit ? (
          <Pressable onPress={handleEditItem} style={styles.headerAction}>
            <Text style={styles.headerActionText}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.headerActionPlaceholder} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadItem(true)}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Image gallery */}

        {item.imageUrls.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
          >
            {item.imageUrls.map((imageUrl, index) => (
              <Pressable
                key={`${imageUrl}-${index}`}
                onPress={() => handleImagePress(index)}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {index + 1}/{item.imageUrls.length}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageIcon}>📦</Text>

            <Text style={styles.noImageText}>No images available</Text>
          </View>
        )}

        {/* Item heading */}

        <View style={styles.headingSection}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                item.type === "LOST" ? styles.lostBadge : styles.foundBadge,
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {item.type === "LOST" ? "LOST ITEM" : "FOUND ITEM"}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusColors.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: statusColors.color,
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.itemTitle}>{item.title}</Text>

          <Text style={styles.itemCategory}>
            {item.category || "Uncategorized"}
          </Text>
        </View>

        {/* Description */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>

          <Text style={styles.description}>
            {item.description || "No description provided."}
          </Text>
        </View>

        {/* Item information */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Information</Text>

          <InformationRow icon="📍" label="Location" value={item.location} />

          <InformationRow
            icon="📅"
            label={item.type === "LOST" ? "Date lost" : "Date found"}
            value={formatDate(item.dateLostOrFound)}
          />

          <InformationRow icon="🎨" label="Color" value={item.color} />

          <InformationRow icon="🏷️" label="Brand" value={item.brand} />

          <InformationRow
            icon="🔎"
            label="Identifying features"
            value={item.identifyingFeatures}
          />

          <InformationRow
            icon="🕒"
            label="Report created"
            value={formatDate(item.reportedAt || item.createdAt)}
          />
        </View>

        {/* Reporter information */}

        {item.reporter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reported By</Text>

            <View style={styles.reporterCard}>
              <View style={styles.reporterAvatar}>
                <Text style={styles.reporterAvatarText}>
                  {item.reporter.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.reporterDetails}>
                <Text style={styles.reporterName}>
                  {item.reporter.fullName}
                </Text>

                <Text style={styles.reporterRole}>Campus community member</Text>
              </View>
            </View>
          </View>
        )}

        {/* Error while refreshing */}

        {error && (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        )}

        {/* Actions */}

        <View style={styles.actionSection}>
          {canClaim && (
            <Pressable
              onPress={handleClaimItem}
              disabled={claimLoading}
              style={styles.primaryButton}
            >
              {claimLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Submit Ownership Claim
                </Text>
              )}
            </Pressable>
          )}

          {canEdit && (
            <Pressable onPress={handleEditItem} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Edit My Report</Text>
            </Pressable>
          )}

          {!canClaim && !canEdit && (
            <Text style={styles.actionInformation}>
              {item.status === "RETURNED" || item.status === "RESOLVED"
                ? "This report has been resolved."
                : "No actions are currently available for this item."}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    backgroundColor: COLORS.white,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.gray,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  backButtonText: {
    fontSize: 30,
    lineHeight: 34,
    color: COLORS.text,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: COLORS.text,
  },

  headerAction: {
    minWidth: 42,
    alignItems: "flex-end" as const,
  },

  headerActionText: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: COLORS.primary,
  },

  headerActionPlaceholder: {
    width: 42,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  imageGallery: {
    width: "100%" as const,
    height: 270,
    backgroundColor: COLORS.gray,
  },

  heroImage: {
    width: width,
    height: 270,
    backgroundColor: COLORS.gray,
  },

  imageCounter: {
    position: "absolute" as const,
    right: 15,
    bottom: 15,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(15,23,42,0.75)",
  },

  imageCounterText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: COLORS.white,
  },

  noImageContainer: {
    height: 220,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: COLORS.gray,
  },

  noImageIcon: {
    fontSize: 55,
  },

  noImageText: {
    marginTop: 10,
    color: COLORS.secondary,
    fontSize: 12,
  },

  headingSection: {
    padding: 20,
    backgroundColor: COLORS.white,
  },

  badgeRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 9,
    marginBottom: 13,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },

  lostBadge: {
    backgroundColor: COLORS.danger,
  },

  foundBadge: {
    backgroundColor: COLORS.success,
  },

  typeBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900" as const,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900" as const,
  },

  itemTitle: {
    fontSize: 23,
    fontWeight: "900" as const,
    color: COLORS.text,
    lineHeight: 30,
  },

  itemCategory: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700" as const,
    marginTop: 7,
  },

  section: {
    backgroundColor: COLORS.white,
    padding: 19,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900" as const,
    color: COLORS.text,
    marginBottom: 15,
  },

  description: {
    fontSize: 13,
    lineHeight: 22,
    color: COLORS.secondary,
  },

  informationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  informationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.gray,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },

  informationIconText: {
    fontSize: 16,
  },

  informationTextContainer: {
    flex: 1,
  },

  informationLabel: {
    fontSize: 10,
    color: COLORS.secondary,
    marginBottom: 4,
  },

  informationValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: "700" as const,
  },

  reporterCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: COLORS.background,
    padding: 13,
    borderRadius: 13,
  },

  reporterAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  reporterAvatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900" as const,
  },

  reporterDetails: {
    flex: 1,
    marginLeft: 12,
  },

  reporterName: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: COLORS.text,
  },

  reporterRole: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
  },

  actionSection: {
    padding: 20,
    gap: 11,
  },

  primaryButton: {
    minHeight: 51,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 16,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900" as const,
  },

  secondaryButton: {
    minHeight: 49,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 13,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800" as const,
  },

  actionInformation: {
    fontSize: 11,
    color: COLORS.secondary,
    textAlign: "center" as const,
    paddingVertical: 12,
  },

  inlineError: {
    marginHorizontal: 18,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.dangerLight,
  },

  inlineErrorText: {
    color: COLORS.danger,
    fontSize: 11,
  },

  centerState: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 30,
  },

  stateIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  stateTitle: {
    fontSize: 18,
    fontWeight: "900" as const,
    color: COLORS.text,
    marginBottom: 8,
  },

  stateText: {
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: "center" as const,
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 15,
  },
};

export default ItemDetailsScreen;
