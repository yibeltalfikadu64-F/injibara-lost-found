// mobile/src/features/items/components/ItemTimeline.tsx

import React, { useMemo } from "react";

import { StyleSheet, Text, View } from "react-native";

/* =========================================================
   TYPES
========================================================= */

export type TimelineEventStatus =
  | "COMPLETED"
  | "CURRENT"
  | "PENDING"
  | "FAILED";

export interface ItemTimelineEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status: TimelineEventStatus;
  actor?: string;
  icon?: string;
}

interface ItemTimelineProps {
  events: ItemTimelineEvent[];
  title?: string;
  emptyMessage?: string;
  showActor?: boolean;
  showDates?: boolean;
  compact?: boolean;
}

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
  gray: "#F1F5F9",
};

/* =========================================================
   HELPERS
========================================================= */

function formatTimelineDate(date?: string): string {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: TimelineEventStatus): string {
  switch (status) {
    case "COMPLETED":
      return COLORS.success;

    case "CURRENT":
      return COLORS.primary;

    case "FAILED":
      return COLORS.danger;

    case "PENDING":
    default:
      return COLORS.warning;
  }
}

function getStatusIcon(event: ItemTimelineEvent): string {
  if (event.icon) {
    return event.icon;
  }

  switch (event.status) {
    case "COMPLETED":
      return "✓";

    case "CURRENT":
      return "●";

    case "FAILED":
      return "×";

    case "PENDING":
    default:
      return "○";
  }
}

/* =========================================================
   TIMELINE EVENT
========================================================= */

interface TimelineEventProps {
  event: ItemTimelineEvent;
  index: number;
  isLast: boolean;
  compact: boolean;
  showActor: boolean;
  showDates: boolean;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  event,
  index,
  isLast,
  compact,
  showActor,
  showDates,
}) => {
  const color = getStatusColor(event.status);

  const icon = getStatusIcon(event);

  return (
    <View style={styles.eventRow}>
      {/* Timeline line and icon */}

      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineDot,
            {
              borderColor: color,
              backgroundColor:
                event.status === "PENDING" ? COLORS.white : color,
            },
          ]}
        >
          <Text
            style={[
              styles.timelineDotText,
              {
                color: event.status === "PENDING" ? color : COLORS.white,
              },
            ]}
          >
            {icon}
          </Text>
        </View>

        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor:
                  event.status === "COMPLETED" ? COLORS.success : COLORS.border,
              },
            ]}
          />
        )}
      </View>

      {/* Event content */}

      <View
        style={[styles.eventContent, compact && styles.compactEventContent]}
      >
        <View style={styles.eventHeading}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <Text style={[styles.eventNumber, { color }]}>
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>

        {event.description && (
          <Text style={styles.eventDescription}>{event.description}</Text>
        )}

        {showDates && event.date && (
          <Text style={styles.eventDate}>{formatTimelineDate(event.date)}</Text>
        )}

        {showActor && event.actor && (
          <View style={styles.actorContainer}>
            <Text style={styles.actorIcon}>👤</Text>

            <Text style={styles.actorText}>{event.actor}</Text>
          </View>
        )}

        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: `${color}18`,
            },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: color }]} />

          <Text style={[styles.statusText, { color }]}>
            {event.status.replace(/_/g, " ")}
          </Text>
        </View>
      </View>
    </View>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ItemTimeline: React.FC<ItemTimelineProps> = ({
  events,
  title = "Item activity",
  emptyMessage = "No activity has been recorded yet.",
  showActor = true,
  showDates = true,
  compact = false,
}) => {
  const sortedEvents = useMemo(
    () =>
      [...events].sort((first, second) => {
        if (!first.date || !second.date) {
          return 0;
        }

        return new Date(first.date).getTime() - new Date(second.date).getTime();
      }),
    [events],
  );

  const completedCount = sortedEvents.filter(
    (event) => event.status === "COMPLETED",
  ).length;

  const totalEvents = sortedEvents.length;

  const progress =
    totalEvents > 0 ? Math.round((completedCount / totalEvents) * 100) : 0;

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (sortedEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🕒</Text>

        <Text style={styles.emptyTitle}>No activity yet</Text>

        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>◷</Text>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>

          <Text style={styles.headerSubtitle}>
            {totalEvents} recorded {totalEvents === 1 ? "event" : "events"}
          </Text>
        </View>
      </View>

      {/* Progress */}

      <View style={styles.progressCard}>
        <View style={styles.progressHeading}>
          <Text style={styles.progressTitle}>Completed activities</Text>

          <Text style={styles.progressValue}>{progress}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.progressCaption}>
          {completedCount} of {totalEvents} activities completed
        </Text>
      </View>

      {/* Timeline */}

      <View style={styles.timeline}>
        {sortedEvents.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            index={index}
            isLast={index === sortedEvents.length - 1}
            compact={compact}
            showActor={showActor}
            showDates={showDates}
          />
        ))}
      </View>

      {/* Footer */}

      <View style={styles.footer}>
        <Text style={styles.footerIcon}>🔒</Text>

        <Text style={styles.footerText}>
          Activity records are provided for transparency. Sensitive verification
          information is not displayed here.
        </Text>
      </View>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    padding: 17,
    backgroundColor: COLORS.white,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIconText: {
    fontSize: 22,
    color: COLORS.primary,
  },

  headerContent: {
    marginLeft: 11,
    flex: 1,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
  },

  progressCard: {
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    marginBottom: 22,
  },

  progressHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  progressValue: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },

  progressTrack: {
    height: 7,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: COLORS.success,
  },

  progressCaption: {
    fontSize: 9,
    color: COLORS.secondary,
    marginTop: 8,
  },

  timeline: {
    paddingTop: 4,
  },

  eventRow: {
    flexDirection: "row",
    minHeight: 105,
  },

  timelineColumn: {
    width: 31,
    alignItems: "center",
  },

  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  timelineDotText: {
    fontSize: 11,
    fontWeight: "900",
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 65,
    marginTop: 3,
  },

  eventContent: {
    flex: 1,
    paddingLeft: 13,
    paddingBottom: 23,
  },

  compactEventContent: {
    paddingBottom: 12,
  },

  eventHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  eventTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
    flex: 1,
  },

  eventNumber: {
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 8,
  },

  eventDescription: {
    fontSize: 10,
    lineHeight: 17,
    color: COLORS.secondary,
    marginTop: 6,
  },

  eventDate: {
    fontSize: 9,
    color: COLORS.secondary,
    marginTop: 7,
  },

  actorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  actorIcon: {
    fontSize: 10,
    marginRight: 5,
  },

  actorText: {
    fontSize: 9,
    color: COLORS.secondary,
  },

  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 9,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "900",
  },

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
    marginTop: 5,
  },

  footerIcon: {
    fontSize: 14,
    marginRight: 8,
  },

  footerText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  emptyContainer: {
    padding: 30,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 11,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyMessage: {
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
    color: COLORS.secondary,
    marginTop: 7,
  },
});

export default ItemTimeline;
