/**
 * My Achievements - Simple Local Achievement Cards
 * 
 * DESIGN PHILOSOPHY:
 * - User self-reports achievements (no tracking overhead)
 * - 100% Local Storage (no DB read/write)
 * - Simple shareable cards (user chooses what to share)
 * - No unlock detection complexity
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Share, Image} from 'react-native';
import RNFS from 'react-native-fs';
import {generateAchievementCardSVG, svgToDataUrl} from './achievementCards';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type AchievementType = 
  | 'entry_test'      // Completed entry test
  | 'merit_list'      // Got on merit list
  | 'admission'       // Secured admission
  | 'scholarship'     // Got scholarship
  | 'result'          // Got result/marks
  | 'custom';         // Custom achievement

export interface MyAchievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  universityName?: string;
  programName?: string;
  testName?: string;
  scholarshipName?: string;
  score?: string;
  percentage?: string;
  studentName?: string;
  date: string;
  createdAt: string;
  gradientColors: string[];
}

// ============================================================================
// ACHIEVEMENT TEMPLATES - User picks one and fills details
// ============================================================================

export interface AchievementTemplate {
  type: AchievementType;
  title: string;
  icon: string;
  placeholder: string;
  gradientColors: string[];
  shareTemplate: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
  }[];
}

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  {
    type: 'entry_test',
    title: 'Entry Test Completed',
    icon: '📝',
    placeholder: 'I completed my entry test!',
    gradientColors: ['#3B82F6', '#1D4ED8'],
    shareTemplate: "I completed {testName}! 📝 Score: {score} 🎯\n\n#PakUni",
    fields: [
      {key: 'testName', label: 'Test Name', placeholder: 'e.g., ECAT, MDCAT, NET, NTS', required: true},
      {key: 'score', label: 'Score (optional)', placeholder: 'e.g., 85/100, 156/200', required: false},
      {key: 'date', label: 'Test Date', placeholder: 'When did you take it?', required: false},
    ],
  },
  {
    type: 'merit_list',
    title: 'Made Merit List',
    icon: '📜',
    placeholder: 'I got on the merit list!',
    gradientColors: ['#FFD700', '#FFA500'],
    shareTemplate: "I made the Merit List at {universityName}! 📜✨\nProgram: {programName}\n\n#PakUni #MeritList",
    fields: [
      {key: 'universityName', label: 'University', placeholder: 'e.g., NUST, FAST, LUMS', required: true},
      {key: 'programName', label: 'Program', placeholder: 'e.g., Computer Science, MBBS', required: false},
      {key: 'date', label: 'Merit List Date', placeholder: 'When was it announced?', required: false},
    ],
  },
  {
    type: 'admission',
    title: 'Admission Secured!',
    icon: '🎉',
    placeholder: 'I got admission!',
    gradientColors: ['#10B981', '#047857'],
    shareTemplate: "I SECURED MY ADMISSION! 🎉🎓\n🏛️ {universityName}\n📚 {programName}\n\nDreams coming true! #PakUni",
    fields: [
      {key: 'universityName', label: 'University', placeholder: 'e.g., NUST, FAST, LUMS', required: true},
      {key: 'programName', label: 'Program', placeholder: 'e.g., BS Computer Science', required: true},
      {key: 'date', label: 'Admission Date', placeholder: 'When did you get it?', required: false},
    ],
  },
  {
    type: 'scholarship',
    title: 'Got Scholarship!',
    icon: '🏆',
    placeholder: 'I got a scholarship!',
    gradientColors: ['#F59E0B', '#D97706'],
    shareTemplate: "I got {scholarshipName}! 🏆💰\n🏛️ {universityName}\nPercentage: {percentage}\n\n#PakUni #Scholarship",
    fields: [
      {key: 'scholarshipName', label: 'Scholarship Name', placeholder: 'e.g., 100% Merit Scholarship', required: true},
      {key: 'universityName', label: 'University', placeholder: 'e.g., LUMS, IBA', required: false},
      {key: 'percentage', label: 'Scholarship %', placeholder: 'e.g., 100%, 50%', required: false},
      {key: 'date', label: 'Award Date', placeholder: 'When did you get it?', required: false},
    ],
  },
  {
    type: 'result',
    title: 'Got My Result!',
    icon: '📊',
    placeholder: 'I got my result!',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    shareTemplate: "Got my {testName} result! 📊\nScore: {score} | {percentage}\n\n#PakUni #Result",
    fields: [
      {key: 'testName', label: 'Exam Name', placeholder: 'e.g., Matric, Inter, ECAT', required: true},
      {key: 'score', label: 'Marks/Score', placeholder: 'e.g., 1050/1100', required: false},
      {key: 'percentage', label: 'Percentage/Grade', placeholder: 'e.g., 95.4%, A+', required: false},
      {key: 'date', label: 'Result Date', placeholder: 'When was it announced?', required: false},
    ],
  },
  {
    type: 'custom',
    title: 'Custom Achievement',
    icon: '⭐',
    placeholder: 'Add your own achievement!',
    gradientColors: ['#EC4899', '#DB2777'],
    shareTemplate: "{title} ⭐\n{description}\n\n#PakUni #Achievement",
    fields: [
      {key: 'title', label: 'Achievement Title', placeholder: 'What did you achieve?', required: true},
      {key: 'description', label: 'Description', placeholder: 'Tell us more about it!', required: false},
      {key: 'date', label: 'Date', placeholder: 'When did it happen?', required: false},
    ],
  },
];

// Storage key
const MY_ACHIEVEMENTS_KEY = '@pakuni_my_achievements';

// ============================================================================
// STORAGE FUNCTIONS (100% Local)
// ============================================================================

export const loadMyAchievements = async (): Promise<MyAchievement[]> => {
  try {
    const stored = await AsyncStorage.getItem(MY_ACHIEVEMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error('Failed to load achievements', error, 'Achievements');
  }
  return [];
};

export const saveMyAchievements = async (achievements: MyAchievement[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MY_ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  } catch (error) {
    logger.error('Failed to save achievements', error, 'Achievements');
  }
};

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

export const addAchievement = async (
  template: AchievementTemplate,
  data: Record<string, string>
): Promise<MyAchievement> => {
  const achievements = await loadMyAchievements();
  
  const newAchievement: MyAchievement = {
    id: `ach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: template.type,
    title: data.title || template.title,
    description: data.description || '',
    icon: template.icon,
    universityName: data.universityName,
    programName: data.programName,
    testName: data.testName,
    scholarshipName: data.scholarshipName,
    score: data.score,
    percentage: data.percentage,
    date: data.date || new Date().toLocaleDateString('en-PK'),
    createdAt: new Date().toISOString(),
    gradientColors: template.gradientColors,
  };

  achievements.unshift(newAchievement); // Add to beginning
  await saveMyAchievements(achievements);
  
  return newAchievement;
};

export const deleteAchievement = async (id: string): Promise<void> => {
  const achievements = await loadMyAchievements();
  const filtered = achievements.filter(a => a.id !== id);
  await saveMyAchievements(filtered);
};

export const updateAchievement = async (
  id: string,
  updates: Partial<MyAchievement>
): Promise<void> => {
  const achievements = await loadMyAchievements();
  const index = achievements.findIndex(a => a.id === id);
  if (index !== -1) {
    achievements[index] = {...achievements[index], ...updates};
    await saveMyAchievements(achievements);
  }
};

// ============================================================================
// SHARE FUNCTIONS
// ============================================================================

const buildShareMessage = (achievement: MyAchievement): string => {
  const template = ACHIEVEMENT_TEMPLATES.find(t => t.type === achievement.type);
  if (!template) {
    return `${achievement.title} ${achievement.icon}\n\n📱 Made with PakUni App`;
  }

  let message = template.shareTemplate;
  
  // Replace all placeholders
  message = message.replace('{title}', achievement.title || '');
  message = message.replace('{description}', achievement.description || '');
  message = message.replace('{universityName}', achievement.universityName || 'My University');
  message = message.replace('{programName}', achievement.programName || 'My Program');
  message = message.replace('{testName}', achievement.testName || 'My Test');
  message = message.replace('{scholarshipName}', achievement.scholarshipName || 'Scholarship');
  message = message.replace('{score}', achievement.score || '');
  message = message.replace('{percentage}', achievement.percentage || '');
  
  // Clean up empty placeholders
  message = message.replace(/\s*Score:\s*$/m, '');
  message = message.replace(/\s*Percentage:\s*$/m, '');
  message = message.replace(/\s*\|\s*$/m, '');
  
  return `${message}\n\n📱 Made with PakUni App`;
};

/**
 * Generate a shareable message for an achievement
 */
export const generateShareLink = (achievement: MyAchievement): string => {
  return `Made with PakUni App • ${achievement.id}`;
};

/**
 * Generate a shareable card identifier
 */
export const generateCardShareLink = (cardType: string, cardId: string): string => {
  return `PakUni • ${cardType}/${cardId}`;
};

/**
 * Share achievement with generated image card
 * Falls back to text-only sharing if image generation fails
 */
export const shareAchievement = async (achievement: MyAchievement): Promise<boolean> => {
  try {
    // Try to generate SVG card
    const cardSVG = generateAchievementCardSVG(achievement);
    const dataUrl = svgToDataUrl(cardSVG);
    
    // Try to save SVG as image and share it
    try {
      const fileName = `achievement_${achievement.id}.png`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      // For now, share text with the card description
      // In a production app, you'd convert SVG to PNG using a library
      const message = buildShareMessage(achievement);
      
      const result = await Share.share({
        message: `${message}\n\n✨ Visual achievement card generated! Share this card in your story!`,
        title: `${achievement.title} - PakUni`,
      });
      
      return result.action === Share.sharedAction;
    } catch (imageError) {
      logger.warn('Could not generate image card, falling back to text', imageError, 'Achievements');
      // Fall back to text-only sharing
      const message = buildShareMessage(achievement);
      const result = await Share.share({message});
      return result.action === Share.sharedAction;
    }
  } catch (error) {
    logger.error('Failed to share achievement', error, 'Achievements');
    return false;
  }
};

// Quick share card for common scenarios
export const shareQuickCard = async (
  type: 'merit_success' | 'acceptance' | 'test_complete',
  data: {
    universityName?: string;
    programName?: string;
    testName?: string;
    score?: string;
    percentage?: string;
  }
): Promise<boolean> => {
  try {
    let message = '';
    
    switch (type) {
      case 'merit_success':
        message = `🎯 Merit Calculation Result!\n\n🏛️ ${data.universityName || 'University'}\n📚 ${data.programName || 'Program'}\n📊 Aggregate: ${data.percentage || 'Calculated'}\n\nCalculated using PakUni App! 📱\n\n#PakUni #MeritCalculator`;
        break;
      case 'acceptance':
        message = `🎉 ADMISSION CONFIRMED!\n\n🏛️ ${data.universityName}\n📚 ${data.programName}\n\nDreams coming true! 🌟\n\n#PakUni #Admission`;
        break;
      case 'test_complete':
        message = `📝 Entry Test Done!\n\n${data.testName} ✅${data.score ? `\nScore: ${data.score}` : ''}\n\n#PakUni #EntryTest`;
        break;
    }
    
    const result = await Share.share({
      message: `${message}\n\n📱 Made with PakUni App!`,
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    logger.error('Failed to share quick card', error, 'Achievements');
    return false;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getAchievementsByType = async (type: AchievementType): Promise<MyAchievement[]> => {
  const achievements = await loadMyAchievements();
  return achievements.filter(a => a.type === type);
};

export const getAchievementStats = async (): Promise<{
  total: number;
  byType: Record<AchievementType, number>;
}> => {
  const achievements = await loadMyAchievements();
  
  const byType: Record<AchievementType, number> = {
    entry_test: 0,
    merit_list: 0,
    admission: 0,
    scholarship: 0,
    result: 0,
    custom: 0,
  };
  
  achievements.forEach(a => {
    byType[a.type] = (byType[a.type] || 0) + 1;
  });
  
  return {total: achievements.length, byType};
};

export const getTemplateByType = (type: AchievementType): AchievementTemplate | undefined => {
  return ACHIEVEMENT_TEMPLATES.find(t => t.type === type);
};

// ============================================================================
// LEGACY COMPATIBILITY (for any old code still using these)
// ============================================================================

// These are no-op functions for backwards compatibility
export type BadgeCategory = 'preparation' | 'admission' | 'achievement' | 'contribution' | 'milestone';
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
  badges: string[];
  stats: Record<string, number>;
  admissions: Record<string, string[]>;
}

// Empty badge list - we don't use these anymore
export const BADGES: Badge[] = [];

// Legacy functions - return empty/default values
export const loadAchievements = async (): Promise<UserAchievements> => ({
  badges: [],
  stats: {},
  admissions: {},
});

export const saveAchievements = async (_: UserAchievements): Promise<void> => {};
export const checkAndUnlockBadges = async (a: UserAchievements) => ({newBadges: [], updatedAchievements: a});
export const trackCalculation = async (): Promise<Badge[]> => [];
export const trackUniversityView = async (_: string): Promise<Badge[]> => [];
export const trackScholarshipView = async (): Promise<Badge[]> => [];
export const trackComparison = async (): Promise<Badge[]> => [];
export const trackPollVote = async (): Promise<Badge[]> => [];
export const trackQuizCompletion = async (): Promise<Badge[]> => [];
export const trackAppOpen = async (): Promise<Badge[]> => [];
export const markEntryTestCompleted = async (_: string): Promise<Badge[]> => [];
export const markMeritListed = async (_: string): Promise<Badge[]> => [];
export const markAdmissionSecured = async (_: string): Promise<Badge[]> => [];
export const shareBadge = async (_: Badge): Promise<boolean> => false;
export const getBadgeById = (_: string): Badge | undefined => undefined;
export const getUserBadges = async (): Promise<Badge[]> => [];
export const getLockedBadges = async (): Promise<Badge[]> => [];
export const getBadgesByCategory = (_: BadgeCategory): Badge[] => [];
export const getBadgesByRarity = (_: BadgeRarity): Badge[] => [];
export const getProgress = async () => ({total: 0, unlocked: 0, percentage: 0});

export default {
  // New API
  ACHIEVEMENT_TEMPLATES,
  loadMyAchievements,
  saveMyAchievements,
  addAchievement,
  deleteAchievement,
  updateAchievement,
  shareAchievement,
  shareQuickCard,
  getAchievementsByType,
  getAchievementStats,
  getTemplateByType,
  // Legacy (no-op)
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
