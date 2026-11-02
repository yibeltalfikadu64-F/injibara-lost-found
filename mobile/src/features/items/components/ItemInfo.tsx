// mobile/src/features/items/components/ItemInfo.tsx

import React, { useMemo, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

/* =========================================================
   TYPES
========================================================= */

export interface ItemInformation {
  id: string;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  category?: string;
  location?: string;
  dateLostOrFound?: string;
  color?: string;
  brand?: string;
  identifyingFeatures?: string;
  createdAt?: string;
  updatedAt?: string;
  reporterName?: string;
  department?: string;
}

interface ItemInfoProps {
  item: ItemInformation;
  showReporter?: boolean;
  showAdditionalDetails?: boolean;
  descriptionLimit?: number;
  onCategoryPress?: (category: string) => void;
  onLocationPress?: (location: string) => void;
}

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#2563EB",
  background: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  blueLight: "#EFF6FF",
  greenLight: "#DCFCE7",
  green: "#15803D",
  redLight: "#FEE2E2",
  red: "#DC2626",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date?: string): string {
  if (!date) {
    return "Not provided";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* =========================================================
   DETAIL ROW
========================================================= */

interface DetailRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  onPress,
}) => {
  if (!value) {
    return null;
  }

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Text style={styles.detailIconText}>{icon}</Text>
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>

        <Text style={styles.detailValue}>{value}</Text>
      </View>

      {onPress && <Text style={styles.detailArrow}>›</Text>}
    </Pressable>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ItemInfo: React.FC<ItemInfoProps> = ({
  item,
  showReporter = true,
  showAdditionalDetails = true,
  descriptionLimit = 180,
  onCategoryPress,
  onLocationPress,
}) => {
  const [expanded, setExpanded] = useState(false);

  const description = item.description || "";

  const isLongDescription = description.length > descriptionLimit;

  const displayedDescription = useMemo(() => {
    if (!isLongDescription || expanded) {
      return description;
    }

    return `${description.slice(0, descriptionLimit).trimEnd()}...`;
  }, [description, descriptionLimit, expanded, isLongDescription]);

  const isLost = item.type === "LOST";

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      {/* Item title */}

      <View style={styles.heading}>
        <View style={styles.headingContent}>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.itemId}>Reference: {item.id}</Text>
        </View>

        <View
          style={[
            styles.typeBadge,
            isLost ? styles.lostBadge : styles.foundBadge,
          ]}
        >
          <Text
            style={[
              styles.typeBadgeText,
              isLost ? styles.lostText : styles.foundText,
            ]}
          >
            {isLost ? "LOST ITEM" : "FOUND ITEM"}
          </Text>
        </View>
      </View>

      {/* Category */}

      {item.category && (
        <Pressable
          onPress={() => onCategoryPress?.(item.category!)}
          style={styles.categoryChip}
        >
          <Text style={styles.categoryIcon}>▦</Text>

          <Text style={styles.categoryText}>{item.category}</Text>
        </Pressable>
      )}

      {/* Description */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>

        <Text style={styles.description}>
          {displayedDescription || "No description provided."}
        </Text>

        {isLongDescription && (
          <Pressable
            onPress={() => setExpanded((previous) => !previous)}
            style={styles.expandButton}
          >
            <Text style={styles.expandText}>
              {expanded ? "Show less" : "Read more"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main information */}

      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Item details</Text>

        <DetailRow
          icon="📍"
          label="Location"
          value={item.location}
          onPress={
            item.location ? () => onLocationPress?.(item.location!) : undefined
          }
        />

        <DetailRow
          icon="📅"
          label={isLost ? "Date lost" : "Date found"}
          value={formatDate(item.dateLostOrFound)}
        />

        <DetailRow icon="🎨" label="Color" value={item.color} />

        <DetailRow icon="🏷️" label="Brand" value={item.brand} />

        <DetailRow icon="🏫" label="Department" value={item.department} />
      </View>

      {/* Additional identifying features */}

      {showAdditionalDetails && item.identifyingFeatures && (
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Identifying features</Text>

          <Text style={styles.featuresText}>{item.identifyingFeatures}</Text>
        </View>
      )}

      {/* Reporter information */}

      {showReporter && item.reporterName && (
        <View style={styles.reporterCard}>
          <View style={styles.reporterAvatar}>
            <Text style={styles.reporterAvatarText}>
              {item.reporterName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.reporterContent}>
            <Text style={styles.reporterLabel}>Reported by</Text>

            <Text style={styles.reporterName}>{item.reporterName}</Text>
          </View>
        </View>
      )}

      {/* Report timestamps */}

      <View style={styles.timestamps}>
        {item.createdAt && (
          <Text style={styles.timestamp}>
            Created: {formatDate(item.createdAt)}
          </Text>
        )}

        {item.updatedAt && (
          <Text style={styles.timestamp}>
            Updated: {formatDate(item.updatedAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: 17,
  },

  heading: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  headingContent: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "900",
    color: COLORS.text,
  },

  itemId: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 6,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  lostBadge: {
    backgroundColor: COLORS.redLight,
  },

  foundBadge: {
    backgroundColor: COLORS.greenLight,
  },

  typeBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  lostText: {
    color: COLORS.red,
  },

  foundText: {
    color: COLORS.green,
  },

  categoryChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blueLight,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 13,
  },

  categoryIcon: {
    color: COLORS.primary,
    fontSize: 14,
    marginRight: 6,
  },

  categoryText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  section: {
    marginTop: 23,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 11,
  },

  description: {
    fontSize: 12,
    color: COLORS.secondary,
    lineHeight: 21,
  },

  expandButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  expandText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  detailsCard: {
    marginTop: 23,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailIconText: {
    fontSize: 15,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 9,
    color: COLORS.secondary,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  detailArrow: {
    fontSize: 21,
    color: COLORS.secondary,
    marginLeft: 8,
  },

  featuresCard: {
    marginTop: 17,
    padding: 15,
    backgroundColor: "#FFFBEB",
    borderRadius: 13,
  },

  featuresText: {
    fontSize: 11,
    lineHeight: 19,
    color: "#92400E",
  },

  reporterCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 13,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },

  reporterAvatarText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.primary,
  },

  reporterContent: {
    marginLeft: 11,
  },

  reporterLabel: {
    fontSize: 9,
    color: COLORS.secondary,
  },

  reporterName: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },

  timestamps: {
    marginTop: 18,
    gap: 5,
  },

  timestamp: {
    fontSize: 9,
    color: COLORS.secondary,
  },
});

export default ItemInfo;
