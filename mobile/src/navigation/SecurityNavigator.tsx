import React from "react";

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../app/providers/ThemeProvider";
import { useAuth } from "../app/providers/AuthProvider";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManageItemsScreen from "../screens/admin/ManageItemsScreen";
import ManageClaimsScreen from "../screens/admin/ManageClaimsScreen";

/*
|--------------------------------------------------------------------------
| SECURITY STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type SecurityStackParamList = {
  SecurityDashboard: undefined;

  FoundItems: undefined;

  ItemVerification: {
    itemId: string;
  };

  ClaimVerification: {
    claimId: string;
  };

  Handover: {
    itemId: string;
    claimId: string;
  };

  SecurityProfile: undefined;
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator<SecurityStackParamList>();

/*
|--------------------------------------------------------------------------
| SECURITY DASHBOARD PLACEHOLDER
|--------------------------------------------------------------------------
|
| Replace this placeholder with a dedicated SecurityDashboardScreen.
|
*/

const SecurityDashboardPlaceholder: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>🛡️</Text>

      <Text style={[styles.title, { color: colors.text }]}>
        Security Dashboard
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Welcome, {user?.fullName ?? "Security Officer"}.
      </Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Manage found items, review ownership verification requests, and
        coordinate secure item handovers.
      </Text>
    </View>
  );
};

/*
|--------------------------------------------------------------------------
| SECURITY NAVIGATOR
|--------------------------------------------------------------------------
*/

const SecurityNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { user, isSecurity } = useAuth();

  /*
   * Prevent unauthorized roles from entering this navigator.
   *
   * This is a UI-level restriction only. Backend APIs must
   * independently enforce security permissions.
   */
  if (!isSecurity && user?.role !== "ADMIN") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.icon}>🔒</Text>

        <Text style={[styles.title, { color: colors.text }]}>
          Access Restricted
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Only authorized security personnel can access these features.
        </Text>
      </View>
    );
  }

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
  };

  return (
    <Stack.Navigator
      initialRouteName="SecurityDashboard"
      screenOptions={screenOptions}
    >
      {/*
       * SECURITY DASHBOARD
       */}
      <Stack.Screen
        name="SecurityDashboard"
        component={SecurityDashboardPlaceholder}
        options={{
          title: "Security Dashboard",
        }}
      />

      {/*
       * FOUND ITEMS
       *
       * ManageItemsScreen is a temporary reuse.
       * A dedicated FoundItemsScreen is recommended.
       */}
      <Stack.Screen
        name="FoundItems"
        component={ManageItemsScreen}
        options={{
          title: "Found Items",
        }}
      />

      {/*
       * ITEM VERIFICATION
       *
       * ManageClaimsScreen is a temporary reuse.
       * A dedicated verification screen is recommended.
       */}
      <Stack.Screen
        name="ItemVerification"
        component={ManageClaimsScreen}
        options={{
          title: "Item Verification",
        }}
      />

      {/*
       * CLAIM VERIFICATION
       */}
      <Stack.Screen
        name="ClaimVerification"
        component={ManageClaimsScreen}
        options={{
          title: "Verify Ownership Claim",
        }}
      />

      {/*
       * HANDOVER
       *
       * A dedicated handover screen should be implemented
       * before using this workflow in production.
       */}
      <Stack.Screen
        name="Handover"
        component={ManageClaimsScreen}
        options={{
          title: "Item Handover",
        }}
      />

      {/*
       * SECURITY PROFILE
       */}
      <Stack.Screen
        name="SecurityProfile"
        component={AdminDashboardScreen}
        options={{
          title: "Security Profile",
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  icon: {
    fontSize: 58,
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
  },
});

export default SecurityNavigator;
