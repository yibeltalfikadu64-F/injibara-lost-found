import React from "react";

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useTheme } from "../app/providers/ThemeProvider";

import SearchScreen from "../screens/search/SearchScreen";
import ItemDetailsScreen from "../screens/items/ItemDetailsScreen";

/*
|--------------------------------------------------------------------------
| SEARCH STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type SearchStackParamList = {
  Search:
    | {
        initialQuery?: string;
        initialType?: "LOST" | "FOUND";
        categoryId?: string;
        locationId?: string;
      }
    | undefined;

  SearchResults: {
    query: string;
    type?: "LOST" | "FOUND";
    categoryId?: string;
    locationId?: string;
  };

  ItemDetails: {
    itemId: string;
    itemTitle?: string;
  };
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator<SearchStackParamList>();

/*
|--------------------------------------------------------------------------
| SEARCH STACK NAVIGATOR
|--------------------------------------------------------------------------
*/

const SearchStack: React.FC = () => {
  const { colors } = useTheme();

  /*
   * Shared navigation styles.
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

    contentStyle: {
      backgroundColor: colors.background,
    },

    animation: "slide_from_right",

    gestureEnabled: true,
  };

  return (
    <Stack.Navigator initialRouteName="Search" screenOptions={screenOptions}>
      {/*
       * SEARCH SCREEN
       *
       * Main search page.
       */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Search Items",
        }}
      />

      {/*
       * SEARCH RESULTS
       *
       * Displays filtered search results.
       *
       * This route requires a SearchResultsScreen component
       * before it can be registered.
       */}

      {/*
       * ITEM DETAILS
       *
       * Reuses the existing ItemDetailsScreen.
       */}
      <Stack.Screen
        name="ItemDetails"
        component={ItemDetailsScreen}
        options={({ route }) => ({
          title: route.params.itemTitle || "Item Details",
        })}
      />
    </Stack.Navigator>
  );
};

export default SearchStack;
