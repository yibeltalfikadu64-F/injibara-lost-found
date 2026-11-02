import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface OfflineBannerProps {
  visible?: boolean;
  message?: string;
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible = true,
  message = 'You are offline. Some features may be unavailable.',
  showIcon = true,
  style,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.container, style]}
    >
      {showIcon ? (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>!</Text>
        </View>
      ) : null}

      <View style={styles.messageContainer}>
        <Text style={styles.title}>No internet connection</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF4D6',
    borderBottomWidth: 1,
    borderBottomColor: '#F5D78E',
    gap: 12,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5D78E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#805B00',
    fontSize: 17,
    fontWeight: '800',
  },
  messageContainer: {
    flex: 1,
  },
  title: {
    color: '#805B00',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    color: '#8A6B22',
    fontSize: 12,
    lineHeight: 17,
  },
});

export default OfflineBanner;