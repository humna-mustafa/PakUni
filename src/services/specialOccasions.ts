/**
 * Special Occasions Service
 * Handles birthday wishes, exam day wishes, and personalized messages
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENTRY_TESTS_DATA} from '../data';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
  name: string;
  birthDate?: string; // ISO date string
  registeredTests?: string[]; // Array of test IDs user is preparing for
  targetUniversities?: string[];
}

export interface SpecialOccasion {
  type: 'birthday' | 'exam_day' | 'result_day' | 'deadline' | 'motivation';
  title: string;
  message: string;
  emoji: string;
  gradientColors: string[];
  actionLabel?: string;
  actionRoute?: string;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const USER_PROFILE_KEY = '@pakuni_user_profile';
const SHOWN_WISHES_KEY = '@pakuni_shown_wishes';

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

const BIRTHDAY_MESSAGES = [
  {
    title: '🎂 Happy Birthday!',
    message: "Wishing you a fantastic birthday, {name}! May this year bring you closer to your dream university! 🎓✨",
    emoji: '🎂',
  },
  {
    title: '🎉 Birthday Wishes!',
    message: "Happy Birthday, {name}! Your dedication to your goals inspires us. Keep shining! 🌟",
    emoji: '🎉',
  },
  {
    title: '🎈 Special Day!',
    message: "It's your special day, {name}! May your birthday be filled with joy and your dreams with success! 🎯",
    emoji: '🎈',
  },
];

const EXAM_DAY_MESSAGES = [
  {
    title: '💪 You Got This!',
    message: "Good luck on your {testName} today, {name}! Remember, you've prepared for this. Trust yourself! 🌟",
    emoji: '💪',
  },
  {
    title: '🍀 Best of Luck!',
    message: "Today is your {testName} day! Stay calm, stay focused, and give it your best shot! You've got this! 🎯",
    emoji: '🍀',
  },
  {
    title: '⭐ Shine Bright!',
    message: "Your {testName} is today! All your hard work leads to this moment. Go in there and shine! ✨",
    emoji: '⭐',
  },
];

const RESULT_DAY_MESSAGES = [
  {
    title: '🤞 Results Day!',
    message: "{testName} results are out! Whatever the outcome, your effort matters. Check your results with confidence! 📊",
    emoji: '🤞',
  },
];

const MOTIVATION_MESSAGES = [
  {
    title: '🌅 New Day, New Goals!',
    message: "Every day is a chance to get closer to your dream university. Keep pushing, {name}! 💪",
    emoji: '🌅',
  },
  {
    title: '📚 Study Tip',
    message: "Remember: Consistent small efforts beat occasional big ones. You're doing great, {name}! 🎯",
    emoji: '📚',
  },
  {
    title: '🚀 Keep Going!',
    message: "Your future self will thank you for the effort you put in today. Stay motivated! 🌟",
    emoji: '🚀',
  },
];

// ============================================================================
// PROFILE FUNCTIONS
// ============================================================================

export const loadUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    logger.error('Failed to load user profile', error, 'SpecialOccasions');
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    logger.error('Failed to save user profile', error, 'SpecialOccasions');
  }
};

export const updateUserBirthday = async (birthDate: string): Promise<void> => {
  const profile = await loadUserProfile() || {name: 'Student'};
  profile.birthDate = birthDate;
  await saveUserProfile(profile);
};

export const registerForTest = async (testId: string): Promise<void> => {
  const profile = await loadUserProfile() || {name: 'Student', registeredTests: []};
  if (!profile.registeredTests) {
    profile.registeredTests = [];
  }
  if (!profile.registeredTests.includes(testId)) {
    profile.registeredTests.push(testId);
  }
  await saveUserProfile(profile);
};

// ============================================================================
// WISH TRACKING
// ============================================================================

const getShownWishes = async (): Promise<string[]> => {
  try {
    const stored = await AsyncStorage.getItem(SHOWN_WISHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const markWishAsShown = async (wishId: string): Promise<void> => {
  try {
    const shown = await getShownWishes();
    const today = new Date().toDateString();
    const wishKey = `${wishId}_${today}`;
    
    if (!shown.includes(wishKey)) {
      shown.push(wishKey);
      // Keep only last 30 days of wishes
      const recentWishes = shown.slice(-100);
      await AsyncStorage.setItem(SHOWN_WISHES_KEY, JSON.stringify(recentWishes));
    }
  } catch (error) {
    logger.error('Failed to mark wish as shown', error, 'SpecialOccasions');
  }
};

const hasShownWishToday = async (wishId: string): Promise<boolean> => {
  const shown = await getShownWishes();
  const today = new Date().toDateString();
  const wishKey = `${wishId}_${today}`;
  return shown.includes(wishKey);
};

// ============================================================================
// OCCASION DETECTION
// ============================================================================

export const checkForBirthday = async (): Promise<SpecialOccasion | null> => {
  const profile = await loadUserProfile();
  if (!profile?.birthDate) return null;

  const today = new Date();
  const birthday = new Date(profile.birthDate);
  
  // Check if today is birthday (same month and day)
  if (
    today.getMonth() === birthday.getMonth() &&
    today.getDate() === birthday.getDate()
  ) {
    const wishId = `birthday_${today.getFullYear()}`;
    if (await hasShownWishToday(wishId)) return null;

    const template = BIRTHDAY_MESSAGES[Math.floor(Math.random() * BIRTHDAY_MESSAGES.length)];
    const name = profile.name || 'Student';
    
    await markWishAsShown(wishId);
    
    return {
      type: 'birthday',
      title: template.title,
      message: template.message.replace('{name}', name),
      emoji: template.emoji,
      gradientColors: ['#4573DF', '#F472B6', '#FBCFE8'],
    };
  }
  
  return null;
};

export const checkForExamDay = async (): Promise<SpecialOccasion | null> => {
  const profile = await loadUserProfile();
  const today = new Date();
  const todayStr = today.toDateString();

  // Check registered tests first, then all tests
  const testsToCheck = profile?.registeredTests?.length 
    ? ENTRY_TESTS_DATA.filter(t => profile.registeredTests?.includes(t.id))
    : ENTRY_TESTS_DATA;

  for (const test of testsToCheck) {
    const testDate = new Date(test.test_date);
    
    if (testDate.toDateString() === todayStr) {
      const wishId = `exam_${test.id}_${todayStr}`;
      if (await hasShownWishToday(wishId)) continue;

      const template = EXAM_DAY_MESSAGES[Math.floor(Math.random() * EXAM_DAY_MESSAGES.length)];
      const name = profile?.name || 'Student';
      
      await markWishAsShown(wishId);
      
      return {
        type: 'exam_day',
        title: template.title,
        message: template.message
          .replace('{testName}', test.name)
          .replace('{name}', name),
        emoji: template.emoji,
        gradientColors: ['#4573DF', '#60A5FA', '#93C5FD'],
        actionLabel: 'View Test Details',
        actionRoute: 'EntryTests',
      };
    }
  }
  
  return null;
};

export const checkForResultDay = async (): Promise<SpecialOccasion | null> => {
  const today = new Date();
  const todayStr = today.toDateString();

  for (const test of ENTRY_TESTS_DATA) {
    if (test.result_date) {
      const resultDate = new Date(test.result_date);
      
      if (resultDate.toDateString() === todayStr) {
        const wishId = `result_${test.id}_${todayStr}`;
        if (await hasShownWishToday(wishId)) continue;

        const template = RESULT_DAY_MESSAGES[0];
        
        await markWishAsShown(wishId);
        
        return {
          type: 'result_day',
          title: template.title,
          message: template.message.replace('{testName}', test.name),
          emoji: template.emoji,
          gradientColors: ['#F59E0B', '#FBBF24', '#FDE68A'],
          actionLabel: 'Check Results',
          actionRoute: 'EntryTests',
        };
      }
    }
  }
  
  return null;
};

export const getMotivationalMessage = async (): Promise<SpecialOccasion | null> => {
  const profile = await loadUserProfile();
  
  // Show motivation message occasionally (20% chance)
  if (Math.random() > 0.2) return null;
  
  const wishId = `motivation_${new Date().toDateString()}`;
  if (await hasShownWishToday(wishId)) return null;

  const template = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
  const name = profile?.name || 'Student';
  
  await markWishAsShown(wishId);
  
  return {
    type: 'motivation',
    title: template.title,
    message: template.message.replace('{name}', name),
    emoji: template.emoji,
    gradientColors: ['#10B981', '#34D399', '#6EE7B7'],
  };
};

// ============================================================================
// MAIN CHECK FUNCTION
// ============================================================================

export const checkForSpecialOccasion = async (): Promise<SpecialOccasion | null> => {
  // Priority order: Birthday > Exam Day > Result Day > Motivation
  
  // Check birthday first
  const birthday = await checkForBirthday();
  if (birthday) return birthday;
  
  // Check exam day
  const examDay = await checkForExamDay();
  if (examDay) return examDay;
  
  // Check result day
  const resultDay = await checkForResultDay();
  if (resultDay) return resultDay;
  
  // Check for motivational message
  const motivation = await getMotivationalMessage();
  if (motivation) return motivation;
  
  return null;
};

// ============================================================================
// UPCOMING OCCASIONS
// ============================================================================

export const getUpcomingOccasions = async (): Promise<Array<{
  type: string;
  name: string;
  date: Date;
  daysUntil: number;
}>> => {
  const occasions: Array<{type: string; name: string; date: Date; daysUntil: number}> = [];
  const today = new Date();
  const profile = await loadUserProfile();

  // Add birthday if set
  if (profile?.birthDate) {
    const birthday = new Date(profile.birthDate);
    const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 30) {
      occasions.push({
        type: 'birthday',
        name: 'Your Birthday',
        date: nextBirthday,
        daysUntil,
      });
    }
  }

  // Add upcoming tests
  for (const test of ENTRY_TESTS_DATA) {
    const testDate = new Date(test.test_date);
    
    if (testDate > today) {
      const daysUntil = Math.ceil((testDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 60) {
        occasions.push({
          type: 'exam',
          name: test.name,
          date: testDate,
          daysUntil,
        });
      }
    }
    
    // Add result dates
    if (test.result_date) {
      const resultDate = new Date(test.result_date);
      
      if (resultDate > today) {
        const daysUntil = Math.ceil((resultDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 30) {
          occasions.push({
            type: 'result',
            name: `${test.name} Results`,
            date: resultDate,
            daysUntil,
          });
        }
      }
    }
  }

  // Sort by days until
  return occasions.sort((a, b) => a.daysUntil - b.daysUntil);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  loadUserProfile,
  saveUserProfile,
  updateUserBirthday,
  registerForTest,
  checkForBirthday,
  checkForExamDay,
  checkForResultDay,
  getMotivationalMessage,
  checkForSpecialOccasion,
  getUpcomingOccasions,
};

