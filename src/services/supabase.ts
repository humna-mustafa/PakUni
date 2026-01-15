import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';

// Load from environment variables for security
const supabaseUrl = Config.SUPABASE_URL || 'https://therewjnnidxlddgkaca.supabase.co';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZXJld2pubmlkeGxkZGdrYWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjMxMjEsImV4cCI6MjA4Mzg5OTEyMX0.h5wPplUUJFIErD6S765UW-L4x4j1Lskcbq-9x4ztH5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
