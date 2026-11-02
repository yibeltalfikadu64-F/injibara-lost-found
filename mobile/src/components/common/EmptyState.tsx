import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  description = 'There is no information to display right now.',
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  compact = false,
}) => {
  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.container,
        compact && styles.compact,
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {icon || <Text style={styles.defaultIcon}>📦</Text>}
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="medium"
          />
        </View>
      ) : null}

      {secondaryActionLabel && onSecondaryAction ? (
        <View style={styles.secondaryAction}>
          <Button
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="ghost"
            size="small"
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  compact: {
    paddingVertical: 24,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  defaultIcon: {
    fontSize: 38,
  },
  title: {
    color: '#172033',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    maxWidth: 300,
    color: '#718096',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    marginTop: 22,
    minWidth: 160,
  },
  secondaryAction: {
    marginTop: 8,
  },
});

export default EmptyState;