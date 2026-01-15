/**
 * Achievement & Badge System Service
 * Tracks user milestones and generates shareable badges
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Share, Platform} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export type BadgeCategory = 
  | 'preparation' 
  | 'admission' 
  | 'achievement' 
  | 'contribution' 
  | 'milestone';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  condition: string;
  gradientColors: string[];
  unlockedAt?: string;
  shareMessage: string;
}

export interface UserAchievements {
  badges: string[]; // Array of badge IDs
  stats: {
    calculationsPerformed: number;
    universitiesViewed: number;
    scholarshipsViewed: number;
    quizzesTaken: number;
    pollsVoted: number;
    comparisons: number;
    appOpenStreak: number;
    lastOpenDate: string;
    totalTimeSpent: number; // in minutes
    profileCompleteness: number;
  };
  admissions: {
    appliedTo: string[];
    acceptedAt: string[];
    entryTestsTaken: string[];
    meritListedAt: string[];
  };
}

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export const BADGES: Badge[] = [
  // PREPARATION BADGES
  {
    id: 'entry_test_ready',
    name: 'Entry Test Ready!',
    description: 'Prepared for your entry test',
    icon: '📝',
    category: 'preparation',
    rarity: 'common',
    condition: 'Viewed 5 entry test guides',
    gradientColors: ['#3B82F6', '#1D4ED8'],
    shareMessage: "I'm Entry Test Ready! 📝 Preparing for my future with PakUni App 🚀",
  },
  {
    id: 'calculator_pro',
    name: 'Calculator Pro',
    description: 'Mastered merit calculation',
    icon: '🧮',
    category: 'preparation',
    rarity: 'common',
    condition: 'Calculated merit 10 times',
    gradientColors: ['#10B981', '#059669'],
    shareMessage: "I'm a Calculator Pro! 🧮 Calculated my university chances on PakUni App 📊",
  },
  {
    id: 'scholar_hunter',
    name: 'Scholarship Hunter',
    description: 'Explored scholarship opportunities',
    icon: '🎓',
    category: 'preparation',
    rarity: 'rare',
    condition: 'Viewed 20 scholarships',
    gradientColors: ['#F59E0B', '#D97706'],
    shareMessage: "I'm a Scholarship Hunter! 🎓 Finding opportunities on PakUni App 💰",
  },
  {
    id: 'university_explorer',
    name: 'University Explorer',
    description: 'Researched many universities',
    icon: '🏛️',
    category: 'preparation',
    rarity: 'common',
    condition: 'Viewed 25 universities',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    shareMessage: "I'm a University Explorer! 🏛️ Researching my options on PakUni App 🔍",
  },
  {
    id: 'career_navigator',
    name: 'Career Navigator',
    description: 'Found your career direction',
    icon: '🧭',
    category: 'preparation',
    rarity: 'rare',
    condition: 'Completed career quiz and viewed 10 careers',
    gradientColors: ['#EC4899', '#DB2777'],
    shareMessage: "I'm a Career Navigator! 🧭 Found my path on PakUni App 🎯",
  },
  {
    id: 'compare_master',
    name: 'Compare Master',
    description: 'Expert at comparing universities',
    icon: '⚖️',
    category: 'preparation',
    rarity: 'common',
    condition: 'Made 5 university comparisons',
    gradientColors: ['#06B6D4', '#0891B2'],
    shareMessage: "I'm a Compare Master! ⚖️ Making informed decisions with PakUni App 📈",
  },

  // ADMISSION BADGES
  {
    id: 'test_warrior',
    name: 'Test Warrior',
    description: 'Completed an entry test',
    icon: '⚔️',
    category: 'admission',
    rarity: 'rare',
    condition: 'Marked entry test as completed',
    gradientColors: ['#EF4444', '#DC2626'],
    shareMessage: "I'm a Test Warrior! ⚔️ Completed my entry test! 💪 #PakUni",
  },
  {
    id: 'merit_listed',
    name: 'Merit Listed',
    description: 'Made it to a merit list!',
    icon: '📜',
    category: 'admission',
    rarity: 'epic',
    condition: 'User marked as merit listed',
    gradientColors: ['#FFD700', '#FFA500'],
    shareMessage: "I made the Merit List! 📜✨ One step closer to my dream! #PakUni 🎯",
  },
  {
    id: 'admission_secured',
    name: 'Admission Secured!',
    description: 'Got admission in a university!',
    icon: '🎉',
    category: 'admission',
    rarity: 'legendary',
    condition: 'User marked admission as secured',
    gradientColors: ['#10B981', '#047857'],
    shareMessage: "I SECURED MY ADMISSION! 🎉🎓 Dreams coming true! Thank you PakUni! 🚀",
  },
  {
    id: 'double_admit',
    name: 'Double Admit',
    description: 'Got into 2+ universities!',
    icon: '🌟',
    category: 'admission',
    rarity: 'legendary',
    condition: 'Admitted to 2 or more universities',
    gradientColors: ['#7C3AED', '#5B21B6'],
    shareMessage: "Got admission in MULTIPLE universities! 🌟🌟 Choices, choices! #PakUni",
  },

  // ACHIEVEMENT BADGES
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Started preparing early',
    icon: '🐦',
    category: 'achievement',
    rarity: 'common',
    condition: 'Used app before admission season',
    gradientColors: ['#FB923C', '#EA580C'],
    shareMessage: "Early bird gets the admission! 🐦 Preparing ahead with PakUni App! 📚",
  },
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    description: '7-day app usage streak',
    icon: '🔥',
    category: 'achievement',
    rarity: 'rare',
    condition: 'Used app 7 days in a row',
    gradientColors: ['#F97316', '#C2410C'],
    shareMessage: "7-day streak! 🔥 Staying focused on my goals with PakUni App! 💯",
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Used all major features',
    icon: '⚡',
    category: 'achievement',
    rarity: 'epic',
    condition: 'Used calculator, explorer, compare, career quiz',
    gradientColors: ['#FBBF24', '#F59E0B'],
    shareMessage: "I'm a PakUni Power User! ⚡ Using every tool to succeed! 🎯",
  },

  // CONTRIBUTION BADGES
  {
    id: 'poll_participant',
    name: 'Poll Participant',
    description: 'Active community member',
    icon: '🗳️',
    category: 'contribution',
    rarity: 'common',
    condition: 'Voted in 10 polls',
    gradientColors: ['#6366F1', '#4F46E5'],
    shareMessage: "Making my voice heard! 🗳️ Active in PakUni community polls! 📊",
  },
  {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Valuable community member',
    icon: '👑',
    category: 'contribution',
    rarity: 'legendary',
    condition: 'Voted in 50 polls and shared 10 results',
    gradientColors: ['#FFD700', '#B8860B'],
    shareMessage: "I'm a Top Contributor! 👑 Helping the PakUni community grow! 🌟",
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Sharing is caring!',
    icon: '🦋',
    category: 'contribution',
    rarity: 'rare',
    condition: 'Shared content 5 times',
    gradientColors: ['#A855F7', '#9333EA'],
    shareMessage: "Spreading the word about PakUni! 🦋 Join me on the journey! 🚀",
  },

  // MILESTONE BADGES
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Started your journey',
    icon: '👣',
    category: 'milestone',
    rarity: 'common',
    condition: 'Completed first merit calculation',
    gradientColors: ['#64748B', '#475569'],
    shareMessage: "Taking my First Step! 👣 Started my university journey on PakUni! 🌱",
  },
  {
    id: 'profile_complete',
    name: 'Profile Complete',
    description: 'Set up your profile',
    icon: '✅',
    category: 'milestone',
    rarity: 'common',
    condition: 'Completed profile setup',
    gradientColors: ['#22C55E', '#16A34A'],
    shareMessage: "Profile Complete! ✅ Ready to explore universities on PakUni! 🎯",
  },
  {
    id: 'goal_setter',
    name: 'Goal Setter',
    description: 'Set your target university',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    condition: 'Set a goal in the app',
    gradientColors: ['#EF4444', '#B91C1C'],
    shareMessage: "Goals Set! 🎯 Working towards my dream university with PakUni! 💪",
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: '100 days of using PakUni',
    icon: '💯',
    category: 'milestone',
    rarity: 'legendary',
    condition: 'Used app for 100 days',
    gradientColors: ['#DC2626', '#991B1B'],
    shareMessage: "100 Days Strong! 💯 Dedicated to my future with PakUni! 🏆",
  },
];

// Storage key
const ACHIEVEMENTS_KEY = '@pakuni_achievements';

// ============================================================================
// DEFAULT STATE
// ============================================================================

const getDefaultAchievements = (): UserAchievements => ({
  badges: [],
  stats: {
    calculationsPerformed: 0,
    universitiesViewed: 0,
    scholarshipsViewed: 0,
    quizzesTaken: 0,
    pollsVoted: 0,
    comparisons: 0,
    appOpenStreak: 0,
    lastOpenDate: '',
    totalTimeSpent: 0,
    profileCompleteness: 0,
  },
  admissions: {
    appliedTo: [],
    acceptedAt: [],
    entryTestsTaken: [],
    meritListedAt: [],
  },
});

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

export const loadAchievements = async (): Promise<UserAchievements> => {
  try {
    const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load achievements:', error);
  }
  return getDefaultAchievements();
};

export const saveAchievements = async (achievements: UserAchievements): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
};

// ============================================================================
// BADGE CHECK FUNCTIONS
// ============================================================================

export const checkAndUnlockBadges = async (
  achievements: UserAchievements
): Promise<{newBadges: Badge[]; updatedAchievements: UserAchievements}> => {
  const newBadges: Badge[] = [];
  const now = new Date().toISOString();

  // Check each badge condition
  for (const badge of BADGES) {
    if (achievements.badges.includes(badge.id)) continue;

    let shouldUnlock = false;

    switch (badge.id) {
      case 'first_step':
        shouldUnlock = achievements.stats.calculationsPerformed >= 1;
        break;
      case 'calculator_pro':
        shouldUnlock = achievements.stats.calculationsPerformed >= 10;
        break;
      case 'university_explorer':
        shouldUnlock = achievements.stats.universitiesViewed >= 25;
        break;
      case 'scholar_hunter':
        shouldUnlock = achievements.stats.scholarshipsViewed >= 20;
        break;
      case 'compare_master':
        shouldUnlock = achievements.stats.comparisons >= 5;
        break;
      case 'poll_participant':
        shouldUnlock = achievements.stats.pollsVoted >= 10;
        break;
      case 'top_contributor':
        shouldUnlock = achievements.stats.pollsVoted >= 50;
        break;
      case 'streak_champion':
        shouldUnlock = achievements.stats.appOpenStreak >= 7;
        break;
      case 'career_navigator':
        shouldUnlock = achievements.stats.quizzesTaken >= 1;
        break;
      case 'entry_test_ready':
        shouldUnlock = achievements.stats.universitiesViewed >= 5;
        break;
      case 'test_warrior':
        shouldUnlock = achievements.admissions.entryTestsTaken.length >= 1;
        break;
      case 'merit_listed':
        shouldUnlock = achievements.admissions.meritListedAt.length >= 1;
        break;
      case 'admission_secured':
        shouldUnlock = achievements.admissions.acceptedAt.length >= 1;
        break;
      case 'double_admit':
        shouldUnlock = achievements.admissions.acceptedAt.length >= 2;
        break;
      case 'profile_complete':
        shouldUnlock = achievements.stats.profileCompleteness >= 100;
        break;
      case 'power_user':
        shouldUnlock = 
          achievements.stats.calculationsPerformed >= 1 &&
          achievements.stats.universitiesViewed >= 10 &&
          achievements.stats.comparisons >= 1 &&
          achievements.stats.quizzesTaken >= 1;
        break;
    }

    if (shouldUnlock) {
      newBadges.push({...badge, unlockedAt: now});
      achievements.badges.push(badge.id);
    }
  }

  if (newBadges.length > 0) {
    await saveAchievements(achievements);
  }

  return {newBadges, updatedAchievements: achievements};
};

// ============================================================================
// TRACKING FUNCTIONS
// ============================================================================

export const trackCalculation = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  achievements.stats.calculationsPerformed += 1;
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const trackUniversityView = async (universityId: string): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  achievements.stats.universitiesViewed += 1;
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const trackScholarshipView = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  achievements.stats.scholarshipsViewed += 1;
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const trackComparison = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  achievements.stats.comparisons += 1;
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const trackPollVote = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  achievements.stats.pollsVoted += 1;
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const trackQuizCompletion = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  achievements.stats.quizzesTaken += 1;
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const trackAppOpen = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  const today = new Date().toDateString();
  
  if (achievements.stats.lastOpenDate !== today) {
    const lastDate = new Date(achievements.stats.lastOpenDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      achievements.stats.appOpenStreak += 1;
    } else if (diffDays > 1) {
      achievements.stats.appOpenStreak = 1;
    }
    
    achievements.stats.lastOpenDate = today;
  }
  
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

// ============================================================================
// ADMISSION TRACKING
// ============================================================================

export const markEntryTestCompleted = async (testId: string): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  if (!achievements.admissions.entryTestsTaken.includes(testId)) {
    achievements.admissions.entryTestsTaken.push(testId);
  }
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const markMeritListed = async (universityId: string): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  if (!achievements.admissions.meritListedAt.includes(universityId)) {
    achievements.admissions.meritListedAt.push(universityId);
  }
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

export const markAdmissionSecured = async (universityId: string): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  if (!achievements.admissions.acceptedAt.includes(universityId)) {
    achievements.admissions.acceptedAt.push(universityId);
  }
  const {newBadges} = await checkAndUnlockBadges(achievements);
  return newBadges;
};

// ============================================================================
// SHARE FUNCTIONS
// ============================================================================

export const shareBadge = async (badge: Badge): Promise<boolean> => {
  try {
    const result = await Share.share({
      message: `${badge.shareMessage}\n\n📱 Download PakUni - Your University Guide!\nhttps://pakuni.app`,
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Failed to share badge:', error);
    return false;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(b => b.id === id);
};

export const getUserBadges = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  return achievements.badges
    .map(id => getBadgeById(id))
    .filter((b): b is Badge => b !== undefined);
};

export const getLockedBadges = async (): Promise<Badge[]> => {
  const achievements = await loadAchievements();
  return BADGES.filter(b => !achievements.badges.includes(b.id));
};

export const getBadgesByCategory = (category: BadgeCategory): Badge[] => {
  return BADGES.filter(b => b.category === category);
};

export const getBadgesByRarity = (rarity: BadgeRarity): Badge[] => {
  return BADGES.filter(b => b.rarity === rarity);
};

export const getProgress = async (): Promise<{
  total: number;
  unlocked: number;
  percentage: number;
}> => {
  const achievements = await loadAchievements();
  const total = BADGES.length;
  const unlocked = achievements.badges.length;
  return {
    total,
    unlocked,
    percentage: Math.round((unlocked / total) * 100),
  };
};

export default {
  BADGES,
  loadAchievements,
  saveAchievements,
  checkAndUnlockBadges,
  trackCalculation,
  trackUniversityView,
  trackScholarshipView,
  trackComparison,
  trackPollVote,
  trackQuizCompletion,
  trackAppOpen,
  markEntryTestCompleted,
  markMeritListed,
  markAdmissionSecured,
  shareBadge,
  getBadgeById,
  getUserBadges,
  getLockedBadges,
  getBadgesByCategory,
  getBadgesByRarity,
  getProgress,
};
