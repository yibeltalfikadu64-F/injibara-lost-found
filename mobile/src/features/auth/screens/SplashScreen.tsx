import React, { useEffect } from "react";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import SafeScreen from "../../../components/layout/SafeScreen";
import { useAuth } from "../../../app/providers/AuthProvider";

const COLORS = {
  primary: "#2563EB",
  secondary: "#0F172A",
  background: "#F8FAFC",
  white: "#FFFFFF",
  muted: "#64748B",
};

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: isAuthenticated ? "Main" : "Welcome",
          },
        ],
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <SafeScreen
      backgroundColor={COLORS.primary}
      statusBarStyle="light-content"
      statusBarBackgroundColor={COLORS.primary}
      centerContent
    >
      <View style={styles.container}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>IU</Text>
        </View>

        <Text style={styles.appName}>Campus Lost & Found</Text>

        <Text style={styles.universityName}>INJIBARA UNIVERSITY</Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Helping our campus community reconnect with their lost belongings.
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />

          <Text style={styles.loadingText}>Preparing your experience...</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure • Simple • Community</Text>

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    elevation: 8,
  },

  logoIcon: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: 2,
  },

  appName: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  universityName: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginTop: 10,
  },

  descriptionContainer: {
    maxWidth: 290,
    marginTop: 22,
  },

  description: {
    color: "#DBEAFE",
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
  },

  loadingContainer: {
    alignItems: "center",
    marginTop: 65,
  },

  loadingText: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 13,
  },

  footer: {
    position: "absolute",
    bottom: 25,
    alignItems: "center",
  },

  footerText: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "600",
  },

  version: {
    color: "#BFDBFE",
    fontSize: 10,
    marginTop: 8,
  },
});

export default SplashScreen;
