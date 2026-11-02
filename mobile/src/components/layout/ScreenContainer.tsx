import React, { ReactNode } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  ScrollViewProps,
  StatusBar,
} from 'react-native';

import {
  SafeAreaView,
  Edge,
} from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;

  backgroundColor?: string;

  padding?: number;
  horizontalPadding?: number;
  verticalPadding?: number;

  scrollable?: boolean;

  loading?: boolean;
  refreshing?: boolean;

  onRefresh?: () => void;

  safeArea?: boolean;

  edges?: Edge[];

  keyboardAvoiding?: boolean;

  keyboardVerticalOffset?: number;

  showsVerticalScrollIndicator?: boolean;

  contentContainerStyle?: ViewStyle;

  containerStyle?: ViewStyle;

  header?: ReactNode;
  footer?: ReactNode;

  centered?: boolean;

  statusBarColor?: string;

  statusBarStyle?: 'light-content' | 'dark-content';

  refreshColor?: string;

  refreshBackgroundColor?: string;

  testID?: string;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,

  backgroundColor = '#F8FAFC',

  padding = 0,
  horizontalPadding = 20,
  verticalPadding = 16,

  scrollable = false,

  loading = false,
  refreshing = false,

  onRefresh,

  safeArea = true,

  edges = ['top', 'left', 'right'],

  keyboardAvoiding = true,

  keyboardVerticalOffset = 0,

  showsVerticalScrollIndicator = false,

  contentContainerStyle,

  containerStyle,

  header,
  footer,

  centered = false,

  statusBarColor,
  statusBarStyle = 'dark-content',

  refreshColor = '#2563EB',

  refreshBackgroundColor = '#FFFFFF',

  testID,
}) => {
  const resolvedPadding =
    padding > 0 ? padding : undefined;

  const contentStyles: ViewStyle = {
    padding: resolvedPadding,
    paddingHorizontal: resolvedPadding ?? horizontalPadding,
    paddingVertical: resolvedPadding ?? verticalPadding,
    flexGrow: scrollable ? 1 : undefined,
    justifyContent: centered ? 'center' : undefined,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={refreshColor}
          />
        </View>
      );
    }

    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            contentStyles,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={
            showsVerticalScrollIndicator
          }
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={refreshColor}
                colors={[refreshColor]}
                progressBackgroundColor={
                  refreshBackgroundColor
                }
              />
            ) : undefined
          }
          testID={testID}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View
        style={[
          styles.content,
          contentStyles,
          contentContainerStyle,
        ]}
        testID={testID}
      >
        {children}
      </View>
    );
  };

  const mainContent = (
    <>
      {header ? <View>{header}</View> : null}

      {renderContent()}

      {footer ? <View>{footer}</View> : null}
    </>
  );

  return (
    <View
      style={[
        styles.root,
        { backgroundColor },
        containerStyle,
      ]}
    >
      {statusBarColor ? (
        <StatusBar
          backgroundColor={statusBarColor}
          barStyle={statusBarStyle}
        />
      ) : null}

      {safeArea ? (
        <SafeAreaView
          edges={edges}
          style={[
            styles.safeArea,
            { backgroundColor },
          ]}
        >
          {keyboardAvoiding ? (
            <KeyboardAvoidingView
              style={styles.keyboardContainer}
              behavior={
                Platform.OS === 'ios'
                  ? 'padding'
                  : undefined
              }
              keyboardVerticalOffset={
                keyboardVerticalOffset
              }
            >
              {mainContent}
            </KeyboardAvoidingView>
          ) : (
            mainContent
          )}
        </SafeAreaView>
      ) : keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {mainContent}
        </KeyboardAvoidingView>
      ) : (
        mainContent
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
});

export default ScreenContainer;