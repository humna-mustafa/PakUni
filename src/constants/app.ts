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
