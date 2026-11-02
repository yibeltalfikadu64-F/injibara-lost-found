import React from "react";

import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useTheme } from "../app/providers/ThemeProvider";

/*
|--------------------------------------------------------------------------
| AUTH SCREEN IMPORTS
|--------------------------------------------------------------------------
|
| These screens should exist in:
| mobile/src/screens/auth/
|
*/

import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

/*
|--------------------------------------------------------------------------
| AUTH STACK PARAMETER LIST
|--------------------------------------------------------------------------
*/

export type AuthStackParamList = {
  Welcome: undefined;

  Login:
    | {
        email?: string;
      }
    | undefined;

  Register: undefined;

  ForgotPassword:
    | {
        email?: string;
      }
    | undefined;

  ResetPassword: {
    token: string;
  };

  VerifyEmail: {
    email: string;
  };
};

/*
|--------------------------------------------------------------------------
| STACK INITIALIZATION
|--------------------------------------------------------------------------
*/

const Stack = createNativeStackNavigator<AuthStackParamList>();

/*
|--------------------------------------------------------------------------
| AUTH NAVIGATOR
|--------------------------------------------------------------------------
*/

const AuthNavigator: React.FC = () => {
  const { colors } = useTheme();

  /*
   * Shared screen settings.
   */
  const screenOptions: NativeStackNavigationOptions = {
    headerShown: false,

    animation: "slide_from_right",

    animationDuration: 250,

    gestureEnabled: true,

    contentStyle: {
      backgroundColor: colors.background,
    },

    navigationBarColor: colors.background,

    statusBarColor: colors.background,

    statusBarStyle: "dark",
  };

  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={screenOptions}>
      {/*
       * WELCOME SCREEN
       *
       * Entry point for users who are not authenticated.
       */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          animation: "fade",
          gestureEnabled: false,
        }}
      />

      {/*
       * LOGIN SCREEN
       */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Login",
          animation: "slide_from_right",
        }}
      />

      {/*
       * REGISTRATION SCREEN
       */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Create Account",
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
