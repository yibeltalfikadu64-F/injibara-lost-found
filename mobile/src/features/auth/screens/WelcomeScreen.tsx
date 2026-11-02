import React from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import SafeScreen from "../../../components/layout/SafeScreen";

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#172033",
  secondary: "#64748B",
  border: "#E2E8F0",
  lightBlue: "#EFF6FF",
};

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <SafeScreen
      backgroundColor={COLORS.background}
      statusBarStyle="dark-content"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>IU</Text>
            </View>

            <View>
              <Text style={styles.brandTitle}>Injibara University</Text>

              <Text style={styles.brandSubtitle}>Campus Lost & Found</Text>
            </View>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>COMMUNITY</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.illustration}>
            <View style={styles.illustrationCircle}>
              <Text style={styles.illustrationEmoji}>🔎</Text>
            </View>

            <View style={styles.floatingCardOne}>
              <Text style={styles.floatingEmoji}>🎒</Text>
              <Text style={styles.floatingText}>Found</Text>
            </View>

            <View style={styles.floatingCardTwo}>
              <Text style={styles.floatingEmoji}>🔑</Text>
              <Text style={styles.floatingText}>Lost</Text>
            </View>

            <View style={styles.smallDecoration} />
          </View>

          <Text style={styles.heroTitle}>
            Lost something?
            {"\n"}
            <Text style={styles.highlight}>Find it here.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            A smarter way for Injibara University students and staff to report
            lost belongings, discover found items, and safely reconnect with
            their owners.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconBlue}>
              <Text style={styles.featureEmoji}>📢</Text>
            </View>

            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Report lost or found items
              </Text>

              <Text style={styles.featureDescription}>
                Share item details and photos with the campus community.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconGreen}>
              <Text style={styles.featureEmoji}>🤝</Text>
            </View>

            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Reconnect with owners</Text>

              <Text style={styles.featureDescription}>
                Submit claims and verify item ownership through a secure
                process.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconOrange}>
              <Text style={styles.featureEmoji}>🛡️</Text>
            </View>

            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Safe campus handover</Text>

              <Text style={styles.featureDescription}>
                Help keep the lost-and-found process organized and trustworthy.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>

            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{" "}
              <Text style={styles.loginText}>Sign In</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Made for the Injibara University community
        </Text>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  brandIconText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
  },

  brandTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },

  brandSubtitle: {
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 3,
  },

  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.lightBlue,
  },

  headerBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.6,
  },

  hero: {
    alignItems: "center",
    marginTop: 28,
  },

  illustration: {
    height: 190,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  illustrationCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  illustrationEmoji: {
    fontSize: 70,
  },

  floatingCardOne: {
    position: "absolute",
    right: 20,
    top: 25,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: "center",
    elevation: 4,
  },

  floatingCardTwo: {
    position: "absolute",
    left: 18,
    bottom: 22,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: "center",
    elevation: 4,
  },

  floatingEmoji: {
    fontSize: 22,
  },

  floatingText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },

  smallDecoration: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F59E0B",
    top: 20,
    left: 65,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 39,
    marginTop: 12,
  },

  highlight: {
    color: COLORS.primary,
  },

  heroDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 5,
  },

  features: {
    marginTop: 27,
    gap: 12,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  featureIconBlue: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconGreen: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  featureIconOrange: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
  },

  featureEmoji: {
    fontSize: 21,
  },

  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  featureTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  featureDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  actions: {
    marginTop: 25,
    gap: 13,
  },

  primaryButton: {
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 21,
    marginLeft: 12,
  },

  secondaryButton: {
    minHeight: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: COLORS.secondary,
    fontSize: 12,
  },

  loginText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  footer: {
    color: COLORS.secondary,
    textAlign: "center",
    fontSize: 10,
    marginTop: 18,
  },
});

export default WelcomeScreen;
