import React from "react";

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useTheme } from "../app/providers/ThemeProvider";

import HomeScreen from "../screens/home/HomeScreen";
import ItemDetailsScreen from "../screens/items/ItemDetailsScreen";
import CreateItemScreen from "../screens/items/CreateItemScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";

/*
|--------------------------------------------------------------------------
| HOME STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type HomeStackParamList = {
  Home: undefined;

  ItemDetails: {
    itemId: string;
    itemTitle?: string;
  };

  CreateItem:
    | {
        itemType?: "LOST" | "FOUND";
      }
    | undefined;

  Notifications: undefined;
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator<HomeStackParamList>();

/*
|--------------------------------------------------------------------------
| HOME STACK NAVIGATOR
|--------------------------------------------------------------------------
*/

const HomeStack: React.FC = () => {
  const { colors } = useTheme();

  /*
   * Shared stack screen configuration.
   */
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

    headerBackTitle: "Back",

    contentStyle: {
      backgroundColor: colors.background,
    },

    animation: "slide_from_right",

    gestureEnabled: true,
  };

  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      {/*
       * HOME SCREEN
       *
       * Main dashboard of the application.
       */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Injibara Lost & Found",
          headerShown: false,
        }}
      />

      {/*
       * ITEM DETAILS
       *
       * Receives itemId as a navigation parameter.
       */}
      <Stack.Screen
        name="ItemDetails"
        component={ItemDetailsScreen}
        options={({ route }) => ({
          title: route.params.itemTitle || "Item Details",
          headerShown: true,
        })}
      />

      {/*
       * CREATE ITEM
       *
       * Users can report lost or found items.
       */}
      <Stack.Screen
        name="CreateItem"
        component={CreateItemScreen}
        options={({ route }) => ({
          title:
            route.params?.itemType === "FOUND"
              ? "Report Found Item"
              : "Report Lost Item",
          presentation: "modal",
          animation: "slide_from_bottom",
        })}
      />

      {/*
       * NOTIFICATIONS
       */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
