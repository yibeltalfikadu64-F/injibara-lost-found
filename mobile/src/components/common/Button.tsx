import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const COLORS = {
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  secondary: '#E8EEFF',
  secondaryText: '#1E40AF',
  danger: '#DC2626',
  dangerPressed: '#B91C1C',
  white: '#FFFFFF',
  text: '#172033',
  border: '#D5DCE8',
  disabled: '#AAB4C5',
  transparent: 'transparent',
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  accessibilityLabel,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    variant === 'ghost' && styles.ghostText,
    variant === 'danger' && styles.dangerText,
    isDisabled && styles.disabledText,
  ];

  const indicatorColor =
    variant === 'secondary' ||
    variant === 'outline' ||
    variant === 'ghost'
      ? COLORS.primary
      : COLORS.white;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        ...containerStyle,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? (
            <View style={styles.iconContainer}>{leftIcon}</View>
          ) : null}

          <Text style={textStyle}>{title}</Text>

          {rightIcon ? (
            <View style={styles.iconContainer}>{rightIcon}</View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  small: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 9,
  },
  medium: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  large: {
    minHeight: 54,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: COLORS.transparent,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  text: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryText: {
    color: COLORS.secondaryText,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.white,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
    opacity: 0.75,
  },
  disabledText: {
    color: COLORS.white,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});

export default Button;