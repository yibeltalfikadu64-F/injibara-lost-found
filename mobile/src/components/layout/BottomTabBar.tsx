import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface TabConfiguration {
  routeName: string;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
}

interface BottomTabBarProps {
  navigationProps: BottomTabBarProps;

  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;

  borderColor?: string;

  hiddenRoutes?: string[];

  badges?: Record<string, number>;

  showLabels?: boolean;

  containerStyle?: ViewStyle;
}

const DEFAULT_TABS: TabConfiguration[] = [
  {
    routeName: 'HomeTab',
    label: 'Home',
    icon: '⌂',
    activeIcon: '⌂',
  },
  {
    routeName: 'SearchTab',
    label: 'Search',
    icon: '⌕',
    activeIcon: '⌕',
  },
  {
    routeName: 'ReportTab',
    label: 'Report',
    icon: '+',
    activeIcon: '+',
  },
  {
    routeName: 'ActivityTab',
    label: 'Activity',
    icon: '◷',
    activeIcon: '◷',
  },
  {
    routeName: 'ProfileTab',
    label: 'Profile',
    icon: '♙',
    activeIcon: '♙',
  },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  navigationProps,

  backgroundColor = '#FFFFFF',
  activeColor = '#2563EB',
  inactiveColor = '#94A3B8',

  borderColor = '#E2E8F0',

  hiddenRoutes = [],

  badges = {},

  showLabels = true,

  containerStyle,
}) => {
  const insets = useSafeAreaInsets();

  const {
    state,
    descriptors,
    navigation,
  } = navigationProps;

  const visibleRoutes = state.routes.filter(
    (route) => !hiddenRoutes.includes(route.name),
  );

  const getTabConfiguration = (
    routeName: string,
  ): TabConfiguration => {
    const configured = DEFAULT_TABS.find(
      (tab) => tab.routeName === routeName,
    );

    if (configured) {
      return configured;
    }

    return {
      routeName,
      label: routeName.replace(/Tab$/, ''),
      icon: '○',
      activeIcon: '●',
    };
  };

  const renderTab = (
    route: (typeof state.routes)[number],
    index: number,
  ) => {
    const configuration = getTabConfiguration(
      route.name,
    );

    const routeIndex = state.routes.findIndex(
      (item) => item.key === route.key,
    );

    const isFocused = state.index === routeIndex;

    const descriptor = descriptors[route.key];

    const options = descriptor?.options;

    const label =
      typeof options?.tabBarLabel === 'string'
        ? options.tabBarLabel
        : configuration.label;

    const badgeCount =
      badges[route.name] ??
      (typeof options?.tabBarBadge === 'number'
        ? options.tabBarBadge
        : 0);

    const color = isFocused
      ? activeColor
      : inactiveColor;

    const icon =
      options?.tabBarIcon &&
      typeof options.tabBarIcon === 'function'
        ? options.tabBarIcon({
            focused: isFocused,
            color,
            size: 23,
          })
        : (
          <Text
            style={[
              styles.icon,
              {
                color,
                fontSize:
                  route.name === 'ReportTab' ? 29 : 23,
                fontWeight: isFocused
                  ? '800'
                  : '500',
              },
            ]}
          >
            {isFocused
              ? configuration.activeIcon ||
                configuration.icon
              : configuration.icon}
          </Text>
        );

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{
          selected: isFocused,
        }}
        accessibilityLabel={
          options?.tabBarAccessibilityLabel ||
          `${label} tab`
        }
        testID={options?.tabBarButtonTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.tab,
          pressed && styles.pressedTab,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            isFocused && styles.activeIconContainer,
          ]}
        >
          {icon}

          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          ) : null}
        </View>

        {showLabels ? (
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              { color },
              isFocused && styles.activeLabel,
            ]}
          >
            {label}
          </Text>
        ) : null}

        {isFocused ? (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: activeColor },
            ]}
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderTopColor: borderColor,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        containerStyle,
      ]}
    >
      <View style={styles.tabsContainer}>
        {visibleRoutes.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 7,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  tabsContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  tab: {
    flex: 1,
    minHeight: 53,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    position: 'relative',
  },

  pressedTab: {
    opacity: 0.65,
  },

  iconContainer: {
    width: 38,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  activeIconContainer: {
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
  },

  icon: {
    textAlign: 'center',
    lineHeight: 28,
  },

  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },

  activeLabel: {
    fontWeight: '800',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -5,
    width: 17,
    height: 3,
    borderRadius: 3,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
});

export default BottomTabBar;