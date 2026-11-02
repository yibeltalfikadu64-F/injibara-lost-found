import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@campus_lost_found_language';

export type LanguageCode = 'en' | 'am' | 'om' | 'aw';

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

const SUPPORTED_LANGUAGES: LanguageCode[] = ['en', 'am', 'om', 'aw'];

export const getLanguagePreference = async (): Promise<LanguageCode> => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (
    saved &&
    SUPPORTED_LANGUAGES.includes(saved as LanguageCode)
  ) {
    return saved as LanguageCode;
  }

  return DEFAULT_LANGUAGE;
};

export const saveLanguagePreference = async (
  language: LanguageCode,
): Promise<void> => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  await AsyncStorage.setItem(LANGUAGE_KEY, language);
};
