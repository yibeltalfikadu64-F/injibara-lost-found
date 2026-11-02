import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const Loader: React.FC<LoaderProps> = ({
  message = 'Please wait...',
  size = 'large',
  color = '#2563EB',
  fullScreen = false,
  overlay = false,
  style,
  testID,
}) => {
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        overlay && styles.overlay,
        style,
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />

        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  message: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Loader;