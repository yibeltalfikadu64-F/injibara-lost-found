import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showDetails?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not complete your request. Please try again.',
  errorDetails,
  onRetry,
  retryLabel = 'Try Again',
  showDetails = false,
  style,
  compact = false,
}) => {
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        compact && styles.compact,
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.errorIcon}>!</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.message}>{message}</Text>

      {showDetails && errorDetails ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Technical details</Text>
          <Text style={styles.detailsText}>{errorDetails}</Text>
        </View>
      ) : null}

      {onRetry ? (
        <View style={styles.retryButton}>
          <Button
            title={retryLabel}
            onPress={onRetry}
            variant="primary"
            leftIcon={<Text style={styles.retryIcon}>↻</Text>}
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
    paddingVertical: 44,
  },
  compact: {
    paddingVertical: 22,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FEECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  errorIcon: {
    color: '#DC2626',
    fontSize: 42,
    fontWeight: '800',
  },
  title: {
    color: '#172033',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    maxWidth: 310,
    color: '#718096',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
  },
  detailsTitle: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  detailsText: {
    color: '#7F1D1D',
    fontSize: 12,
    lineHeight: 18,
  },
  retryButton: {
    minWidth: 150,
    marginTop: 22,
  },
  retryIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default ErrorState;