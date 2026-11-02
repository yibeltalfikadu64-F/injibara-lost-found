import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type ItemStatus =
  | "LOST"
  | "FOUND"
  | "CLAIMED"
  | "RETURNED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type ItemType = "LOST" | "FOUND";

export interface ItemCardData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  imageUrl?: string | null;
  image?: ImageSourcePropType;
  status: ItemStatus;
  type?: ItemType;
  reporterName?: string;
  referenceNumber?: string;
}

interface ItemCardProps {
  item: ItemCardData;
  onPress?: (item: ItemCardData) => void;
  onClaimPress?: (item: ItemCardData) => void;
  showClaimButton?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

const COLORS = {
  primary: "#2563EB",
  text: "#172033",
  secondaryText: "#718096",
  border: "#E8EDF4",
  background: "#FFFFFF",
  mutedBackground: "#F1F5F9",
  lost: "#DC2626",
  found: "#16A34A",
  pending: "#D97706",
  returned: "#0D9488",
  claimed: "#7C3AED",
  approved: "#16A34A",
  rejected: "#DC2626",
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  LOST: "Lost",
  FOUND: "Found",
  CLAIMED: "Claimed",
  RETURNED: "Returned",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<ItemStatus, string> = {
  LOST: COLORS.lost,
  FOUND: COLORS.found,
  CLAIMED: COLORS.claimed,
  RETURNED: COLORS.returned,
  PENDING: COLORS.pending,
  APPROVED: COLORS.approved,
  REJECTED: COLORS.rejected,
};

const formatDate = (date?: string): string => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString();
};

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onPress,
  onClaimPress,
  showClaimButton = false,
  compact = false,
  style,
}) => {
  const statusColor = STATUS_COLORS[item.status];

  const imageSource = item.imageUrl ? { uri: item.imageUrl } : item.image;

  const handlePress = () => {
    onPress?.(item);
  };

  const handleClaim = () => {
    onClaimPress?.(item);
  };

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${item.title}, ${STATUS_LABELS[item.status]} item`}
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={[styles.image, compact && styles.compactImage]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.imagePlaceholder, compact && styles.compactImage]}
          >
            <Text style={styles.placeholderIcon}>📦</Text>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headingRow}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>

          {item.type ? (
            <View
              style={[
                styles.typeBadge,
                item.type === "LOST" ? styles.lostBadge : styles.foundBadge,
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  item.type === "LOST" ? styles.lostText : styles.foundText,
                ]}
              >
                {item.type}
              </Text>
            </View>
          ) : null}
        </View>

        {item.description ? (
          <Text numberOfLines={compact ? 1 : 2} style={styles.description}>
            {item.description}
          </Text>
        ) : null}

        {item.category ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>▦</Text>
            <Text style={styles.infoText}>{item.category}</Text>
          </View>
        ) : null}

        {item.location ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⌖</Text>
            <Text numberOfLines={1} style={styles.infoText}>
              {item.location}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateIcon}>◷</Text>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>

          {item.reporterName ? (
            <Text numberOfLines={1} style={styles.reporter}>
              {item.reporterName}
            </Text>
          ) : null}
        </View>

        {item.referenceNumber ? (
          <Text style={styles.reference}>
            Reference: {item.referenceNumber}
          </Text>
        ) : null}

        {showClaimButton && onClaimPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={handleClaim}
            style={({ pressed }) => [
              styles.claimButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.claimButtonText}>Submit Claim</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  compactCard: {
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.92,
  },
  imageContainer: {
    width: "100%",
    height: 185,
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  compactImage: {
    height: 125,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2F7",
  },
  placeholderIcon: {
    fontSize: 38,
    marginBottom: 5,
  },
  placeholderText: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  content: {
    padding: 15,
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 7,
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },
  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  lostBadge: {
    backgroundColor: "#FEECEC",
  },
  foundBadge: {
    backgroundColor: "#DCFCE7",
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  lostText: {
    color: COLORS.lost,
  },
  foundText: {
    color: COLORS.found,
  },
  description: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 8,
  },
  infoIcon: {
    width: 17,
    color: COLORS.primary,
    fontSize: 17,
    textAlign: "center",
  },
  infoText: {
    flex: 1,
    color: "#526078",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateIcon: {
    color: COLORS.secondaryText,
    fontSize: 16,
  },
  dateText: {
    color: COLORS.secondaryText,
    fontSize: 11,
  },
  reporter: {
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 11,
    textAlign: "right",
  },
  reference: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 9,
  },
  claimButton: {
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default ItemCard;
