import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  circle = false,
  style,
}) => {
  return (
    <View
      accessible={false}
      style={[
        styles.skeleton,
        {
          width,
          height: circle ? height : height,
          borderRadius: circle ? height / 2 : borderRadius,
        },
        style,
      ]}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number | `${number}%`;
  spacing?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '65%',
  spacing = 10,
}) => {
  return (
    <View style={styles.textGroup}>
      {Array.from({ length: Math.max(0, lines) }).map((_, index) => {
        const isLast = index === lines - 1;

        return (
          <Skeleton
            key={`skeleton-line-${index}`}
            width={isLast ? lastLineWidth : '100%'}
            height={12}
            borderRadius={6}
            style={{ marginBottom: isLast ? 0 : spacing }}
          />
        );
      })}
    </View>
  );
};

export const SkeletonAvatar: React.FC<{
  size?: number;
}> = ({ size = 48 }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      circle
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonAvatar size={46} />

        <View style={styles.headerText}>
          <Skeleton width="65%" height={13} />
          <Skeleton
            width="40%"
            height={10}
            style={styles.smallGap}
          />
        </View>
      </View>

      <Skeleton
        width="100%"
        height={150}
        borderRadius={12}
        style={styles.imagePlaceholder}
      />

      <Skeleton width="80%" height={14} />
      <SkeletonText lines={2} spacing={8} />

      <View style={styles.cardFooter}>
        <Skeleton width={80} height={30} borderRadius={8} />
        <Skeleton width={95} height={30} borderRadius={8} />
      </View>
    </View>
  );
};

export const SkeletonList: React.FC<{
  count?: number;
}> = ({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: Math.max(0, count) }).map((_, index) => (
        <SkeletonCard key={`skeleton-card-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E8EDF4',
  },
  textGroup: {
    width: '100%',
    marginTop: 12,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF0F5',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  smallGap: {
    marginTop: 5,
  },
  imagePlaceholder: {
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

export default Skeleton;