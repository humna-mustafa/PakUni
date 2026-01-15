/**
 * Localization (i18n) Service - Multi-language support
 * Supports English and Urdu with RTL support
 */

import {I18nManager, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

export type Language = 'en' | 'ur';

export interface TranslationStrings {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    seeAll: string;
    back: string;
    next: string;
    done: string;
    ok: string;
    yes: string;
    no: string;
    submit: string;
    clear: string;
    apply: string;
    reset: string;
    share: string;
    copy: string;
    close: string;
  };

  // Navigation
  navigation: {
    home: string;
    universities: string;
    scholarships: string;
    profile: string;
    calculator: string;
    compare: string;
    entryTests: string;
    careerGuidance: string;
    recommendations: string;
    kidsHub: string;
    settings: string;
  };

  // Home Screen
  home: {
    welcomeBack: string;
    greeting: string;
    heroTitle: string;
    heroSubtitle: string;
    getStarted: string;
    quickActions: string;
    topUniversities: string;
    highestRanked: string;
    featuredScholarships: string;
    fundYourEducation: string;
    entryTests: string;
    prepareForSuccess: string;
    readyToStart: string;
    calculateMerit: string;
  };

  // Universities
  universities: {
    title: string;
    searchPlaceholder: string;
    filterBy: string;
    sortBy: string;
    allTypes: string;
    public: string;
    private: string;
    ranking: string;
    location: string;
    programs: string;
    viewDetails: string;
    compare: string;
    save: string;
    unsave: string;
    noResults: string;
  };

  // Scholarships
  scholarships: {
    title: string;
    searchPlaceholder: string;
    fullFunding: string;
    partialFunding: string;
    needBased: string;
    meritBased: string;
    government: string;
    private: string;
    coverage: string;
    deadline: string;
    eligibility: string;
    apply: string;
  };

  // Calculator
  calculator: {
    title: string;
    enterMarks: string;
    matricMarks: string;
    interMarks: string;
    entryTestScore: string;
    totalMarks: string;
    obtainedMarks: string;
    percentage: string;
    calculateMerit: string;
    yourMerit: string;
    eligibleUniversities: string;
    noEligible: string;
  };

  // Profile
  profile: {
    title: string;
    personalInfo: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    education: string;
    currentClass: string;
    board: string;
    school: string;
    goals: string;
    targetField: string;
    dreamUniversity: string;
    interests: string;
    savedItems: string;
    settings: string;
    theme: string;
    notifications: string;
    language: string;
    signOut: string;
    profileCompletion: string;
    completeProfile: string;
  };

  // Settings
  settings: {
    title: string;
    appearance: string;
    lightMode: string;
    darkMode: string;
    systemDefault: string;
    notifications: string;
    pushNotifications: string;
    emailUpdates: string;
    language: string;
    english: string;
    urdu: string;
    about: string;
    version: string;
    privacyPolicy: string;
    termsOfService: string;
    contactSupport: string;
    rateApp: string;
    shareApp: string;
  };

  // Errors
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    somethingWentWrong: string;
    tryAgain: string;
    noInternet: string;
    timeout: string;
  };

  // Empty States
  empty: {
    noUniversities: string;
    noScholarships: string;
    noResults: string;
    noSavedItems: string;
    noNotifications: string;
  };

  // Success Messages
  success: {
    saved: string;
    updated: string;
    deleted: string;
    copied: string;
    shared: string;
    profileUpdated: string;
    settingsSaved: string;
  };

  // Kids Hub
  kidsHub: {
    title: string;
    welcomeMessage: string;
    careerExplorer: string;
    interestQuiz: string;
    goalSetting: string;
    subjectGuide: string;
    studyTips: string;
  };

  // Career Guidance
  career: {
    title: string;
    findYourPath: string;
    takeQuiz: string;
    exploreFields: string;
    roadmaps: string;
    skills: string;
    requirements: string;
    salaryRange: string;
    jobOutlook: string;
  };
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const en: TranslationStrings = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    seeAll: 'See All',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    submit: 'Submit',
    clear: 'Clear',
    apply: 'Apply',
    reset: 'Reset',
    share: 'Share',
    copy: 'Copy',
    close: 'Close',
  },

  navigation: {
    home: 'Home',
    universities: 'Universities',
    scholarships: 'Scholarships',
    profile: 'Profile',
    calculator: 'Calculator',
    compare: 'Compare',
    entryTests: 'Entry Tests',
    careerGuidance: 'Career Guidance',
    recommendations: 'Recommendations',
    kidsHub: 'Kids Hub',
    settings: 'Settings',
  },

  home: {
    welcomeBack: 'Welcome Back,',
    greeting: 'Student',
    heroTitle: 'Find Your\nDream University',
    heroSubtitle: 'Explore 200+ universities, calculate merit,\nand discover scholarships',
    getStarted: 'Get Started',
    quickActions: 'What would you like to do?',
    quickActionsSubtitle: 'Your tools & resources',
    topUniversities: 'Top Universities',
    highestRanked: 'Highest ranked institutions',
    featuredScholarships: 'Featured Scholarships',
    fundYourEducation: 'Fund your education',
    entryTests: 'Entry Tests',
    prepareForSuccess: 'Prepare for success',
    readyToStart: 'Ready to Start Your Journey?',
    calculateMerit: 'Calculate Your Merit',
  },

  universities: {
    title: 'Universities',
    searchPlaceholder: 'Search universities...',
    filterBy: 'Filter By',
    sortBy: 'Sort By',
    allTypes: 'All Types',
    public: 'Public',
    private: 'Private',
    ranking: 'Ranking',
    location: 'Location',
    programs: 'Programs',
    viewDetails: 'View Details',
    compare: 'Compare',
    save: 'Save',
    unsave: 'Unsave',
    noResults: 'No universities found',
  },

  scholarships: {
    title: 'Scholarships',
    searchPlaceholder: 'Search scholarships...',
    fullFunding: 'Full Funding',
    partialFunding: 'Partial Funding',
    needBased: 'Need Based',
    meritBased: 'Merit Based',
    government: 'Government',
    private: 'Private',
    coverage: 'Coverage',
    deadline: 'Deadline',
    eligibility: 'Eligibility',
    apply: 'Apply Now',
  },

  calculator: {
    title: 'Merit Calculator',
    enterMarks: 'Enter Your Marks',
    matricMarks: 'Matric/O-Level Marks',
    interMarks: 'FSc/A-Level Marks',
    entryTestScore: 'Entry Test Score',
    totalMarks: 'Total Marks',
    obtainedMarks: 'Obtained Marks',
    percentage: 'Percentage',
    calculateMerit: 'Calculate Merit',
    yourMerit: 'Your Merit',
    eligibleUniversities: 'Eligible Universities',
    noEligible: 'No universities match your merit yet',
  },

  profile: {
    title: 'Profile',
    personalInfo: 'Personal Info',
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
    education: 'Education',
    currentClass: 'Current Class',
    board: 'Board',
    school: 'School/College',
    goals: 'Career Goals',
    targetField: 'Target Field',
    dreamUniversity: 'Dream University',
    interests: 'Interests',
    savedItems: 'Saved Items',
    settings: 'Settings',
    theme: 'Theme',
    notifications: 'Notifications',
    language: 'Language',
    signOut: 'Sign Out',
    profileCompletion: 'Profile Completion',
    completeProfile: 'Complete for better recommendations',
  },

  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    lightMode: 'Light',
    darkMode: 'Dark',
    systemDefault: 'System',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    emailUpdates: 'Email Updates',
    language: 'Language',
    english: 'English',
    urdu: 'اردو',
    about: 'About',
    version: 'Version',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactSupport: 'Contact Support',
    rateApp: 'Rate App',
    shareApp: 'Share App',
  },

  errors: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    notFound: 'Not found.',
    unauthorized: 'Please login to continue.',
    somethingWentWrong: 'Something went wrong.',
    tryAgain: 'Please try again.',
    noInternet: 'No internet connection.',
    timeout: 'Request timed out.',
  },

  empty: {
    noUniversities: 'No universities found',
    noScholarships: 'No scholarships available',
    noResults: 'No results found',
    noSavedItems: 'No saved items yet',
    noNotifications: 'No notifications',
  },

  success: {
    saved: 'Saved successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    copied: 'Copied to clipboard',
    shared: 'Shared successfully',
    profileUpdated: 'Profile updated',
    settingsSaved: 'Settings saved',
  },

  kidsHub: {
    title: 'Kids Hub',
    welcomeMessage: 'Explore Your Future!',
    careerExplorer: 'Career Explorer',
    interestQuiz: 'Interest Quiz',
    goalSetting: 'Goal Setting',
    subjectGuide: 'Subject Guide',
    studyTips: 'Study Tips',
  },

  career: {
    title: 'Career Guidance',
    findYourPath: 'Find Your Path',
    takeQuiz: 'Take Career Quiz',
    exploreFields: 'Explore Fields',
    roadmaps: 'Career Roadmaps',
    skills: 'Required Skills',
    requirements: 'Requirements',
    salaryRange: 'Salary Range',
    jobOutlook: 'Job Outlook',
  },
};

const ur: TranslationStrings = {
  common: {
    loading: 'لوڈ ہو رہا ہے...',
    error: 'خرابی',
    retry: 'دوبارہ کوشش کریں',
    cancel: 'منسوخ کریں',
    confirm: 'تصدیق کریں',
    save: 'محفوظ کریں',
    delete: 'حذف کریں',
    edit: 'ترمیم کریں',
    search: 'تلاش کریں',
    seeAll: 'سب دیکھیں',
    back: 'واپس',
    next: 'اگلا',
    done: 'مکمل',
    ok: 'ٹھیک ہے',
    yes: 'ہاں',
    no: 'نہیں',
    submit: 'جمع کرائیں',
    clear: 'صاف کریں',
    apply: 'لاگو کریں',
    reset: 'ری سیٹ',
    share: 'شیئر کریں',
    copy: 'کاپی کریں',
    close: 'بند کریں',
  },

  navigation: {
    home: 'ہوم',
    universities: 'یونیورسٹیاں',
    scholarships: 'وظائف',
    profile: 'پروفائل',
    calculator: 'کیلکولیٹر',
    compare: 'موازنہ',
    entryTests: 'داخلہ ٹیسٹ',
    careerGuidance: 'کیریئر گائیڈنس',
    recommendations: 'سفارشات',
    kidsHub: 'بچوں کا حب',
    settings: 'ترتیبات',
  },

  home: {
    welcomeBack: 'خوش آمدید،',
    greeting: 'طالب علم',
    heroTitle: 'اپنی پسند کی\nیونیورسٹی تلاش کریں',
    heroSubtitle: '200+ یونیورسٹیوں کو دیکھیں، میرٹ حساب کریں،\nاور وظائف دریافت کریں',
    getStarted: 'شروع کریں',
    quickActions: 'فوری ایکشنز',
    topUniversities: 'ٹاپ یونیورسٹیاں',
    highestRanked: 'اعلیٰ درجے کے ادارے',
    featuredScholarships: 'نمایاں وظائف',
    fundYourEducation: 'اپنی تعلیم کی مالی معاونت',
    entryTests: 'داخلہ ٹیسٹ',
    prepareForSuccess: 'کامیابی کی تیاری',
    readyToStart: 'اپنا سفر شروع کرنے کے لیے تیار ہیں؟',
    calculateMerit: 'اپنی میرٹ حساب کریں',
  },

  universities: {
    title: 'یونیورسٹیاں',
    searchPlaceholder: 'یونیورسٹیاں تلاش کریں...',
    filterBy: 'فلٹر کریں',
    sortBy: 'ترتیب دیں',
    allTypes: 'تمام اقسام',
    public: 'سرکاری',
    private: 'پرائیویٹ',
    ranking: 'درجہ بندی',
    location: 'مقام',
    programs: 'پروگرام',
    viewDetails: 'تفصیلات دیکھیں',
    compare: 'موازنہ کریں',
    save: 'محفوظ کریں',
    unsave: 'ہٹائیں',
    noResults: 'کوئی یونیورسٹی نہیں ملی',
  },

  scholarships: {
    title: 'وظائف',
    searchPlaceholder: 'وظائف تلاش کریں...',
    fullFunding: 'مکمل فنڈنگ',
    partialFunding: 'جزوی فنڈنگ',
    needBased: 'ضرورت پر مبنی',
    meritBased: 'میرٹ پر مبنی',
    government: 'سرکاری',
    private: 'پرائیویٹ',
    coverage: 'کوریج',
    deadline: 'آخری تاریخ',
    eligibility: 'اہلیت',
    apply: 'ابھی درخواست دیں',
  },

  calculator: {
    title: 'میرٹ کیلکولیٹر',
    enterMarks: 'اپنے نمبر درج کریں',
    matricMarks: 'میٹرک/او لیول نمبر',
    interMarks: 'ایف ایس سی/اے لیول نمبر',
    entryTestScore: 'داخلہ ٹیسٹ سکور',
    totalMarks: 'کل نمبر',
    obtainedMarks: 'حاصل کردہ نمبر',
    percentage: 'فیصد',
    calculateMerit: 'میرٹ حساب کریں',
    yourMerit: 'آپ کی میرٹ',
    eligibleUniversities: 'اہل یونیورسٹیاں',
    noEligible: 'ابھی کوئی یونیورسٹی آپ کی میرٹ سے نہیں ملتی',
  },

  profile: {
    title: 'پروفائل',
    personalInfo: 'ذاتی معلومات',
    name: 'مکمل نام',
    email: 'ای میل',
    phone: 'فون',
    city: 'شہر',
    education: 'تعلیم',
    currentClass: 'موجودہ کلاس',
    board: 'بورڈ',
    school: 'اسکول/کالج',
    goals: 'کیریئر کے اہداف',
    targetField: 'ٹارگٹ فیلڈ',
    dreamUniversity: 'خوابوں کی یونیورسٹی',
    interests: 'دلچسپیاں',
    savedItems: 'محفوظ آئٹمز',
    settings: 'ترتیبات',
    theme: 'تھیم',
    notifications: 'اطلاعات',
    language: 'زبان',
    signOut: 'سائن آؤٹ',
    profileCompletion: 'پروفائل مکمل',
    completeProfile: 'بہتر سفارشات کے لیے مکمل کریں',
  },

  settings: {
    title: 'ترتیبات',
    appearance: 'ظاہری شکل',
    lightMode: 'لائٹ',
    darkMode: 'ڈارک',
    systemDefault: 'سسٹم',
    notifications: 'اطلاعات',
    pushNotifications: 'پش اطلاعات',
    emailUpdates: 'ای میل اپڈیٹس',
    language: 'زبان',
    english: 'English',
    urdu: 'اردو',
    about: 'متعلق',
    version: 'ورژن',
    privacyPolicy: 'پرائیویسی پالیسی',
    termsOfService: 'سروس کی شرائط',
    contactSupport: 'سپورٹ سے رابطہ کریں',
    rateApp: 'ایپ کی درجہ بندی کریں',
    shareApp: 'ایپ شیئر کریں',
  },

  errors: {
    networkError: 'نیٹ ورک خرابی۔ براہ کرم اپنا کنکشن چیک کریں۔',
    serverError: 'سرور خرابی۔ براہ کرم بعد میں دوبارہ کوشش کریں۔',
    notFound: 'نہیں ملا۔',
    unauthorized: 'براہ کرم جاری رکھنے کے لیے لاگ ان کریں۔',
    somethingWentWrong: 'کچھ غلط ہو گیا۔',
    tryAgain: 'براہ کرم دوبارہ کوشش کریں۔',
    noInternet: 'انٹرنیٹ کنکشن نہیں ہے۔',
    timeout: 'درخواست کا وقت ختم ہو گیا۔',
  },

  empty: {
    noUniversities: 'کوئی یونیورسٹی نہیں ملی',
    noScholarships: 'کوئی وظیفہ دستیاب نہیں',
    noResults: 'کوئی نتائج نہیں ملے',
    noSavedItems: 'ابھی کوئی محفوظ آئٹم نہیں',
    noNotifications: 'کوئی اطلاعات نہیں',
  },

  success: {
    saved: 'کامیابی سے محفوظ ہو گیا',
    updated: 'کامیابی سے اپڈیٹ ہو گیا',
    deleted: 'کامیابی سے حذف ہو گیا',
    copied: 'کلپ بورڈ پر کاپی ہو گیا',
    shared: 'کامیابی سے شیئر ہو گیا',
    profileUpdated: 'پروفائل اپڈیٹ ہو گیا',
    settingsSaved: 'ترتیبات محفوظ ہو گئیں',
  },

  kidsHub: {
    title: 'بچوں کا حب',
    welcomeMessage: 'اپنا مستقبل دریافت کریں!',
    careerExplorer: 'کیریئر ایکسپلورر',
    interestQuiz: 'دلچسپی کا کوئز',
    goalSetting: 'ہدف مقرر کریں',
    subjectGuide: 'مضمون گائیڈ',
    studyTips: 'پڑھائی کے ٹپس',
  },

  career: {
    title: 'کیریئر گائیڈنس',
    findYourPath: 'اپنا راستہ تلاش کریں',
    takeQuiz: 'کیریئر کوئز لیں',
    exploreFields: 'فیلڈز دریافت کریں',
    roadmaps: 'کیریئر روڈ میپس',
    skills: 'ضروری مہارتیں',
    requirements: 'ضروریات',
    salaryRange: 'تنخواہ کی حد',
    jobOutlook: 'ملازمت کا نقطہ نظر',
  },
};

const translations: Record<Language, TranslationStrings> = {en, ur};

// ============================================================================
// LOCALIZATION SERVICE
// ============================================================================

const LANGUAGE_STORAGE_KEY = '@pakuni_language';

class LocalizationService {
  private currentLanguage: Language = 'en';
  private listeners: Set<(lang: Language) => void> = new Set();
  private isInitialized = false;

  /**
   * Initialize localization (load saved language preference)
   */
  async initialize(): Promise<void> {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ur')) {
        await this.setLanguage(savedLanguage, false);
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set language
   */
  async setLanguage(language: Language, persist = true): Promise<void> {
    this.currentLanguage = language;

    // Handle RTL for Urdu
    const isRTL = language === 'ur';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // Note: App restart required for RTL changes to take effect
    }

    if (persist) {
      try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }

    this.notifyListeners();
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    return this.currentLanguage === 'ur';
  }

  /**
   * Get translation for a key
   */
  t<K extends keyof TranslationStrings>(
    section: K,
    key: keyof TranslationStrings[K],
  ): string {
    const sectionStrings = translations[this.currentLanguage][section];
    return (sectionStrings as any)[key] || `${section}.${String(key)}`;
  }

  /**
   * Get all translations for current language
   */
  getTranslations(): TranslationStrings {
    return translations[this.currentLanguage];
  }

  /**
   * Subscribe to language changes
   */
  subscribe(listener: (lang: Language) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of language change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

// Export singleton instance
export const i18n = new LocalizationService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import {useState, useEffect, useCallback} from 'react';

/**
 * Hook to access translations
 */
export const useTranslations = (): TranslationStrings => {
  const [lang, setLang] = useState(i18n.getLanguage());

  useEffect(() => {
    return i18n.subscribe(setLang);
  }, []);

  return translations[lang];
};

/**
 * Hook to get a translation function
 */
export const useTranslation = () => {
  const [, setLang] = useState(i18n.getLanguage());

  useEffect(() => {
    return i18n.subscribe(setLang);
  }, []);

  const t = useCallback(
    <K extends keyof TranslationStrings>(
      section: K,
      key: keyof TranslationStrings[K],
    ): string => {
      return i18n.t(section, key);
    },
    [],
  );

  return {t, language: i18n.getLanguage(), isRTL: i18n.isRTL()};
};

/**
 * Hook to get and set current language
 */
export const useLanguage = (): [Language, (lang: Language) => Promise<void>] => {
  const [lang, setLang] = useState(i18n.getLanguage());

  useEffect(() => {
    return i18n.subscribe(setLang);
  }, []);

  const changeLanguage = useCallback(async (newLang: Language) => {
    await i18n.setLanguage(newLang);
  }, []);

  return [lang, changeLanguage];
};

export default i18n;
