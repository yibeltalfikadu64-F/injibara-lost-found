import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Navigation
import AuthNavigator from "../navigation/AuthNavigator";
import MainTabNavigator from "../navigation/MainTabNavigator";

// Types
import type { RootStackParamList } from "../navigation/types";

// Authentication
import { useAuthStore } from "../store/authStore";

// Theme
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.secondary,
  },
};

const RootNavigator: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    let mounted = true;

    const initializeAuthentication = async (): Promise<void> => {
      try {
        await loadUser();

        if (mounted) {
          setInitializationError(null);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to initialize authentication.";

        console.error("Authentication initialization error:", message);

        if (mounted) {
          setInitializationError(message);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    void initializeAuthentication();

    return () => {
      mounted = false;
    };
  }, [loadUser]);

  if (isInitializing || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingTitle}>Injibara Lost & Found</Text>

        <Text style={styles.loadingText}>Checking your account...</Text>
      </View>
    );
  }

  if (initializationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization problem</Text>

        <Text style={styles.errorMessage}>{initializationError}</Text>

        <Text style={styles.errorHint}>
          Please restart the application or check your connection.
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.background,
  },

  loadingTitle: {
    marginTop: 20,
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
  },

  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: colors.background,
  },

  errorTitle: {
    marginBottom: 12,
    color: colors.error,
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },

  errorMessage: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  errorHint: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default RootNavigator;
