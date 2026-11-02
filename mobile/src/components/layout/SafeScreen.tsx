import React, { ReactNode } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  StatusBar,
  StatusBarStyle,
} from 'react-native';

import {
  SafeAreaView,
  Edge,
} from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: ReactNode;

  backgroundColor?: string;

  edges?: Edge[];

  statusBarStyle?: StatusBarStyle;

  statusBarBackgroundColor?: string;

  translucentStatusBar?: boolean;

  padding?: number;

  horizontalPadding?: number;

  verticalPadding?: number;

  keyboardAvoiding?: boolean;

  keyboardVerticalOffset?: number;

  centerContent?: boolean;

  containerStyle?: ViewStyle;

  contentStyle?: ViewStyle;

  includeBottomSafeArea?: boolean;
}

const SafeScreen: React.FC<SafeScreenProps> = ({
  children,

  backgroundColor = '#F8FAFC',

  edges,

  statusBarStyle = 'dark-content',

  statusBarBackgroundColor,

  translucentStatusBar = false,

  padding = 0,

  horizontalPadding = 20,

  verticalPadding = 16,

  keyboardAvoiding = false,

  keyboardVerticalOffset = 0,

  centerContent = false,

  containerStyle,

  contentStyle,

  includeBottomSafeArea = true,
}) => {
  const safeEdges: Edge[] =
    edges ||
    (includeBottomSafeArea
      ? ['top', 'bottom', 'left', 'right']
      : ['top', 'left', 'right']);

  const contentPadding = padding > 0
    ? padding
    : undefined;

  const contentStyles: ViewStyle = {
    flex: 1,
    padding: contentPadding,
    paddingHorizontal:
      contentPadding ?? horizontalPadding,
    paddingVertical:
      contentPadding ?? verticalPadding,
    justifyContent: centerContent
      ? 'center'
      : undefined,
  };

  const content = (
    <View
      style={[
        styles.content,
        contentStyles,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View
      style={[
        styles.root,
        { backgroundColor },
        containerStyle,
      ]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={
          statusBarBackgroundColor || backgroundColor
        }
        translucent={translucentStatusBar}
      />

      <SafeAreaView
        edges={safeEdges}
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
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </SafeAreaView>
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
});

export default SafeScreen;