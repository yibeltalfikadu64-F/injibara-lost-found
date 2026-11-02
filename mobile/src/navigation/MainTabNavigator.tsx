import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../app/providers/ThemeProvider";
import { useAuth } from "../app/providers/AuthProvider";

import HomeStack from "./HomeStack";
import SearchStack from "./SearchStack";

import MyItemsScreen from "../screens/items/MyItemsScreen";
import MyClaimsScreen from "../screens/claims/MyClaimsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManageItemsScreen from "../screens/admin/ManageItemsScreen";
import ManageClaimsScreen from "../screens/admin/ManageClaimsScreen";
import ManageUsersScreen from "../screens/admin/ManageUsersScreen";

/*
|--------------------------------------------------------------------------
| MAIN TAB PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  MyItemsTab: undefined;
  MyClaimsTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

/*
|--------------------------------------------------------------------------
| ADMIN STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageItems: undefined;
  ManageClaims: undefined;
  ManageUsers: undefined;
};

/*
|--------------------------------------------------------------------------
| NAVIGATOR INITIALIZATION
|--------------------------------------------------------------------------
*/

const Tab = createBottomTabNavigator<MainTabParamList>();

const AdminStack = createNativeStackNavigator<AdminStackParamList>();

/*
|--------------------------------------------------------------------------
| TAB ICON COMPONENT
|--------------------------------------------------------------------------
*/

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon?: React.ComponentProps<typeof Ionicons>["name"];
}

const TabIcon: React.FC<TabIconProps> = ({
  focused,
  color,
  size,
  icon,
  activeIcon,
}) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={focused && activeIcon ? activeIcon : icon}
        size={size}
        color={color}
      />
      {focused && (
        <View style={[styles.activeIndicator, { backgroundColor: color }]} />
      )}
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| TAB LABEL COMPONENT
|--------------------------------------------------------------------------
*/

interface TabLabelProps {
  label: string;
  focused: boolean;
  color: string;
}

const TabLabel: React.FC<TabLabelProps> = ({ label, focused, color }) => {
  return (
    <Text
      numberOfLines={1}
      style={[
        styles.tabLabel,
        {
          color,
          fontWeight: focused ? "800" : "500",
        },
      ]}
    >
      {label}
    </Text>
  );
};

/*
|--------------------------------------------------------------------------
| ADMIN NAVIGATOR
|--------------------------------------------------------------------------
*/

const AdminNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "800",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Admin Dashboard",
        }}
      />

      <AdminStack.Screen
        name="ManageItems"
        component={ManageItemsScreen}
        options={{
          title: "Manage Items",
        }}
      />

      <AdminStack.Screen
        name="ManageClaims"
        component={ManageClaimsScreen}
        options={{
          title: "Manage Claims",
        }}
      />

      <AdminStack.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{
          title: "Manage Users",
        }}
      />
    </AdminStack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN TAB NAVIGATOR
|--------------------------------------------------------------------------
*/

const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  const { user, isAdmin } = useAuth();

  /*
   * Shared bottom-tab appearance.
   */
  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,

    tabBarActiveTintColor: colors.primary,

    tabBarInactiveTintColor: colors.textSecondary,

    tabBarHideOnKeyboard: true,

    tabBarShowLabel: true,

    tabBarLabelPosition: "below-icon",

    tabBarStyle: {
      height: 68,
      paddingTop: 8,
      paddingBottom: 8,
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      elevation: 10,
    },

    tabBarItemStyle: {
      paddingVertical: 2,
    },

    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "600",
    },
  };

  return (
    <Tab.Navigator initialRouteName="HomeTab" screenOptions={screenOptions}>
      {/*
       * HOME TAB
       */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Home" focused={focused} color={color} />
          ),

          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              icon="home-outline"
              activeIcon="home"
            />
          ),

          tabBarAccessibilityLabel: "Home tab",
        }}
      />

      {/*
       * SEARCH TAB
       */}
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Search" focused={focused} color={color} />
          ),

          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              icon="search-outline"
              activeIcon="search"
            />
          ),

          tabBarAccessibilityLabel: "Search items tab",
        }}
      />

      {/*
       * MY ITEMS TAB
       */}
      <Tab.Screen
        name="MyItemsTab"
        component={MyItemsScreen}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="My Items" focused={focused} color={color} />
          ),

          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              icon="cube-outline"
              activeIcon="cube"
            />
          ),

          tabBarAccessibilityLabel: "My reported items tab",
        }}
      />

      {/*
       * MY CLAIMS TAB
       */}
      <Tab.Screen
        name="MyClaimsTab"
        component={MyClaimsScreen}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="My Claims" focused={focused} color={color} />
          ),

          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              icon="document-text-outline"
              activeIcon="document-text"
            />
          ),

          tabBarAccessibilityLabel: "My claims tab",
        }}
      />

      {/*
       * PROFILE TAB
       */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Profile" focused={focused} color={color} />
          ),

          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              icon="person-circle-outline"
              activeIcon="person-circle"
            />
          ),

          tabBarAccessibilityLabel: "Profile tab",
        }}
      />

      {/*
       * ADMIN TAB
       *
       * Only administrators should see this tab.
       */}
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminNavigator}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <TabLabel label="Admin" focused={focused} color={color} />
            ),

            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                focused={focused}
                color={color}
                size={size}
                icon="shield-checkmark-outline"
                activeIcon="shield-checkmark"
              />
            ),

            tabBarAccessibilityLabel: "Administrator tab",
          }}
        />
      )}
    </Tab.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    height: 28,
  },

  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },

  tabLabel: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
});

export default MainTabNavigator;
