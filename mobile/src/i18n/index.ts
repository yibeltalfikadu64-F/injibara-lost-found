// mobile/src/i18n/index.ts

import { useLanguageStore } from "../store/languageStore";

import en from "./locales/en.json";
import am from "./locales/am.json";
import om from "./locales/om.json";
import awn from "./locales/awn.json";

// ============================================================
// LANGUAGE TYPES
// ============================================================

export type LanguageCode = "en" | "am" | "om" | "awn";

export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};

export type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface TranslationOptions {
  count?: number;

  defaultValue?: string;

  fallbackLanguage?: LanguageCode;

  interpolation?: TranslationParams;
}

export interface LanguageInformation {
  code: LanguageCode;

  name: string;

  nativeName: string;

  flag: string;

  isRTL: boolean;
}

// ============================================================
// LANGUAGE INFORMATION
// ============================================================

export const LANGUAGES: LanguageInformation[] = [
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
    name: "Awngi",
    nativeName: "Awngi",
    flag: "🇪🇹",
    isRTL: false,
  },
];

// ============================================================
// TRANSLATION RESOURCES
// ============================================================

export const resources: Record<LanguageCode, TranslationDictionary> = {
  en: en as TranslationDictionary,

  am: am as TranslationDictionary,

  om: om as TranslationDictionary,

  awn: awn as TranslationDictionary,
};

// ============================================================
// DEFAULT LANGUAGE
// ============================================================

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export const FALLBACK_LANGUAGE: LanguageCode = "en";

// ============================================================
// LANGUAGE VALIDATION
// ============================================================

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && ["en", "am", "om", "awn"].includes(value);
}

// ============================================================
// GET LANGUAGE INFORMATION
// ============================================================

export function getLanguageInformation(
  code: LanguageCode,
): LanguageInformation {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0]!;
}

// ============================================================
// GET CURRENT LANGUAGE FROM ZUSTAND
// ============================================================

interface LanguageStoreSnapshot {
  language?: unknown;

  currentLanguage?: unknown;

  selectedLanguage?: unknown;
}

function getCurrentLanguage(): LanguageCode {
  const state = useLanguageStore.getState();

  const snapshot = state as unknown as LanguageStoreSnapshot;

  const candidate =
    snapshot.language ?? snapshot.currentLanguage ?? snapshot.selectedLanguage;

  return isLanguageCode(candidate) ? candidate : DEFAULT_LANGUAGE;
}

// ============================================================
// GET NESTED TRANSLATION VALUE
// ============================================================

function getNestedValue(
  dictionary: TranslationDictionary,
  key: string,
): string | undefined {
  const parts = key.split(".");

  let current: string | TranslationDictionary = dictionary;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    if (!Object.prototype.hasOwnProperty.call(current, part)) {
      return undefined;
    }

    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}

// ============================================================
// INTERPOLATION
// ============================================================

export function interpolate(
  template: string,
  values: TranslationParams = {},
): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key: string) => {
    const value = values[key];

    if (value === null || value === undefined) {
      return match;
    }

    return String(value);
  });
}

// ============================================================
// PLURAL KEY RESOLUTION
// ============================================================

function getPluralKey(key: string, count: number | undefined): string {
  if (count === undefined) {
    return key;
  }

  if (count === 1) {
    return `${key}_one`;
  }

  return `${key}_other`;
}

// ============================================================
// FIND TRANSLATION
// ============================================================

function findTranslation(
  key: string,
  language: LanguageCode,
  fallbackLanguage: LanguageCode,
): string | undefined {
  const primary = getNestedValue(resources[language], key);

  if (primary !== undefined) {
    return primary;
  }

  const fallback = getNestedValue(resources[fallbackLanguage], key);

  if (fallback !== undefined) {
    return fallback;
  }

  return undefined;
}

// ============================================================
// MAIN TRANSLATION FUNCTION
// ============================================================

export function translate(
  key: string,
  paramsOrOptions: TranslationParams | TranslationOptions = {},
): string {
  if (!key || !key.trim()) {
    return "";
  }

  const language = getCurrentLanguage();

  const isOptions =
    "count" in paramsOrOptions ||
    "defaultValue" in paramsOrOptions ||
    "fallbackLanguage" in paramsOrOptions ||
    "interpolation" in paramsOrOptions;

  const options: TranslationOptions = isOptions
    ? (paramsOrOptions as TranslationOptions)
    : {};

  const interpolationValues: TranslationParams = isOptions
    ? (options.interpolation ?? {})
    : (paramsOrOptions as TranslationParams);

  const fallbackLanguage = options.fallbackLanguage ?? FALLBACK_LANGUAGE;

  const count =
    options.count ??
    (typeof interpolationValues.count === "number"
      ? interpolationValues.count
      : undefined);

  // Try plural-specific translation first.
  if (count !== undefined) {
    const pluralKey = getPluralKey(key, count);

    const pluralTranslation = findTranslation(
      pluralKey,
      language,
      fallbackLanguage,
    );

    if (pluralTranslation !== undefined) {
      return interpolate(pluralTranslation, {
        ...interpolationValues,
        count,
      });
    }
  }

  // Try ordinary translation.
  const translation = findTranslation(key, language, fallbackLanguage);

  if (translation !== undefined) {
    return interpolate(translation, {
      ...interpolationValues,
      ...(count !== undefined ? { count } : {}),
    });
  }

  // Return caller-supplied fallback.
  if (options.defaultValue !== undefined) {
    return interpolate(options.defaultValue, interpolationValues);
  }

  // Last fallback: display the key.
  if (__DEV__) {
    console.warn(
      `[i18n] Missing translation: "${key}" for language "${language}".`,
    );
  }

  return key;
}

// ============================================================
// SHORT TRANSLATION FUNCTION
// ============================================================

export function t(key: string, params?: TranslationParams): string {
  return translate(key, params ?? {});
}

// ============================================================
// TRANSLATION WITH EXPLICIT LANGUAGE
// ============================================================

export function translateWithLanguage(
  key: string,
  language: LanguageCode,
  params: TranslationParams = {},
): string {
  const count = typeof params.count === "number" ? params.count : undefined;

  if (count !== undefined) {
    const pluralKey = getPluralKey(key, count);

    const pluralValue = findTranslation(pluralKey, language, FALLBACK_LANGUAGE);

    if (pluralValue !== undefined) {
      return interpolate(pluralValue, params);
    }
  }

  const value = findTranslation(key, language, FALLBACK_LANGUAGE);

  if (value === undefined) {
    return key;
  }

  return interpolate(value, params);
}

// ============================================================
// CHECK WHETHER TRANSLATION EXISTS
// ============================================================

export function hasTranslation(key: string, language?: LanguageCode): boolean {
  const selectedLanguage = language ?? getCurrentLanguage();

  return getNestedValue(resources[selectedLanguage], key) !== undefined;
}

// ============================================================
// GET ALL TRANSLATION KEYS
// ============================================================

function collectKeys(dictionary: TranslationDictionary, prefix = ""): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(dictionary)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.push(fullKey);
    } else {
      keys.push(...collectKeys(value, fullKey));
    }
  }

  return keys;
}

// ============================================================
// GET TRANSLATION KEYS
// ============================================================

export function getTranslationKeys(language: LanguageCode = "en"): string[] {
  return collectKeys(resources[language]);
}

// ============================================================
// GET MISSING TRANSLATIONS
// ============================================================

export function getMissingTranslations(language: LanguageCode): string[] {
  const defaultKeys = new Set(getTranslationKeys(DEFAULT_LANGUAGE));

  const languageKeys = new Set(getTranslationKeys(language));

  return Array.from(defaultKeys).filter((key) => !languageKeys.has(key));
}

// ============================================================
// TRANSLATION COMPLETENESS
// ============================================================

export function getTranslationCompleteness(language: LanguageCode): {
  total: number;
  translated: number;
  missing: number;
  percentage: number;
} {
  const defaultKeys = getTranslationKeys(DEFAULT_LANGUAGE);

  const missingKeys = getMissingTranslations(language);

  const total = defaultKeys.length;

  const missing = missingKeys.length;

  const translated = total - missing;

  return {
    total,

    translated,

    missing,

    percentage: total === 0 ? 100 : Math.round((translated / total) * 100),
  };
}

// ============================================================
// CHANGE LANGUAGE
// ============================================================

export async function changeLanguage(language: LanguageCode): Promise<void> {
  if (!isLanguageCode(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const store = useLanguageStore.getState();

  const setter = store.setLanguage;

  if (typeof setter !== "function") {
    throw new Error("The language store does not provide setLanguage().");
  }

  await setter(language);
}

// ============================================================
// GET CURRENT LANGUAGE
// ============================================================

export function getLanguage(): LanguageCode {
  return getCurrentLanguage();
}

// ============================================================
// GET AVAILABLE LANGUAGES
// ============================================================

export function getAvailableLanguages(): LanguageInformation[] {
  return [...LANGUAGES];
}

// ============================================================
// REACT TRANSLATION HOOK
// ============================================================

export function useTranslation() {
  // Subscribe to the complete Zustand state.
  // This ensures components rerender when the language changes.
  useLanguageStore();

  const language = getCurrentLanguage();

  const languageInfo = getLanguageInformation(language);

  return {
    t,

    translate,

    language,

    languageInfo,

    languages: LANGUAGES,

    changeLanguage,

    hasTranslation,

    isRTL: languageInfo.isRTL,
  };
}

// ============================================================
// TRANSLATION COMPONENT HELPER
// ============================================================

export function getLocalizedText(
  values: Partial<Record<LanguageCode, string>>,
  fallback = "",
): string {
  const language = getCurrentLanguage();

  return values[language] ?? values[DEFAULT_LANGUAGE] ?? fallback;
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

const i18n = {
  t,

  translate,

  translateWithLanguage,

  changeLanguage,

  getLanguage,

  getAvailableLanguages,

  getLanguageInformation,

  hasTranslation,

  getTranslationKeys,

  getMissingTranslations,

  getTranslationCompleteness,

  getLocalizedText,

  useTranslation,

  resources,

  LANGUAGES,

  DEFAULT_LANGUAGE,

  FALLBACK_LANGUAGE,
};

export default i18n;
