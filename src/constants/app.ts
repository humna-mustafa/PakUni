// App-wide constants
export const APP_NAME = 'PakUni';

export const API_CONFIG = {
  BASE_URL: 'https://api.example.com', // Replace with your API URL
  TIMEOUT: 30000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@pakuni:auth_token',
  USER_DATA: '@pakuni:user_data',
  THEME: '@pakuni:theme',
  LANGUAGE: '@pakuni:language',
};

export const SCREENS = {
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  REGISTER: 'Register',
} as const;

// ============================================================================
// FEATURE COLORS - Consistent colors for features across all screens
// Ensures same feature uses same color everywhere for better UX & memory
// ============================================================================
export const FEATURE_COLORS = {
  // Tools & Calculators - Blue theme (#4573DF)
  calculator: '#4573DF',
  meritCalculator: '#4573DF',
  tools: '#4573DF',
  calculatorGradient: ['#4573DF', '#3660C9'] as const,
  
  // Entry Tests - Red theme (#DC2626)
  entryTests: '#DC2626',
  entryTestsGradient: ['#DC2626', '#EF4444'] as const,
  
  // Deadlines/Calendar - Orange-Red theme (#EF4444)
  deadlines: '#EF4444',
  deadlinesGradient: ['#EF4444', '#F87171'] as const,
  
  // Career/Guidance - Green theme (#059669)
  career: '#059669',
  careerGradient: ['#059669', '#10B981'] as const,
  
  // AI/Recommendations - Blue theme (#4573DF)
  recommendations: '#4573DF',
  aiMatch: '#4573DF',
  
  // Compare - Cyan theme (#0891B2)
  compare: '#0891B2',
  
  // Merit Archive - Slate theme (#64748B)
  meritArchive: '#64748B',
  
  // Guides/Study - Purple theme (#3660C9)
  guides: '#3660C9',
  studyTips: '#FBBF24',
  
  // Goals - Green theme (#10B981)
  goals: '#10B981',
  
  // Polls - Purple theme (#4573DF)
  polls: '#4573DF',
  
  // Result Game - Green theme (#10B981)
  resultGame: '#10B981',
  
  // Achievements - Amber theme (#F59E0B)
  achievements: '#F59E0B',
  
  // Quiz - Cyan theme (#06B6D4)
  quiz: '#06B6D4',
  
  // Roadmaps - Amber theme (#F59E0B)
  roadmaps: '#F59E0B',
  
  // Admin - Purple theme (#3660C9)
  admin: '#3660C9',
  adminGradient: ['#3660C9', '#4573DF'] as const,
  
  // Contribute/Data Correction - Green theme (#10B981)
  contribute: '#10B981',
  contributeGradient: ['#10B981', '#059669', '#047857'] as const,
  
  // Kids Hub - Pink theme (#4573DF)
  kidsHub: '#4573DF',
  kidsHubGradient: ['#4573DF', '#F472B6'] as const,
} as const;


