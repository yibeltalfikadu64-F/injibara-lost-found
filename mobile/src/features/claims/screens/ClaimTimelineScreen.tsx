// mobile/src/features/claims/screens/ClaimTimelineScreen.tsx

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuthStore } from '../../auth/store/authStore';
import claimsApi, {
  ClaimsApiError,
  type ClaimTimelineEvent,
} from '../services/claimsApi';
import {
  CLAIM_COLORS,
  claimsScreenStyles as shared,
} from '../styles/ClaimsScreen.styles';

type ClaimsStackParamList = {
  ClaimTimeline: {
    claimId: string;
  };
};

type Props = NativeStackScreenProps<
  ClaimsStackParamList,
  'ClaimTimeline'
>;

interface TimelineAppearance {
  icon: string;
  color: string;
  background: string;
  label: string;
}

const EVENT_APPEARANCE: Record<
  string,
  TimelineAppearance
> = {
  CREATED: {
    icon: '＋',
    color: '#2563A6',
    background: '#EAF3FF',
    label: 'Claim created',
  },
  SUBMITTED: {
    icon: '✓',
    color: '#2563A6',
    background: '#EAF3FF',
    label: 'Claim submitted',
  },
  UNDER_REVIEW: {
    icon: '⌕',
    color: '#A66B00',
    background: '#FFF4D6',
    label: 'Under review',
  },
  QUESTION_REQUESTED: {
    icon: '?',
    color: '#7552A6',
    background: '#F2ECFF',
    label: 'Additional information requested',
  },
  APPROVED: {
    icon: '✓',
    color: '#16834B',
    background: '#E7F6ED',
    label: 'Claim approved',
  },
  REJECTED: {
    icon: '×',
    color: '#C62828',
    background: '#FDECEC',
    label: 'Claim rejected',
  },
  HANDOVER_CODE_GENERATED: {
    icon: '⌑',
    color: '#7552A6',
    background: '#F2ECFF',
    label: 'Handover code generated',
  },
  HANDOVER_CONFIRMED: {
    icon: '✓',
    color: '#16834B',
    background: '#E7F6ED',
    label: 'Handover confirmed',
  },
  COMPLETED: {
    icon: '✓',
    color: '#16834B',
    background: '#E7F6ED',
    label: 'Claim completed',
  },
  CANCELLED: {
    icon: '×',
    color: '#667085',
    background: '#F0F0F0',
    label: 'Claim cancelled',
  },
  UPDATED: {
    icon: '↻',
    color: '#2563A6',
    background: '#EAF3FF',
    label: 'Claim updated',
  },
};

const ClaimTimelineScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { claimId } = route.params;

  const accessToken = useAuthStore(
    (state: any) => state.accessToken,
  );

  const [events, setEvents] = useState<
    ClaimTimelineEvent[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTimeline = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setError('Please sign in to view claim history.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const result =
          await claimsApi.getClaimTimeline(
            claimId,
            accessToken,
          );

        const sortedEvents = [...result].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime(),
        );

        setEvents(sortedEvents);
      } catch (err) {
        setError(
          err instanceof ClaimsApiError
            ? err.message
            : 'Unable to load the claim timeline.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, claimId],
  );

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const renderEvent = (
    event: ClaimTimelineEvent,
    index: number,
  ) => {
    const appearance =
      EVENT_APPEARANCE[event.type] || {
        icon: '•',
        color: '#667085',
        background: '#F0F0F0',
        label: formatEventName(event.type),
      };

    const isLast = index === events.length - 1;

    const title = event.title || appearance.label;

    const description =
      event.description ||
      event.message ||
      'The claim record was updated.';

    const actorName =
      event.actor?.fullName ||
      event.actor?.name ||
      'Campus system';

    return (
      <View
        key={event.id}
        style={styles.timelineRow}
      >
        <View style={styles.markerColumn}>
          <View
            style={[
              styles.marker,
              {
                backgroundColor: appearance.background,
              },
            ]}
          >
            <Text
              style={[
                styles.markerIcon,
                { color: appearance.color },
              ]}
            >
              {appearance.icon}
            </Text>
          </View>

          {!isLast && (
            <View style={styles.connector} />
          )}
        </View>

        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>
              {title}
            </Text>

            <Text style={styles.eventDate}>
              {formatTime(event.createdAt)}
            </Text>
          </View>

          <Text style={styles.eventDescription}>
            {description}
          </Text>

          <View style={styles.actorRow}>
            <View style={styles.actorAvatar}>
              <Text style={styles.actorAvatarText}>
                {actorName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.actorName}>
              {actorName}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={shared.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={CLAIM_COLORS.primary}
        />

        <Text style={shared.loadingText}>
          Loading claim history...
        </Text>
      </View>
    );
  }

  if (error && events.length === 0) {
    return (
      <View style={shared.screen}>
        <View style={shared.emptyContainer}>
          <View style={shared.emptyIcon}>
            <Text style={shared.emptyIconText}>⚠️</Text>
          </View>

          <Text style={shared.emptyTitle}>
            Timeline unavailable
          </Text>

          <Text style={shared.emptyDescription}>
            {error}
          </Text>

          <Pressable
            onPress={() => loadTimeline()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={shared.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTimeline(true)}
            colors={[CLAIM_COLORS.primary]}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            CLAIM ACTIVITY
          </Text>

          <Text style={shared.screenTitle}>
            Claim timeline
          </Text>

          <Text style={shared.screenSubtitle}>
            See the sequence of updates and actions related to
            your ownership claim.
          </Text>
        </View>

        <View style={styles.referenceCard}>
          <View style={styles.referenceIcon}>
            <Text style={styles.referenceIconText}>
              🕒
            </Text>
          </View>

          <View style={styles.referenceDetails}>
            <Text style={styles.referenceTitle}>
              Claim activity history
            </Text>

            <Text style={styles.referenceSubtitle}>
              Reference: {claimId}
            </Text>
          </View>

          <View style={styles.eventCount}>
            <Text style={styles.eventCountNumber}>
              {events.length}
            </Text>
            <Text style={styles.eventCountLabel}>
              EVENTS
            </Text>
          </View>
        </View>

        {events.length === 0 ? (
          <View style={shared.emptyContainer}>
            <View style={shared.emptyIcon}>
              <Text style={shared.emptyIconText}>
                📅
              </Text>
            </View>

            <Text style={shared.emptyTitle}>
              No activity recorded yet
            </Text>

            <Text style={shared.emptyDescription}>
              Updates will appear here when your claim is
              submitted, reviewed, or updated.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {events.map(renderEvent)}
          </View>
        )}

        <View style={styles.informationCard}>
          <Text style={styles.informationTitle}>
            About your claim history
          </Text>

          <Text style={styles.informationDescription}>
            This timeline displays activity recorded by the
            campus lost and found system. Some actions may take
            time to appear after they are processed by authorized
            staff.
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            Back to claim details
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

function formatEventName(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 45,
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    color: CLAIM_COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  referenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: '#FFFFFF',
    marginBottom: 25,
  },
  referenceIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referenceIconText: {
    fontSize: 20,
  },
  referenceDetails: {
    flex: 1,
    gap: 5,
  },
  referenceTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  referenceSubtitle: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 9,
  },
  eventCount: {
    alignItems: 'center',
  },
  eventCountNumber: {
    color: CLAIM_COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  eventCountLabel: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 8,
    fontWeight: '800',
  },
  timeline: {
    paddingTop: 5,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  markerColumn: {
    width: 40,
    alignItems: 'center',
  },
  marker: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  markerIcon: {
    fontSize: 19,
    fontWeight: '900',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 65,
    backgroundColor: '#DDE4ED',
  },
  eventCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    gap: 9,
  },
  eventHeader: {
    gap: 5,
  },
  eventTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  eventDate: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 10,
  },
  eventDescription: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 3,
  },
  actorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actorAvatarText: {
    color: CLAIM_COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  actorName: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  informationCard: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
    marginTop: 10,
  },
  informationTitle: {
    color: '#315A86',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  informationDescription: {
    color: '#456B91',
    fontSize: 11,
    lineHeight: 18,
  },
  backButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: CLAIM_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: CLAIM_COLORS.primary,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default ClaimTimelineScreen;