import React from "react";

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useTheme } from "../app/providers/ThemeProvider";

import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";

/*
|--------------------------------------------------------------------------
| PROFILE STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type ProfileStackParamList = {
  Profile: undefined;

  EditProfile: undefined;

  Settings: undefined;

  LanguageSettings: undefined;

  About: undefined;

  PrivacyPolicy: undefined;

  HelpSupport: undefined;
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator<ProfileStackParamList>();

/*
|--------------------------------------------------------------------------
| SETTINGS SCREEN
|--------------------------------------------------------------------------
|
| This lightweight screen is a temporary placeholder.
| Replace it with your dedicated settings screen when ready.
|
*/

import { StyleSheet, Text, View } from "react-native";

const SettingsPlaceholder: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.placeholderContainer,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={styles.placeholderIcon}>⚙️</Text>

      <Text style={[styles.placeholderTitle, { color: colors.text }]}>
        Application Settings
      </Text>

      <Text
        style={[styles.placeholderDescription, { color: colors.textSecondary }]}
      >
        Manage your application preferences, language, appearance, privacy, and
        notifications.
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| PROFILE STACK NAVIGATOR
|--------------------------------------------------------------------------
*/

const ProfileStack: React.FC = () => {
  const { colors } = useTheme();

  const screenOptions: NativeStackNavigationOptions = {
    headerShown: true,

    headerStyle: {
      backgroundColor: colors.card,
    },

    headerTintColor: colors.text,

    headerTitleStyle: {
      fontSize: 17,
      fontWeight: "800",
    },

    headerShadowVisible: false,

    contentStyle: {
      backgroundColor: colors.background,
    },

    animation: "slide_from_right",

    gestureEnabled: true,
  };

  return (
    <Stack.Navigator initialRouteName="Profile" screenOptions={screenOptions}>
      {/*
       * PROFILE
       */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "My Profile",
        }}
      />

      {/*
       * EDIT PROFILE
       */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "Edit Profile",
          presentation: "modal",
        }}
      />

      {/*
       * SETTINGS
       */}
      <Stack.Screen
        name="Settings"
        component={SettingsPlaceholder}
        options={{
          title: "Settings",
        }}
      />

      {/*
       * LANGUAGE SETTINGS
       *
       * Uses SettingsPlaceholder until a dedicated
       * language settings screen is created.
       */}
      <Stack.Screen
        name="LanguageSettings"
        component={SettingsPlaceholder}
        options={{
          title: "Language Settings",
        }}
      />

      {/*
       * ABOUT APPLICATION
       */}
      <Stack.Screen
        name="About"
        component={SettingsPlaceholder}
        options={{
          title: "About Injibara Lost & Found",
        }}
      />

      {/*
       * PRIVACY POLICY
       */}
      <Stack.Screen
        name="PrivacyPolicy"
        component={SettingsPlaceholder}
        options={{
          title: "Privacy Policy",
        }}
      />

      {/*
       * HELP AND SUPPORT
       */}
      <Stack.Screen
        name="HelpSupport"
        component={SettingsPlaceholder}
        options={{
          title: "Help & Support",
        }}
      />
    </Stack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  placeholderIcon: {
    fontSize: 55,
    marginBottom: 18,
  },

  placeholderTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },

  placeholderDescription: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
});

export default ProfileStack;
