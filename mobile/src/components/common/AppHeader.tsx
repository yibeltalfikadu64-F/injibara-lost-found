import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  centerTitle?: boolean;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  testID?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  leftElement,
  rightElement,
  centerTitle = false,
  style,
  backgroundColor = '#FFFFFF',
  testID,
}) => {
  const renderLeftElement = () => {
    if (leftElement) {
      return <View style={styles.leftSlot}>{leftElement}</View>;
    }

    if (showBackButton && onBackPress) {
      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      );
    }

    return <View style={styles.leftPlaceholder} />;
  };

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        {renderLeftElement()}

        <View
          style={[
            styles.titleContainer,
            centerTitle && styles.centerTitle,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              centerTitle && styles.centeredText,
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                centerTitle && styles.centeredText,
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>
          {rightElement || <View style={styles.rightPlaceholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlot: {
    minWidth: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#172033',
    fontSize: 34,
    lineHeight: 36,
    marginTop: -4,
  },
  leftPlaceholder: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  centerTitle: {
    alignItems: 'center',
  },
  title: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#718096',
    fontSize: 12,
    marginTop: 3,
  },
  centeredText: {
    textAlign: 'center',
  },
  rightSlot: {
    minWidth: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
  pressed: {
    opacity: 0.65,
  },
});

export default AppHeader;