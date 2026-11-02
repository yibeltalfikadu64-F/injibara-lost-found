// mobile/src/store/languageStore.ts

import { create } from "zustand";

import { persist, createJSONStorage } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// TYPES
// ============================================================

export type LanguageCode = "en" | "am" | "om" | "awn";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export type TranslationDictionary = Record<string, string>;

export interface LanguageState {
  language: LanguageCode;

  availableLanguages: Language[];

  isChangingLanguage: boolean;

  setLanguage: (language: LanguageCode) => Promise<void>;

  setChangingLanguage: (loading: boolean) => void;

  getLanguage: () => LanguageCode;

  getLanguageDetails: () => Language;

  getAvailableLanguages: () => Language[];

  isRTL: () => boolean;

  translate: (key: string, fallback?: string) => string;

  resetLanguage: () => void;
}

// ============================================================
// LANGUAGE DEFINITIONS
// ============================================================

export const AVAILABLE_LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    isRTL: false,
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    flag: "🇪🇹",
    isRTL: false,
  },
  {
    code: "om",
    name: "Afaan Oromoo",
    nativeName: "Afaan Oromoo",
    flag: "🇪🇹",
    isRTL: false,
  },
  {
    code: "awn",
    name: "Awi",
    nativeName: "Awngi",
    flag: "🇪🇹",
    isRTL: false,
  },
];

// ============================================================
// TRANSLATION RESOURCES
// ============================================================

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  // ----------------------------------------------------------
  // ENGLISH
  // ----------------------------------------------------------

  en: {
    app_name: "Injibara Campus Lost & Found",

    welcome: "Welcome",
    welcome_back: "Welcome back",

    login: "Login",
    register: "Register",
    logout: "Logout",

    email: "Email address",
    password: "Password",
    confirm_password: "Confirm password",

    first_name: "First name",
    last_name: "Last name",

    home: "Home",
    search: "Search",
    items: "Items",
    claims: "Claims",
    reports: "Reports",
    profile: "Profile",
    settings: "Settings",

    lost_items: "Lost items",
    found_items: "Found items",

    report_lost: "Report lost item",
    report_found: "Report found item",

    item_title: "Item title",
    item_description: "Description",
    item_location: "Location",
    item_category: "Category",

    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    update: "Update",

    loading: "Loading...",
    success: "Success",
    error: "Error",
    retry: "Retry",

    no_items: "No items found",
    no_claims: "No claims found",
    no_reports: "No reports found",

    language: "Language",
    theme: "Theme",
    light_mode: "Light mode",
    dark_mode: "Dark mode",
    system_default: "System default",

    notifications: "Notifications",
    privacy: "Privacy",
    about: "About",
    help: "Help and support",

    online: "Online",
    offline: "Offline",
  },

  // ----------------------------------------------------------
  // AMHARIC
  // ----------------------------------------------------------

  am: {
    app_name: "የኢንጂባራ ካምፓስ የጠፉና የተገኙ ዕቃዎች",

    welcome: "እንኳን ደህና መጡ",
    welcome_back: "እንኳን ተመለሱ",

    login: "ግባ",
    register: "ተመዝገብ",
    logout: "ውጣ",

    email: "ኢሜይል አድራሻ",
    password: "የይለፍ ቃል",
    confirm_password: "የይለፍ ቃል ያረጋግጡ",

    first_name: "ስም",
    last_name: "የአባት ስም",

    home: "መነሻ",
    search: "ፈልግ",
    items: "ዕቃዎች",
    claims: "የይገባኛል ጥያቄዎች",
    reports: "ሪፖርቶች",
    profile: "መገለጫ",
    settings: "ቅንብሮች",

    lost_items: "የጠፉ ዕቃዎች",
    found_items: "የተገኙ ዕቃዎች",

    report_lost: "የጠፋ ዕቃ ሪፖርት አድርግ",
    report_found: "የተገኘ ዕቃ ሪፖርት አድርግ",

    item_title: "የዕቃው ስም",
    item_description: "መግለጫ",
    item_location: "ቦታ",
    item_category: "ምድብ",

    submit: "አስገባ",
    cancel: "ሰርዝ",
    save: "አስቀምጥ",
    delete: "አጥፋ",
    edit: "አስተካክል",
    update: "አዘምን",

    loading: "በመጫን ላይ...",
    success: "ተሳክቷል",
    error: "ስህተት",
    retry: "እንደገና ሞክር",

    no_items: "ምንም ዕቃ አልተገኘም",
    no_claims: "ምንም ጥያቄ አልተገኘም",
    no_reports: "ምንም ሪፖርት አልተገኘም",

    language: "ቋንቋ",
    theme: "ገጽታ",
    light_mode: "ቀላል ገጽታ",
    dark_mode: "ጨለማ ገጽታ",
    system_default: "የስርዓት ቅንብር",

    notifications: "ማሳወቂያዎች",
    privacy: "ግላዊነት",
    about: "ስለ መተግበሪያው",
    help: "እገዛ",

    online: "በመስመር ላይ",
    offline: "ከመስመር ውጭ",
  },

  // ----------------------------------------------------------
  // AFAAN OROMOO
  // ----------------------------------------------------------

  om: {
    app_name: "Injibara Campus Lost & Found",

    welcome: "Baga nagaan dhuftan",
    welcome_back: "Baga deebitan",

    login: "Seeni",
    register: "Galmaa’i",
    logout: "Ba’i",

    email: "Teessoo imeelii",
    password: "Jecha icciitii",
    confirm_password: "Jecha icciitii mirkaneessi",

    first_name: "Maqaa",
    last_name: "Maqaa abbaa",

    home: "Mana",
    search: "Barbaadi",
    items: "Meeshaalee",
    claims: "Iyyannoowwan",
    reports: "Gabaasawwan",
    profile: "Piroofaayilii",
    settings: "Qindaa’ina",

    lost_items: "Meeshaalee badan",
    found_items: "Meeshaalee argaman",

    report_lost: "Meeshaa bade gabaasi",
    report_found: "Meeshaa argame gabaasi",

    item_title: "Maqaa meeshaa",
    item_description: "Ibsa",
    item_location: "Bakka",
    item_category: "Ramaddii",

    submit: "Ergi",
    cancel: "Haqi",
    save: "Olkaa’i",
    delete: "Haqi",
    edit: "Gulaali",
    update: "Haaromsi",

    loading: "Fe’amaa jira...",
    success: "Milkaa’e",
    error: "Dogoggora",
    retry: "Irra deebi’i",

    no_items: "Meeshaan hin argamne",
    no_claims: "Iyyannoon hin argamne",
    no_reports: "Gabaasni hin argamne",

    language: "Afaan",
    theme: "Bifa",
    light_mode: "Bifa ifaa",
    dark_mode: "Bifa dukkanaa",
    system_default: "Qindaa’ina sirnaa",

    notifications: "Beeksisawwan",
    privacy: "Iccitii",
    about: "Waa’ee",
    help: "Gargaarsa",

    online: "Toora interneetii irra",
    offline: "Toora interneetii ala",
  },

  // ----------------------------------------------------------
  // AWI / AWNGI
  // ----------------------------------------------------------

  awn: {
    app_name: "Injibara Campus Lost & Found",

    welcome: "Welcome",
    welcome_back: "Welcome back",

    login: "Login",
    register: "Register",
    logout: "Logout",

    email: "Email address",
    password: "Password",
    confirm_password: "Confirm password",

    first_name: "First name",
    last_name: "Last name",

    home: "Home",
    search: "Search",
    items: "Items",
    claims: "Claims",
    reports: "Reports",
    profile: "Profile",
    settings: "Settings",

    lost_items: "Lost items",
    found_items: "Found items",

    report_lost: "Report lost item",
    report_found: "Report found item",

    item_title: "Item title",
    item_description: "Description",
    item_location: "Location",
    item_category: "Category",

    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    update: "Update",

    loading: "Loading...",
    success: "Success",
    error: "Error",
    retry: "Retry",

    no_items: "No items found",
    no_claims: "No claims found",
    no_reports: "No reports found",

    language: "Language",
    theme: "Theme",
    light_mode: "Light mode",
    dark_mode: "Dark mode",
    system_default: "System default",

    notifications: "Notifications",
    privacy: "Privacy",
    about: "About",
    help: "Help and support",

    online: "Online",
    offline: "Offline",
  },
};

// ============================================================
// DEFAULT LANGUAGE
// ============================================================

const DEFAULT_LANGUAGE: LanguageCode = "en";

// ============================================================
// LANGUAGE LOOKUP
// ============================================================

function findLanguage(code: LanguageCode): Language {
  return (
    AVAILABLE_LANGUAGES.find((language) => language.code === code) ??
    AVAILABLE_LANGUAGES[0]
  );
}

// ============================================================
// TRANSLATION LOOKUP
// ============================================================

function translateText(
  language: LanguageCode,
  key: string,
  fallback?: string,
): string {
  const current = TRANSLATIONS[language]?.[key];

  if (current) {
    return current;
  }

  const english = TRANSLATIONS.en[key];

  return english || fallback || key;
}

// ============================================================
// LANGUAGE STORE
// ============================================================

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      // ----------------------------------------------------
      // INITIAL STATE
      // ----------------------------------------------------

      language: DEFAULT_LANGUAGE,

      availableLanguages: AVAILABLE_LANGUAGES,

      isChangingLanguage: false,

      // ----------------------------------------------------
      // SET LANGUAGE
      // ----------------------------------------------------

      setLanguage: async (language) => {
        const exists = AVAILABLE_LANGUAGES.some(
          (item) => item.code === language,
        );

        if (!exists) {
          throw new Error(`Unsupported language: ${language}`);
        }

        set({
          isChangingLanguage: true,
        });

        try {
          set({
            language,
            isChangingLanguage: false,
          });
        } catch (error) {
          set({
            isChangingLanguage: false,
          });

          throw error;
        }
      },

      // ----------------------------------------------------
      // SET LOADING
      // ----------------------------------------------------

      setChangingLanguage: (loading) => {
        set({
          isChangingLanguage: loading,
        });
      },

      // ----------------------------------------------------
      // GET LANGUAGE
      // ----------------------------------------------------

      getLanguage: () => get().language,

      // ----------------------------------------------------
      // GET LANGUAGE DETAILS
      // ----------------------------------------------------

      getLanguageDetails: () => {
        return findLanguage(get().language);
      },

      // ----------------------------------------------------
      // GET AVAILABLE LANGUAGES
      // ----------------------------------------------------

      getAvailableLanguages: () => {
        return AVAILABLE_LANGUAGES;
      },

      // ----------------------------------------------------
      // RTL CHECK
      // ----------------------------------------------------

      isRTL: () => {
        return findLanguage(get().language).isRTL;
      },

      // ----------------------------------------------------
      // TRANSLATE
      // ----------------------------------------------------

      translate: (key, fallback) => {
        return translateText(get().language, key, fallback);
      },

      // ----------------------------------------------------
      // RESET LANGUAGE
      // ----------------------------------------------------

      resetLanguage: () => {
        set({
          language: DEFAULT_LANGUAGE,
          isChangingLanguage: false,
        });
      },
    }),
    {
      name: "campus-lost-found-language",

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        language: state.language,
      }),

      version: 1,
    },
  ),
);

// ============================================================
// TRANSLATION HELPER
// ============================================================

export function t(key: string, fallback?: string): string {
  return useLanguageStore.getState().translate(key, fallback);
}

// ============================================================
// LANGUAGE SELECTOR
// ============================================================

export const selectLanguage = (state: LanguageState) => state.language;

export const selectLanguageLoading = (state: LanguageState) =>
  state.isChangingLanguage;

// ============================================================
// EXPORT
// ============================================================

const languageStore = {
  useLanguageStore,

  AVAILABLE_LANGUAGES,

  TRANSLATIONS,

  DEFAULT_LANGUAGE,

  t,

  translateText,
};

export default languageStore;
