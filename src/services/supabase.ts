import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import {logger} from '../utils/logger';

// Load from environment variables for security
// IMPORTANT: In production builds, set these in .env file
// Never commit actual API keys to version control
const supabaseUrl = Config.SUPABASE_URL || '';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY || '';

// Log config for debugging (will be removed in production)
if (__DEV__) {
  console.log('[Supabase] URL configured:', supabaseUrl ? 'Yes' : 'No');
  console.log('[Supabase] Key configured:', supabaseAnonKey ? 'Yes' : 'No');
}

// Security: Validate and prevent localhost/test credentials
const isLocalhost = (url: string): boolean => {
  if (!url) return false;
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('0.0.0.0') ||
    url.includes('placeholder')
  );
};

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn(
    'Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file. App will operate in offline mode.',
    undefined,
    'Supabase'
  );
}

// SECURITY: Block localhost/placeholder credentials from being used
if (supabaseUrl && isLocalhost(supabaseUrl)) {
  logger.error(
    'SECURITY ERROR: Detected localhost/placeholder Supabase URL in configuration.',
    undefined,
    'Supabase'
  );
}

// Create client - will be in offline mode if credentials missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // FREE TIER OPTIMIZATION: Longer storage key to avoid conflicts
      storageKey: 'pakuni-auth-token',
      // Keep session data fresh but don't constantly poll
      flowType: 'implicit',
    },
    // FREE TIER OPTIMIZATION: Disable realtime to save connections
    realtime: {
      params: {
        eventsPerSecond: 0, // Disable realtime events
      },
    },
    // Reduce unnecessary network requests
    global: {
      headers: {
        'X-Client-Info': 'pakuni-mobile',
      },
    },
  }
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));
};

// Database types
export type EducationSystem =
  | 'fsc_pre_medical'
  | 'fsc_pre_engineering'
  | 'ics'
  | 'icom'
  | 'fa'
  | 'dae'
  | 'o_levels'
  | 'a_levels';

export type UniversityType = 'public' | 'private' | 'semi_government';

export type Province =
  | 'punjab'
  | 'sindh'
  | 'kpk'
  | 'balochistan'
  | 'islamabad'
  | 'azad_kashmir'
  | 'gilgit_baltistan';

export type ScholarshipType =
  | 'merit_based'
  | 'need_based'
  | 'sports'
  | 'hafiz_e_quran'
  | 'disabled'
  | 'government'
  | 'private';

export interface University {
  id: string;
  name: string;
  short_name: string | null;
  type: UniversityType;
  province: Province;
  city: string;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  established_year: number | null;
  ranking_hec: string | null;
  is_hec_recognized: boolean;
  admission_open: boolean;
}

export interface Program {
  id: string;
  university_id: string;
  field_id: string | null;
  name: string;
  degree_title: string | null;
  level: string;
  duration_years: number | null;
  min_percentage: number | null;
  seats_total: number | null;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string | null;
  type: ScholarshipType;
  description: string | null;
  coverage_percentage: number | null;
  covers_tuition: boolean;
  covers_hostel: boolean;
  monthly_stipend: number | null;
  min_percentage: number | null;
  is_active: boolean;
}

export interface MeritFormula {
  id: string;
  name: string;
  description: string | null;
  matric_weightage: number;
  inter_weightage: number;
  entry_test_weightage: number;
  hafiz_bonus: number;
  applicable_education: EducationSystem[];
}

export interface Field {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}
