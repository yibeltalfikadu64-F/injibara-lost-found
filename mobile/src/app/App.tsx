import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";

// Providers
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { AuthProvider } from "./providers/AuthProvider";

// Navigation
import RootNavigator from "./RootNavigator";

// Theme
import { colors } from "../theme/colors";

// Keep the native splash screen visible until app initialization finishes.
void SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const prepareApp = async (): Promise<void> => {
      try {
        // Load custom Ethiopic fonts.
        await Font.loadAsync({
          "NotoSansEthiopic-Regular": require("../../assets/fonts/NotoSansEthiopic-Regular.ttf"),
          "NotoSansEthiopic-Bold": require("../../assets/fonts/NotoSansEthiopic-Bold.ttf"),
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load custom fonts.";

        console.warn("Font loading warning:", message);

        if (mounted) {
          setFontError(message);
        }
      } finally {
        if (mounted) {
          setAppIsReady(true);
        }
      }
    };

    void prepareApp();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (appIsReady) {
      void SplashScreen.hideAsync().catch((error: unknown) => {
        console.warn("Unable to hide splash screen:", error);
      });
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingTitle}>Injibara Lost & Found</Text>

        <Text style={styles.loadingText}>Preparing your application...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <StatusBar
                  style="light"
                  backgroundColor={colors.primary}
                  translucent={false}
                />

                {fontError ? (
                  <View style={styles.fontWarning} accessibilityRole="alert">
                    <Text style={styles.fontWarningText}>
                      Custom fonts could not be loaded. The application will
                      continue using system fonts.
                    </Text>
                  </View>
                ) : null}

                <RootNavigator />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
  },

  loadingTitle: {
    marginTop: 24,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.9,
  },

  fontWarning: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF3CD",
  },

  fontWarningText: {
    color: "#856404",
    fontSize: 12,
    textAlign: "center",
  },
});

export default App;
