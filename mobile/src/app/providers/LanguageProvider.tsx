
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageCode = 'en' | 'am' | 'om' | 'awn';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    isRTL: false,
  },
  {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    flag: '🇪🇹',
    isRTL: false,
  },
  {
    code: 'om',
    name: 'Afaan Oromoo',
    nativeName: 'Afaan Oromoo',
    flag: '🇪🇹',
    isRTL: false,
  },
  {
    code: 'awn',
    name: 'Awi/Awngi',
    nativeName: 'Awi/Awngi',
    flag: '🇪🇹',
    isRTL: false,
  },
];

type TranslationValue = string | TranslationDictionary;

interface TranslationDictionary {
  [key: string]: TranslationValue;
}

const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'Injibara Lost & Found',
    common: {
      welcome: 'Welcome',
      home: 'Home',
      search: 'Search',
      profile: 'Profile',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      loading: 'Loading...',
      retry: 'Try again',
      noData: 'No data available',
      success: 'Success',
      error: 'Something went wrong',
      language: 'Language',
      logout: 'Log out',
    },
    auth: {
      login: 'Login',
      register: 'Create account',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      forgotPassword: 'Forgot password?',
      loginTitle: 'Welcome back!',
      loginSubtitle: 'Sign in to continue',
      registerTitle: 'Create your account',
      registerSubtitle: 'Join the Injibara campus community',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      fullName: 'Full name',
      phone: 'Phone number',
      loginSuccess: 'You have successfully logged in.',
      logoutSuccess: 'You have been logged out.',
    },
    home: {
      title: 'Find what matters',
      subtitle: 'Lost something or found an item? We can help.',
      lostItems: 'Lost items',
      foundItems: 'Found items',
      recentItems: 'Recently reported',
      reportLost: 'Report lost item',
      reportFound: 'Report found item',
      viewAll: 'View all',
      statistics: 'Campus statistics',
    },
    items: {
      title: 'Items',
      itemName: 'Item name',
      description: 'Description',
      category: 'Category',
      location: 'Location',
      date: 'Date',
      itemType: 'Item type',
      lost: 'Lost',
      found: 'Found',
      status: 'Status',
      available: 'Available',
      claimed: 'Claimed',
      resolved: 'Resolved',
      reportItem: 'Report an item',
      itemDetails: 'Item details',
      noItems: 'No items found',
      noItemsDescription: 'Try changing your search or filters.',
      searchPlaceholder: 'Search items...',
      uploadImage: 'Upload image',
      contactOwner: 'Contact reporter',
    },
    claims: {
      title: 'My claims',
      createClaim: 'Submit a claim',
      claimDetails: 'Claim details',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      verification: 'Ownership verification',
      proof: 'Describe how you can prove ownership',
      noClaims: 'You have not submitted any claims.',
    },
    notifications: {
      title: 'Notifications',
      empty: 'You have no notifications.',
      markRead: 'Mark as read',
      markAllRead: 'Mark all as read',
    },
    profile: {
      title: 'My profile',
      editProfile: 'Edit profile',
      personalInformation: 'Personal information',
      studentId: 'Student ID',
      department: 'Department',
      role: 'Account role',
      updateSuccess: 'Profile updated successfully.',
    },
    settings: {
      title: 'Settings',
      language: 'Choose language',
      theme: 'Appearance',
      light: 'Light mode',
      dark: 'Dark mode',
      system: 'System default',
      about: 'About application',
      privacy: 'Privacy policy',
      help: 'Help and support',
    },
  },

  am: {
    appName: 'የኢንጂባራ ዩኒቨርሲቲ የጠፋና የተገኘ ዕቃ',
    common: {
      welcome: 'እንኳን ደህና መጡ',
      home: 'መነሻ',
      search: 'ፈልግ',
      profile: 'መገለጫ',
      settings: 'ቅንብሮች',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      delete: 'አጥፋ',
      edit: 'አስተካክል',
      submit: 'አስገባ',
      confirm: 'አረጋግጥ',
      back: 'ተመለስ',
      next: 'ቀጣይ',
      loading: 'በመጫን ላይ...',
      retry: 'እንደገና ሞክር',
      noData: 'ምንም መረጃ የለም',
      success: 'ተሳክቷል',
      error: 'ስህተት ተፈጥሯል',
      language: 'ቋንቋ',
      logout: 'ውጣ',
    },
    auth: {
      login: 'ግባ',
      register: 'መለያ ፍጠር',
      email: 'ኢሜይል አድራሻ',
      password: 'የይለፍ ቃል',
      confirmPassword: 'የይለፍ ቃሉን አረጋግጥ',
      forgotPassword: 'የይለፍ ቃል ረሳህ?',
      loginTitle: 'እንኳን ተመለስህ!',
      loginSubtitle: 'ለመቀጠል ወደ መለያህ ግባ',
      registerTitle: 'መለያህን ፍጠር',
      registerSubtitle: 'የኢንጂባራ ካምፓስ ማህበረሰብን ተቀላቀል',
      noAccount: 'መለያ የለህም?',
      haveAccount: 'ቀድሞ መለያ አለህ?',
      fullName: 'ሙሉ ስም',
      phone: 'ስልክ ቁጥር',
      loginSuccess: 'በተሳካ ሁኔታ ገብተሃል።',
      logoutSuccess: 'ከመለያህ ወጥተሃል።',
    },
    home: {
      title: 'የጠፋውን ያግኙ',
      subtitle: 'ዕቃ ጠፍቶብሃል ወይስ ዕቃ አግኝተሃል? እንረዳሃለን።',
      lostItems: 'የጠፉ ዕቃዎች',
      foundItems: 'የተገኙ ዕቃዎች',
      recentItems: 'በቅርቡ የተመዘገቡ',
      reportLost: 'የጠፋ ዕቃ ሪፖርት አድርግ',
      reportFound: 'የተገኘ ዕቃ ሪፖርት አድርግ',
      viewAll: 'ሁሉንም ይመልከቱ',
      statistics: 'የካምፓስ ስታቲስቲክስ',
    },
    items: {
      title: 'ዕቃዎች',
      itemName: 'የዕቃው ስም',
      description: 'መግለጫ',
      category: 'ምድብ',
      location: 'ቦታ',
      date: 'ቀን',
      itemType: 'የዕቃው አይነት',
      lost: 'የጠፋ',
      found: 'የተገኘ',
      status: 'ሁኔታ',
      available: 'ይገኛል',
      claimed: 'ተጠይቋል',
      resolved: 'ተፈትቷል',
      reportItem: 'ዕቃ ሪፖርት አድርግ',
      itemDetails: 'የዕቃው ዝርዝር',
      noItems: 'ምንም ዕቃ አልተገኘም',
      noItemsDescription: 'ፍለጋህን ወይም ማጣሪያህን ቀይር።',
      searchPlaceholder: 'ዕቃዎችን ፈልግ...',
      uploadImage: 'ፎቶ ጫን',
      contactOwner: 'ሪፖርት አድራጊውን አግኝ',
    },
    claims: {
      title: 'የእኔ ጥያቄዎች',
      createClaim: 'የይገባኛል ጥያቄ አስገባ',
      claimDetails: 'የጥያቄው ዝርዝር',
      pending: 'በመጠባበቅ ላይ',
      approved: 'ተፈቅዷል',
      rejected: 'ውድቅ ተደርጓል',
      verification: 'የባለቤትነት ማረጋገጫ',
      proof: 'የዕቃው ባለቤት መሆንህን እንዴት ማረጋገጥ እንደምትችል ግለጽ',
      noClaims: 'እስካሁን ምንም ጥያቄ አላስገባህም።',
    },
    notifications: {
      title: 'ማሳወቂያዎች',
      empty: 'ምንም ማሳወቂያ የለም።',
      markRead: 'እንደተነበበ ምልክት አድርግ',
      markAllRead: 'ሁሉንም እንደተነበቡ ምልክት አድርግ',
    },
    profile: {
      title: 'የእኔ መገለጫ',
      editProfile: 'መገለጫ አስተካክል',
      personalInformation: 'የግል መረጃ',
      studentId: 'የተማሪ መለያ ቁጥር',
      department: 'የትምህርት ክፍል',
      role: 'የመለያ ሚና',
      updateSuccess: 'መገለጫው በተሳካ ሁኔታ ተሻሽሏል።',
    },
    settings: {
      title: 'ቅንብሮች',
      language: 'ቋንቋ ምረጥ',
      theme: 'የመልክ ቅንብር',
      light: 'ብርሃን ሁኔታ',
      dark: 'ጨለማ ሁኔታ',
      system: 'የስርዓት ቅንብር',
      about: 'ስለ መተግበሪያው',
      privacy: 'የግላዊነት ፖሊሲ',
      help: 'እገዛ እና ድጋፍ',
    },
  },

  om: {
    appName: 'Injibara Lost & Found',
    common: {
      welcome: 'Baga nagaan dhuftan',
      home: 'Mana',
      search: 'Barbaadi',
      profile: 'Piroofaayilii',
      settings: 'Qindaa’ina',
      save: 'Olkaa’i',
      cancel: 'Haqi',
      delete: 'Haqi',
      edit: 'Gulaali',
      submit: 'Galchi',
      confirm: 'Mirkaneessi',
      back: 'Duubatti',
      next: 'Itti aanee',
      loading: 'Fe’aa jira...',
      retry: 'Irra deebi’i',
      noData: 'Odeeffannoon hin jiru',
      success: 'Milkaa’e',
      error: 'Dogoggorri uumame',
      language: 'Afaan',
      logout: 'Ba’i',
    },
    auth: {
      login: 'Seeni',
      register: 'Herrega bani',
      email: 'Teessoo imeelii',
      password: 'Jecha iccitii',
      confirmPassword: 'Jecha iccitii mirkaneessi',
      forgotPassword: 'Jecha iccitii irraanfatte?',
      loginTitle: 'Baga deebite!',
      loginSubtitle: 'Itti fufuuf seeni',
      registerTitle: 'Herrega kee bani',
      registerSubtitle: 'Hawaasa Yunivarsiitii Injibaraatti makami',
      noAccount: 'Herrega hin qabduu?',
      haveAccount: 'Herrega duraan qabduu?',
      fullName: 'Maqaa guutuu',
      phone: 'Lakkoofsa bilbilaa',
      loginSuccess: 'Milkaa’inaan seenteetta.',
      logoutSuccess: 'Herrega kee keessaa baateetta.',
    },
    home: {
      title: 'Waan barbaaddu argadhu',
      subtitle: 'Wanti si jalaa badeera moo wanta argatte? Si gargaarra.',
      lostItems: 'Meeshaalee badanii',
      foundItems: 'Meeshaalee argamanii',
      recentItems: 'Kan dhiheenya galmaa’an',
      reportLost: 'Meeshaa bade gabaasi',
      reportFound: 'Meeshaa argame gabaasi',
      viewAll: 'Hunda ilaali',
      statistics: 'Lakkoofsa istaatistikii kaampaasii',
    },
    items: {
      title: 'Meeshaalee',
      itemName: 'Maqaa meeshaa',
      description: 'Ibsa',
      category: 'Ramaddii',
      location: 'Bakka',
      date: 'Guyyaa',
      itemType: 'Gosa meeshaa',
      lost: 'Bade',
      found: 'Argame',
      status: 'Haala',
      available: 'Ni argama',
      claimed: 'Gaafatameera',
      resolved: 'Furameera',
      reportItem: 'Meeshaa gabaasi',
      itemDetails: 'Bal’ina meeshaa',
      noItems: 'Meeshaan hin argamne',
      noItemsDescription: 'Barbaacha ykn calallii kee jijjiiri.',
      searchPlaceholder: 'Meeshaalee barbaadi...',
      uploadImage: 'Suuraa olkaa’i',
      contactOwner: 'Nama gabaase qunnami',
    },
    claims: {
      title: 'Gaaffiiwwan koo',
      createClaim: 'Gaaffii dhiyeessi',
      claimDetails: 'Bal’ina gaaffii',
      pending: 'Eegaa jira',
      approved: 'Mirkanaa’eera',
      rejected: 'Kufee jira',
      verification: 'Mirkaneessa abbummaa',
      proof: 'Abbaa meeshaa ta’uu kee akkamitti mirkaneessuu akka dandeessu ibsi',
      noClaims: 'Hanga ammaatti gaaffii hin dhiyeessine.',
    },
    notifications: {
      title: 'Beeksisawwan',
      empty: 'Beeksisni hin jiru.',
      markRead: 'Dubbifame jedhii mallatteessi',
      markAllRead: 'Hunda dubbifame jedhii mallatteessi',
    },
    profile: {
      title: 'Piroofaayilii koo',
      editProfile: 'Piroofaayilii gulaali',
      personalInformation: 'Odeeffannoo dhuunfaa',
      studentId: 'Lakkoofsa barataa',
      department: 'Kutaa barnootaa',
      role: 'Gahee herregaa',
      updateSuccess: 'Piroofaayiliin milkaa’inaan haaromfameera.',
    },
    settings: {
      title: 'Qindaa’ina',
      language: 'Afaan filadhu',
      theme: 'Bifa',
      light: 'Bifa ifaa',
      dark: 'Bifa dukkanaa',
      system: 'Bifa sirnaa',
      about: 'Waa’ee appilikeeshinii',
      privacy: 'Imaammata iccitii',
      help: 'Gargaarsa fi deeggarsa',
    },
  },

  awn: {
    appName: 'Injibara Lost & Found',
    common: {
      welcome: 'Welcome',
      home: 'Home',
      search: 'Search',
      profile: 'Profile',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      loading: 'Loading...',
      retry: 'Try again',
      noData: 'No data available',
      success: 'Success',
      error: 'Something went wrong',
      language: 'Language',
      logout: 'Log out',
    },
    auth: {
      login: 'Login',
      register: 'Create account',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      forgotPassword: 'Forgot password?',
      loginTitle: 'Welcome back!',
      loginSubtitle: 'Sign in to continue',
      registerTitle: 'Create your account',
      registerSubtitle: 'Join the Injibara campus community',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      fullName: 'Full name',
      phone: 'Phone number',
      loginSuccess: 'Login successful.',
      logoutSuccess: 'Logout successful.',
    },
    home: {
      title: 'Find what matters',
      subtitle: 'Lost something or found an item? We can help.',
      lostItems: 'Lost items',
      foundItems: 'Found items',
      recentItems: 'Recently reported',
      reportLost: 'Report lost item',
      reportFound: 'Report found item',
      viewAll: 'View all',
      statistics: 'Campus statistics',
    },
    items: {
      title: 'Items',
      itemName: 'Item name',
      description: 'Description',
      category: 'Category',
      location: 'Location',
      date: 'Date',
      itemType: 'Item type',
      lost: 'Lost',
      found: 'Found',
      status: 'Status',
      available: 'Available',
      claimed: 'Claimed',
      resolved: 'Resolved',
      reportItem: 'Report an item',
      itemDetails: 'Item details',
      noItems: 'No items found',
      noItemsDescription: 'Try changing your search or filters.',
      searchPlaceholder: 'Search items...',
      uploadImage: 'Upload image',
      contactOwner: 'Contact reporter',
    },
    claims: {
      title: 'My claims',
      createClaim: 'Submit a claim',
      claimDetails: 'Claim details',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      verification: 'Ownership verification',
      proof: 'Describe how you can prove ownership',
      noClaims: 'No claims submitted.',
    },
    notifications: {
      title: 'Notifications',
      empty: 'You have no notifications.',
      markRead: 'Mark as read',
      markAllRead: 'Mark all as read',
    },
    profile: {
      title: 'My profile',
      editProfile: 'Edit profile',
      personalInformation: 'Personal information',
      studentId: 'Student ID',
      department: 'Department',
      role: 'Account role',
      updateSuccess: 'Profile updated successfully.',
    },
    settings: {
      title: 'Settings',
      language: 'Choose language',
      theme: 'Appearance',
      light: 'Light mode',
      dark: 'Dark mode',
      system: 'System default',
      about: 'About application',
      privacy: 'Privacy policy',
      help: 'Help and support',
    },
  },
};

const LANGUAGE_STORAGE_KEY = '@injibara_lost_found/language';

export interface LanguageContextValue {
  language: LanguageCode;
  currentLanguage: Language;
  languages: Language[];
  isLanguageLoading: boolean;
  changeLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
}

function getNestedTranslation(
  dictionary: TranslationDictionary,
  key: string,
): string | undefined {
  const value = key
    .split('.')
    .reduce<TranslationValue | undefined>(
      (current, part) => {
        if (
          current &&
          typeof current === 'object' &&
          part in current
        ) {
          return current[part];
        }

        return undefined;
      },
      dictionary,
    );

  return typeof value === 'string' ? value : undefined;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en',
}) => {
  const [language, setLanguage] =
    useState<LanguageCode>(defaultLanguage);

  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(
          LANGUAGE_STORAGE_KEY,
        );

        if (
          mounted &&
          savedLanguage &&
          LANGUAGES.some((item) => item.code === savedLanguage)
        ) {
          setLanguage(savedLanguage as LanguageCode);
        }
      } catch (error) {
        console.warn('Unable to load saved language:', error);
      } finally {
        if (mounted) {
          setIsLanguageLoading(false);
        }
      }
    };

    void loadLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  const changeLanguage = useCallback(
    async (newLanguage: LanguageCode) => {
      const exists = LANGUAGES.some(
        (item) => item.code === newLanguage,
      );

      if (!exists) {
        throw new Error(`Unsupported language: ${newLanguage}`);
      }

      setLanguage(newLanguage);

      try {
        await AsyncStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          newLanguage,
        );
      } catch (error) {
        console.warn('Unable to save language preference:', error);
        throw error;
      }
    },
    [],
  );

  const currentLanguage = useMemo(
    () =>
      LANGUAGES.find((item) => item.code === language) ??
      LANGUAGES[0],
    [language],
  );

  const t = useCallback(
    (key: string): string => {
      const translation = getNestedTranslation(
        translations[language],
        key,
      );

      if (translation) {
        return translation;
      }

      const englishFallback = getNestedTranslation(
        translations.en,
        key,
      );

      return englishFallback ?? key;
    },
    [language],
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      currentLanguage,
      languages: LANGUAGES,
      isLanguageLoading,
      changeLanguage,
      t,
    }),
    [
      language,
      currentLanguage,
      isLanguageLoading,
      changeLanguage,
      t,
    ],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used inside a LanguageProvider.',
    );
  }

  return context;
};

export default LanguageProvider;
