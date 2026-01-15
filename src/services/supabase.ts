import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import {logger} from '../utils/logger';

// Load from environment variables for security
// IMPORTANT: In production builds, set these in .env file
// Never commit actual API keys to version control
const supabaseUrl = Config.SUPABASE_URL;
const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn(
    'Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.',
    undefined,
    'Supabase'
  );
}

// Use fallback empty values to prevent crash during development
// App will work in offline mode with bundled data
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeSupabaseAnonKey = supabaseAnonKey || 'placeholder_key';

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
