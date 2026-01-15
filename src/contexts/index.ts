/**
 * Contexts index file
 * Export all React contexts
 */

export {ThemeProvider, useTheme, ThemeContext, lightColors, darkColors} from './ThemeContext';
export type {ThemeColors, ThemeMode} from './ThemeContext';

// Authentication Context
export {AuthProvider, useAuth} from './AuthContext';
export type {UserProfile, AuthState, AuthContextType, AuthProvider as AuthProviderType} from './AuthContext';
