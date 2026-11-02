import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { AppState, AppStateStatus, Platform } from "react-native";

// Configure React Query network detection.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(
      Boolean(state.isConnected) && state.isInternetReachable !== false,
    );
  });
});

// Configure application focus detection.
focusManager.setEventListener((setFocused) => {
  if (Platform.OS !== "web") {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        setFocused(status === "active");
      },
    );

    return () => subscription.remove();
  }

  return undefined;
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 2,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
