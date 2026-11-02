
import React from 'react';

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { useTheme } from '../app/providers/ThemeProvider';

import CreateItemScreen from '../screens/items/CreateItemScreen';
import ItemDetailsScreen from '../screens/items/ItemDetailsScreen';
import MyItemsScreen from '../screens/items/MyItemsScreen';

/*
|--------------------------------------------------------------------------
| REPORT STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type ReportStackParamList = {
  MyReports: undefined;

  CreateLostReport: undefined;

  CreateFoundReport: undefined;

  EditReport: {
    itemId: string;
  };

  ReportDetails: {
    itemId: string;
    itemTitle?: string;
  };
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack =
  createNativeStackNavigator<ReportStackParamList>();

/*
|--------------------------------------------------------------------------
| REPORT STACK NAVIGATOR
|--------------------------------------------------------------------------
*/

const ReportStack: React.FC = () => {
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
      initialRouteName="MyReports"
      screenOptions={screenOptions}
    >
      {/*
       * MY REPORTS
       *
       * Displays items reported by the current user.
       */}
      <Stack.Screen
        name="MyReports"
        component={MyItemsScreen}
        options={{
          title: 'My Reports',
        }}
      />

      {/*
       * CREATE LOST REPORT
       */}
      <Stack.Screen
        name="CreateLostReport"
        component={CreateItemScreen}
        options={{
          title: 'Report Lost Item',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/*
       * CREATE FOUND REPORT
       */}
      <Stack.Screen
        name="CreateFoundReport"
        component={CreateItemScreen}
        options={{
          title: 'Report Found Item',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/*
       * EDIT REPORT
       *
       * Uses CreateItemScreen as a placeholder until
       * a dedicated EditItemScreen is implemented.
       */}
      <Stack.Screen
        name="EditReport"
        component={CreateItemScreen}
        options={{
          title: 'Edit Report',
        }}
      />

      {/*
       * REPORT DETAILS
       */}
      <Stack.Screen
        name="ReportDetails"
        component={ItemDetailsScreen}
        options={({ route }) => ({
          title: route.params.itemTitle || 'Report Details',
        })}
      />
    </Stack.Navigator>
  );
};

export default ReportStack;
