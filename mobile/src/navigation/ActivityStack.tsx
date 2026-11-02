
import React from 'react';

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { useTheme } from '../app/providers/ThemeProvider';

import MyClaimsScreen from '../screens/claims/MyClaimsScreen';
import ClaimDetailsScreen from '../screens/claims/ClaimDetailsScreen';
import CreateClaimScreen from '../screens/claims/CreateClaimScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

/*
|--------------------------------------------------------------------------
| ACTIVITY STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type ActivityStackParamList = {
  Activity: undefined;

  MyClaims: undefined;

  CreateClaim: {
    itemId: string;
    itemTitle?: string;
  };

  ClaimDetails: {
    claimId: string;
  };

  Notifications: undefined;
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack =
  createNativeStackNavigator<ActivityStackParamList>();

/*
|--------------------------------------------------------------------------
| ACTIVITY STACK NAVIGATOR
|--------------------------------------------------------------------------
*/

const ActivityStack: React.FC = () => {
  const { colors } = useTheme();

  const screenOptions: NativeStackNavigationOptions = {
    headerShown: true,

    headerStyle: {
      backgroundColor: colors.card,
    },

    headerTintColor: colors.text,

    headerTitleStyle: {
      fontSize: 17,
      fontWeight: '800',
    },

    headerShadowVisible: false,

    contentStyle: {
      backgroundColor: colors.background,
    },

    animation: 'slide_from_right',

    gestureEnabled: true,
  };

  return (
    <Stack.Navigator
      initialRouteName="Activity"
      screenOptions={screenOptions}
    >
      {/*
       * ACTIVITY HOME
       *
       * MyClaimsScreen is used as the initial activity
       * screen until a dedicated ActivityScreen is created.
       */}
      <Stack.Screen
        name="Activity"
        component={MyClaimsScreen}
        options={{
          title: 'My Activity',
        }}
      />

      {/*
       * MY CLAIMS
       */}
      <Stack.Screen
        name="MyClaims"
        component={MyClaimsScreen}
        options={{
          title: 'My Claims',
        }}
      />

      {/*
       * CREATE CLAIM
       */}
      <Stack.Screen
        name="CreateClaim"
        component={CreateClaimScreen}
        options={{
          title: 'Submit Ownership Claim',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/*
       * CLAIM DETAILS
       */}
      <Stack.Screen
        name="ClaimDetails"
        component={ClaimDetailsScreen}
        options={{
          title: 'Claim Details',
        }}
      />

      {/*
       * NOTIFICATIONS
       */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
};

export default ActivityStack;
