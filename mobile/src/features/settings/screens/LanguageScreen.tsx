// mobile/src/features/settings/screens/LanguageScreen.tsx

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import styles, { COLORS } from "../styles/SettingsScreen.styles";

const LANGUAGE_KEY = "@campus_lost_found_language";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    description: "Use English throughout the application",
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    flag: "🇪🇹",
    description: "ትግበራውን በአማርኛ ይጠቀሙ",
  },
  {
    code: "om",
    name: "Afaan Oromo",
    nativeName: "Afaan Oromoo",
    flag: "🇪🇹",
    description: "Afaan Oromoo keessatti fayyadami",
  },
  {
    code: "aw",
    name: "Awi",
    nativeName: "Awi",
    flag: "🇪🇹",
    description: "Use the Awi language",
  },
];

interface LanguageNavigation {
  goBack: () => void;
}

interface LanguageScreenProps {
  navigation: LanguageNavigation;
}

const LanguageScreen: React.FC<LanguageScreenProps> = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  // ----------------------------------------------------
  // Load saved language
  // ----------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);

        if (mounted && saved) {
          setSelectedLanguage(saved);
        }
      } catch {
        Alert.alert("Error", "Unable to load your language preference.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------
  // Select language
  // ----------------------------------------------------

  const handleSelectLanguage = useCallback(
    async (languageCode: string) => {
      if (languageCode === selectedLanguage || isSaving) {
        return;
      }

      setIsSaving(true);

      try {
        await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);

        setSelectedLanguage(languageCode);

        Alert.alert(
          "Language saved",
          "Your language preference has been saved. Full application translation requires the corresponding translation resources to be integrated.",
          [
            {
              text: "OK",
              onPress: navigation.goBack,
            },
          ],
        );
      } catch {
        Alert.alert(
          "Unable to save",
          "Your language preference could not be saved. Please try again.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [selectedLanguage, isSaving, navigation],
  );

  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Loading languages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.subHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={21} color={COLORS.text} />
        </Pressable>

        <View style={styles.subHeaderContent}>
          <Text style={styles.subHeaderTitle}>Language</Text>

          <Text style={styles.subHeaderSubtitle}>
            Select your preferred language
          </Text>
        </View>

        <Ionicons name="language-outline" size={23} color={COLORS.primary} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="globe-outline" size={23} color={COLORS.primary} />
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>Choose a Language</Text>

            <Text style={styles.introDescription}>
              Select the language you prefer to use when interacting with Campus
              Lost & Found.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Languages</Text>

          <Text style={styles.sectionDescription}>
            Select one language to save your preference.
          </Text>

          <View style={styles.languageCard}>
            {LANGUAGES.map((language, index) => {
              const isSelected = selectedLanguage === language.code;

              const isLast = index === LANGUAGES.length - 1;

              return (
                <Pressable
                  key={language.code}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: isSelected,
                    disabled: isSaving,
                  }}
                  disabled={isSaving}
                  onPress={() => handleSelectLanguage(language.code)}
                  style={({ pressed }) => [
                    styles.languageOption,
                    !isLast && styles.languageOptionBorder,
                    isSelected && styles.languageSelected,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={styles.languageFlag}>
                    <Text style={styles.languageFlagText}>{language.flag}</Text>
                  </View>

                  <View style={styles.languageContent}>
                    <Text style={styles.languageName}>{language.name}</Text>

                    <Text style={styles.languageNativeName}>
                      {language.nativeName}
                    </Text>

                    <Text style={styles.helperText}>
                      {language.description}
                    </Text>
                  </View>

                  {isSelected ? (
                    <View style={styles.languageCheck}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={COLORS.white}
                      />
                    </View>
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={22}
                      color={COLORS.border}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {isSaving ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
              gap: 10,
            }}
          >
            <ActivityIndicator color={COLORS.primary} />

            <Text style={styles.loadingText}>
              Saving language preference...
            </Text>
          </View>
        ) : null}

        <Text style={styles.footerText}>
          Note: Saving a language preference does not automatically translate
          the application. Connect your i18n translation resources to apply the
          selected language throughout the app.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageScreen;
