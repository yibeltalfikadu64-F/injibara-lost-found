import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type Theme,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useAuth } from "../app/providers/AuthProvider";
import { useTheme } from "../app/providers/ThemeProvider";

import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

import type { UserRole } from "../app/providers/AuthProvider";

/*
|--------------------------------------------------------------------------
| ROOT STACK PARAMETER LIST
|--------------------------------------------------------------------------
|
| Defines the routes available in the application's root navigator.
|
*/

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Unauthorized: undefined;
  NotFound: undefined;
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator<RootStackParamList>();

/*
|--------------------------------------------------------------------------
| ROLE CONFIGURATION
|--------------------------------------------------------------------------
*/

const ROLE_HOME_LABELS: Record<UserRole, string> = {
  STUDENT: "Student Dashboard",
  STAFF: "Staff Dashboard",
  SECURITY: "Security Dashboard",
  ADMIN: "Administrator Dashboard",
};

/*
|--------------------------------------------------------------------------
| LOADING SCREEN
|--------------------------------------------------------------------------
*/

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Preparing your application...",
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.loadingContainer, { backgroundColor: colors.background }]}
    >
      <View style={[styles.loadingLogo, { backgroundColor: colors.primary }]}>
        <Text style={styles.loadingLogoText}>IF</Text>
      </View>

      <Text style={[styles.loadingTitle, { color: colors.text }]}>
        Injibara Lost & Found
      </Text>

      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loadingIndicator}
      />

      <Text style={[styles.loadingMessage, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| UNAUTHORIZED SCREEN
|--------------------------------------------------------------------------
*/

const UnauthorizedScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.messageContainer, { backgroundColor: colors.background }]}
    >
      <Text style={styles.messageIcon}>🔒</Text>

      <Text style={[styles.messageTitle, { color: colors.text }]}>
        Access Restricted
      </Text>

      <Text
        style={[styles.messageDescription, { color: colors.textSecondary }]}
      >
        Your account does not have permission to access this section of the
        application.
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| NOT FOUND SCREEN
|--------------------------------------------------------------------------
*/

const NotFoundScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.messageContainer, { backgroundColor: colors.background }]}
    >
      <Text style={styles.messageIcon}>🔍</Text>

      <Text style={[styles.messageTitle, { color: colors.text }]}>
        Page Not Found
      </Text>

      <Text
        style={[styles.messageDescription, { color: colors.textSecondary }]}
      >
        The page you are looking for does not exist.
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| NAVIGATION THEME
|--------------------------------------------------------------------------
*/

const buildNavigationTheme = (
  isDark: boolean,
  colors: {
    background: string;
    text: string;
    primary: string;
    border: string;
    card: string;
    textSecondary: string;
  },
): Theme => {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
};

/*
|--------------------------------------------------------------------------
| ROOT NAVIGATOR
|--------------------------------------------------------------------------
*/

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  const { colors, isDark } = useTheme();

  const [navigationReady, setNavigationReady] = useState(false);

  /*
   * Wait until the navigation container has mounted.
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setNavigationReady(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * Create the navigation theme from the current app theme.
   */
  const navigationTheme = React.useMemo(
    () => buildNavigationTheme(isDark, colors),
    [isDark, colors],
  );

  /*
   * Authentication is still being restored.
   *
   * Do not show login screens before the session restoration
   * process has completed.
   */
  if (isLoading || !navigationReady) {
    return <LoadingScreen />;
  }

  /*
   * Validate the current user's role.
   */
  const validRoles: UserRole[] = ["STUDENT", "STAFF", "SECURITY", "ADMIN"];

  const hasValidRole = user !== null && validRoles.includes(user.role);

  /*
   * A logged-in user without a supported role should not
   * automatically enter protected screens.
   */
  if (isAuthenticated && !hasValidRole) {
    return <UnauthorizedScreen />;
  }

  /*
   * Configure navigation behavior.
   */
  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: "fade",
    contentStyle: {
      backgroundColor: colors.background,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={screenOptions}
        initialRouteName={isAuthenticated ? "Main" : "Auth"}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animation: "fade",
              gestureEnabled: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{
              animation: "fade",
              gestureEnabled: false,
              title: user ? ROLE_HOME_LABELS[user.role] : "Dashboard",
            }}
          />
        )}

        <Stack.Screen
          name="Unauthorized"
          component={UnauthorizedScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingLogo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  loadingLogoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 1,
  },

  loadingTitle: {
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  loadingIndicator: {
    marginTop: 28,
    marginBottom: 15,
  },

  loadingMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  messageIcon: {
    fontSize: 55,
    marginBottom: 18,
  },

  messageTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  messageDescription: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
});

export default RootNavigator;
