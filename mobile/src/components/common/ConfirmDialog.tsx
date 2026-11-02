import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type DialogVariant = 'default' | 'danger' | 'success';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: DialogVariant;
  icon?: React.ReactNode;
  dismissOnBackdropPress?: boolean;
  style?: StyleProp<ViewStyle>;
}

const COLORS = {
  primary: '#2563EB',
  danger: '#DC2626',
  success: '#16A34A',
  text: '#172033',
  muted: '#718096',
  border: '#E2E8F0',
  white: '#FFFFFF',
  backdrop: 'rgba(15, 23, 42, 0.55)',
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'default',
  icon,
  dismissOnBackdropPress = true,
  style,
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'danger':
        return COLORS.danger;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const variantColor = getVariantColor();

  const handleBackdropPress = () => {
    if (!loading && dismissOnBackdropPress) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close confirmation dialog"
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
        />

        <View
          accessibilityViewIsModal
          style={[styles.dialog, style]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${variantColor}15` },
            ]}
          >
            {icon || (
              <Text style={[styles.defaultIcon, { color: variantColor }]}>
                {variant === 'danger'
                  ? '!'
                  : variant === 'success'
                    ? '✓'
                    : '?'}
              </Text>
            )}
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              accessibilityState={{
                disabled: loading,
                busy: loading,
              }}
              disabled={loading}
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: variantColor },
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />
              ) : (
                <Text style={styles.confirmText}>
                  {confirmText}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  defaultIcon: {
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  confirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default ConfirmDialog;