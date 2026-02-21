/**
 * Onboarding screen data, types, and helpers.
 */
import {Vibration, Platform} from 'react-native';

export interface OnboardingSlide {
  id: string;
  iconName: string;
  iconFamily: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string[];
  particleColors: string[];
  illustration: 'university' | 'calculator' | 'scholarship' | 'guides' | 'tools' | 'deadlines' | 'achievements' | 'ai';
  stat?: string;
  statLabel?: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1', iconName: 'graduation-cap', iconFamily: 'Custom',
    title: 'Discover Your Future', subtitle: '200+ Universities',
    description: 'Explore all HEC-recognized universities across Pakistan. Find the perfect match for your dreams with smart filters and detailed insights.',
    gradient: ['#4573DF', '#3660C9'], particleColors: ['#4573DF', '#60A5FA', '#93C5FD', '#3B82F6'],
    illustration: 'university', stat: '200+', statLabel: 'Universities',
  },
  {
    id: '2', iconName: 'calculator', iconFamily: 'Ionicons',
    title: 'Know Your Chances', subtitle: 'Smart Merit Calculator',
    description: 'Use intelligent calculators with real university formulas. See your admission chances instantly and plan strategically.',
    gradient: ['#10B981', '#059669'], particleColors: ['#10B981', '#34D399', '#6EE7B7', '#047857'],
    illustration: 'calculator', stat: '15+', statLabel: 'Calculators',
  },
  {
    id: '3', iconName: 'ribbon', iconFamily: 'Ionicons',
    title: 'Fund Your Education', subtitle: 'Scholarships & Grants',
    description: 'Discover merit-based, need-based, and special scholarships. Get personalized alerts for opportunities matching your profile.',
    gradient: ['#F59E0B', '#D97706'], particleColors: ['#F59E0B', '#FBBF24', '#FCD34D', '#B45309'],
    illustration: 'scholarship', stat: '50+', statLabel: 'Scholarships',
  },
  {
    id: '4', iconName: 'book', iconFamily: 'Ionicons',
    title: 'Expert Guidance', subtitle: 'Comprehensive Guides',
    description: 'From admission processes to career planning, study tips to mental wellness - everything you need for academic success.',
    gradient: ['#0891B2', '#0E7490'], particleColors: ['#0891B2', '#22D3EE', '#67E8F9', '#06B6D4'],
    illustration: 'guides', stat: '30+', statLabel: 'Guides',
  },
  {
    id: '5', iconName: 'construct', iconFamily: 'Ionicons',
    title: 'Powerful Tools', subtitle: 'Plan & Simulate',
    description: 'Grade converters, target calculators, what-if simulators, and comparison tools - plan your academic journey with precision.',
    gradient: ['#8B5CF6', '#7C3AED'], particleColors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#6D28D9'],
    illustration: 'tools', stat: '20+', statLabel: 'Tools',
  },
  {
    id: '6', iconName: 'time', iconFamily: 'Ionicons',
    title: 'Never Miss Out', subtitle: 'Deadline Tracker',
    description: "Set custom countdowns for entry tests, admission deadlines, and scholarship dates. Get smart reminders so you're always prepared.",
    gradient: ['#EF4444', '#DC2626'], particleColors: ['#EF4444', '#F87171', '#FCA5A5', '#B91C1C'],
    illustration: 'deadlines', stat: '100%', statLabel: 'On Track',
  },
  {
    id: '7', iconName: 'trophy', iconFamily: 'Ionicons',
    title: 'Celebrate Success', subtitle: 'Achievements & Sharing',
    description: 'Earn badges for milestones, create shareable merit cards, and celebrate your journey with friends and family.',
    gradient: ['#F97316', '#EA580C'], particleColors: ['#F97316', '#FB923C', '#FDBA74', '#C2410C'],
    illustration: 'achievements', stat: '🏆', statLabel: 'Earn Badges',
  },
  {
    id: '8', iconName: 'sparkles', iconFamily: 'Ionicons',
    title: 'AI-Powered Matches', subtitle: 'Smart Recommendations',
    description: 'Get personalized university recommendations based on your marks, interests, location, and career goals. Your perfect match awaits!',
    gradient: ['#4573DF', '#6366F1'], particleColors: ['#4573DF', '#818CF8', '#A5B4FC', '#4F46E5'],
    illustration: 'ai', stat: '✨', statLabel: 'Personalized',
  },
];

export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Welcome';
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (Platform.OS === 'android') {
    const durations = {light: 10, medium: 20, heavy: 30};
    Vibration.vibrate(durations[type]);
  }
};
