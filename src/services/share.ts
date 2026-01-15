/**
 * Share Service - Handle sharing functionality across the app
 * Supports text sharing and shareable card images
 */

import {Share, Platform, Alert} from 'react-native';
import {RefObject} from 'react';
import {View} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
}

export interface UniversityShareData {
  name: string;
  shortName: string;
  city: string;
  type: string;
  website?: string;
}

export interface ScholarshipShareData {
  name: string;
  provider: string;
  coveragePercentage?: number;
  type: string;
}

export interface ProgramShareData {
  name: string;
  university: string;
  level: string;
  duration?: number;
}

export interface MeritShareData {
  aggregate: number;
  universityName: string;
  universityShortName: string;
  chance: 'high' | 'medium' | 'low';
  breakdown?: {
    matricContribution: number;
    interContribution: number;
    testContribution: number;
  };
}

export interface CompareShareData {
  university1: {
    name: string;
    shortName: string;
    type: string;
    city: string;
    ranking: string | null;
  };
  university2: {
    name: string;
    shortName: string;
    type: string;
    city: string;
    ranking: string | null;
  };
}

export interface PollShareData {
  question: string;
  winner: string;
  winnerVotes: number;
  totalVotes: number;
  options: Array<{name: string; votes: number; percentage: number}>;
}

export interface AdmissionCelebrationData {
  universityName: string;
  universityShortName: string;
  programName?: string;
  studentName?: string;
  year?: number;
}

export interface EntryTestSuccessData {
  testName: string;
  testShortName: string;
  score?: number;
  percentile?: number;
  studentName?: string;
}

export interface MilestoneShareData {
  type: 'first_calc' | 'merit_listed' | 'accepted' | 'scholarship' | 'test_passed';
  details: {
    universityName?: string;
    scholarshipName?: string;
    testName?: string;
    studentName?: string;
  };
}

// ============================================================================
// SHARE FUNCTIONS
// ============================================================================

/**
 * Generic share function
 */
export const shareContent = async (content: ShareContent): Promise<boolean> => {
  try {
    const shareOptions: any = {
      message: content.message,
    };

    if (Platform.OS === 'ios') {
      shareOptions.url = content.url;
    } else {
      // For Android, append URL to message
      if (content.url) {
        shareOptions.message = `${content.message}\n\n${content.url}`;
      }
    }

    const result = await Share.share(shareOptions, {
      dialogTitle: content.title,
    });

    if (result.action === Share.sharedAction) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Error', 'Unable to share. Please try again.');
    return false;
  }
};

/**
 * Share a university
 */
export const shareUniversity = async (data: UniversityShareData): Promise<boolean> => {
  const message = `🎓 Check out ${data.name} (${data.shortName})!\n\n📍 ${data.city}\n🏛️ ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} University\n\nDiscover more universities on PakUni - Your University Guide!`;
  
  return shareContent({
    title: `Share ${data.shortName}`,
    message,
    url: data.website || 'https://pakuni.app',
  });
};

/**
 * Share a scholarship
 */
export const shareScholarship = async (data: ScholarshipShareData): Promise<boolean> => {
  const coverageText = data.coveragePercentage 
    ? `\n💰 ${data.coveragePercentage}% Coverage` 
    : '';
  
  const message = `🎓 Scholarship Alert!\n\n📝 ${data.name}\n🏢 By: ${data.provider}${coverageText}\n📋 Type: ${data.type}\n\nFind more scholarships on PakUni - Your University Guide!`;
  
  return shareContent({
    title: `Share ${data.name}`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share a program
 */
export const shareProgram = async (data: ProgramShareData): Promise<boolean> => {
  const durationText = data.duration ? `\n⏱️ Duration: ${data.duration} years` : '';
  
  const message = `📚 Discover this program!\n\n🎓 ${data.name}\n🏛️ ${data.university}\n📊 ${data.level}${durationText}\n\nExplore more programs on PakUni - Your University Guide!`;
  
  return shareContent({
    title: `Share ${data.name}`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share app
 */
export const shareApp = async (): Promise<boolean> => {
  const message = `🎓 Check out PakUni - Your complete guide to Pakistani universities!\n\n✅ 200+ Universities\n✅ Merit Calculator\n✅ Scholarships\n✅ Career Guidance\n✅ Entry Test Info\n\nDownload now and plan your academic future!`;
  
  return shareContent({
    title: 'Share PakUni',
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share merit calculation results
 */
export const shareMeritResults = async (
  aggregate: number,
  universities: string[]
): Promise<boolean> => {
  const uniList = universities.slice(0, 3).join(', ');
  const moreText = universities.length > 3 ? ` and ${universities.length - 3} more` : '';
  
  const message = `🎯 My Merit Score: ${aggregate.toFixed(2)}%\n\n📊 I calculated my university admission chances on PakUni!\n\n🏛️ Matching universities: ${uniList}${moreText}\n\nCalculate your merit on PakUni - Your University Guide!`;
  
  return shareContent({
    title: 'Share My Merit Score',
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share career quiz results
 */
export const shareQuizResults = async (
  career: string,
  matchPercentage: number
): Promise<boolean> => {
  const message = `🎯 Career Match: ${career} (${matchPercentage}% match)\n\nI took the career interest quiz on PakUni and discovered my ideal career path!\n\nTake the quiz on PakUni - Your University Guide!`;
  
  return shareContent({
    title: 'Share My Career Match',
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share merit success card (enhanced with chance indicator)
 */
export const shareMeritSuccessCard = async (
  data: MeritShareData
): Promise<boolean> => {
  const chanceText = data.chance === 'high' 
    ? 'Excellent Chance' 
    : data.chance === 'medium' 
    ? 'Good Chance' 
    : 'Fair Chance';
  
  const emoji = data.chance === 'high' ? '🎯' : data.chance === 'medium' ? '📈' : '💪';
  
  const breakdownText = data.breakdown 
    ? `\n\n📊 Score Breakdown:\n• Matric: ${data.breakdown.matricContribution.toFixed(1)}\n• Inter: ${data.breakdown.interContribution.toFixed(1)}${data.breakdown.testContribution > 0 ? `\n• Test: ${data.breakdown.testContribution.toFixed(1)}` : ''}`
    : '';
  
  const message = `${emoji} I have an ${chanceText} of getting into ${data.universityShortName}!\n\n🎓 ${data.universityName}\n📈 My Merit Score: ${data.aggregate.toFixed(2)}%${breakdownText}\n\nCalculate your chances on PakUni App! 🚀`;
  
  return shareContent({
    title: `Share My ${data.universityShortName} Chances`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share university comparison
 */
export const shareComparison = async (
  data: CompareShareData
): Promise<boolean> => {
  const uni1 = data.university1;
  const uni2 = data.university2;
  
  const ranking1 = uni1.ranking ? ` (Rank #${uni1.ranking})` : '';
  const ranking2 = uni2.ranking ? ` (Rank #${uni2.ranking})` : '';
  
  const message = `🏛️ University Comparison\n\n${uni1.shortName}${ranking1}\n• ${uni1.type} | ${uni1.city}\n\n🆚\n\n${uni2.shortName}${ranking2}\n• ${uni2.type} | ${uni2.city}\n\nCompare more universities on PakUni App! 📚`;
  
  return shareContent({
    title: `${uni1.shortName} vs ${uni2.shortName}`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share poll results
 */
export const sharePollResults = async (
  data: PollShareData
): Promise<boolean> => {
  const topOptions = data.options
    .slice(0, 3)
    .map((opt, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${opt.name}: ${opt.percentage.toFixed(0)}%`)
    .join('\n');
  
  const message = `🗳️ PakUni Poll Results\n\n❓ ${data.question}\n\n${topOptions}\n\n👥 ${data.totalVotes.toLocaleString()} students voted!\n\nVote in more polls on PakUni App!`;
  
  return shareContent({
    title: 'Share Poll Results',
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Get chance level based on aggregate compared to historical merits
 */
export const getChanceLevel = (aggregate: number, closingMerit?: number): 'high' | 'medium' | 'low' => {
  if (!closingMerit) {
    // Default thresholds if no historical data
    if (aggregate >= 85) return 'high';
    if (aggregate >= 70) return 'medium';
    return 'low';
  }
  
  const diff = aggregate - closingMerit;
  if (diff >= 5) return 'high';
  if (diff >= -3) return 'medium';
  return 'low';
};

// ============================================================================
// CELEBRATION & SUCCESS CARDS
// ============================================================================

/**
 * Share admission celebration card - "I got into X!" 🎉
 */
export const shareAdmissionCelebration = async (
  data: AdmissionCelebrationData
): Promise<boolean> => {
  const nameText = data.studentName ? ` ${data.studentName}` : '';
  const programText = data.programName ? `\n📚 ${data.programName}` : '';
  const yearText = data.year ? ` ${data.year}` : '';
  
  const message = `🎉🎓 ADMISSION SECURED! 🎓🎉\n\n${nameText ? `👤${nameText}` : 'I'} got admitted to:\n\n🏛️ ${data.universityName}${programText}${yearText}\n\n✨ Dreams do come true! ✨\n\n#Alhamdulillah #${data.universityShortName}${data.year || ''} #PakUni\n\n📱 Plan your university journey: https://pakuni.app`;
  
  return shareContent({
    title: `I got into ${data.universityShortName}!`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share entry test success card
 */
export const shareEntryTestSuccess = async (
  data: EntryTestSuccessData
): Promise<boolean> => {
  const nameText = data.studentName ? `${data.studentName} has` : 'I have';
  const scoreText = data.score ? `\n📈 Score: ${data.score}` : '';
  const percentileText = data.percentile ? `\n🏆 Percentile: ${data.percentile}%` : '';
  
  const message = `📝 ${data.testName} CLEARED! ✅\n\n${nameText} successfully passed the ${data.testShortName}!${scoreText}${percentileText}\n\n💪 One step closer to the dream!\n\n#${data.testShortName}Cleared #AdmissionSeason #PakUni\n\n📱 Prepare for your tests: https://pakuni.app`;
  
  return shareContent({
    title: `${data.testShortName} Cleared!`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share merit list celebration
 */
export const shareMeritListCelebration = async (
  universityName: string,
  universityShortName: string,
  meritListNumber?: number,
  studentName?: string
): Promise<boolean> => {
  const nameText = studentName || 'I';
  const meritText = meritListNumber ? `Merit List ${meritListNumber}` : 'the merit list';
  
  const message = `📜 MERIT LISTED! 🎯\n\n${nameText} made it to ${meritText} at:\n\n🏛️ ${universityName}\n\n✨ Alhamdulillah! Hard work pays off! ✨\n\n#MeritListed #${universityShortName} #PakUni\n\n📱 Calculate your merit: https://pakuni.app`;
  
  return shareContent({
    title: `Merit Listed at ${universityShortName}!`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share scholarship received celebration
 */
export const shareScholarshipCelebration = async (
  scholarshipName: string,
  provider: string,
  coverage?: string,
  studentName?: string
): Promise<boolean> => {
  const nameText = studentName || 'I';
  const coverageText = coverage ? `\n💰 Coverage: ${coverage}` : '';
  
  const message = `🎓💰 SCHOLARSHIP RECEIVED! 💰🎓\n\n${nameText} has been awarded:\n\n📝 ${scholarshipName}\n🏢 By: ${provider}${coverageText}\n\n✨ Dreams + Hard work = Success! ✨\n\n#Scholarship #EducationFunding #PakUni\n\n📱 Find scholarships: https://pakuni.app`;
  
  return shareContent({
    title: 'Scholarship Received!',
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share milestone achievement
 */
export const shareMilestone = async (
  data: MilestoneShareData
): Promise<boolean> => {
  let message: string;
  let title: string;
  
  switch (data.type) {
    case 'first_calc':
      message = `🎯 Started my university journey!\n\nJust calculated my first merit score on PakUni App. Taking the first step towards my dream university!\n\n#AdmissionPrep #PakUni\n\n📱 Calculate your merit: https://pakuni.app`;
      title = 'Started My Journey!';
      break;
      
    case 'merit_listed':
      message = `📜 MERIT LISTED! 🎯\n\nI made it to the merit list at ${data.details.universityName}!\n\nAlhamdulillah! Hard work pays off! ✨\n\n#MeritListed #PakUni\n\n📱 https://pakuni.app`;
      title = 'Merit Listed!';
      break;
      
    case 'accepted':
      message = `🎉 ADMISSION SECURED! 🎓\n\nI got admitted to ${data.details.universityName}!\n\nDreams coming true! ✨\n\n#AdmissionSecured #PakUni\n\n📱 https://pakuni.app`;
      title = 'Admission Secured!';
      break;
      
    case 'scholarship':
      message = `🎓💰 SCHOLARSHIP AWARDED!\n\nI received ${data.details.scholarshipName}!\n\nAlhamdulillah! Education is now more accessible! ✨\n\n#Scholarship #PakUni\n\n📱 https://pakuni.app`;
      title = 'Scholarship Awarded!';
      break;
      
    case 'test_passed':
      message = `📝 TEST CLEARED! ✅\n\nI successfully passed ${data.details.testName}!\n\nOne step closer to my dream! 💪\n\n#EntryTest #PakUni\n\n📱 https://pakuni.app`;
      title = 'Test Cleared!';
      break;
      
    default:
      message = `🎯 New milestone achieved on PakUni!\n\n#PakUni\n\n📱 https://pakuni.app`;
      title = 'Milestone Achieved!';
  }
  
  return shareContent({
    title,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share result game prediction
 */
export const shareResultPrediction = async (
  universityName: string,
  universityShortName: string,
  chancePercentage: number
): Promise<boolean> => {
  const emoji = chancePercentage >= 80 ? '🎯' : chancePercentage >= 50 ? '📈' : '💪';
  const motivationText = chancePercentage >= 80 
    ? 'Looking good!' 
    : chancePercentage >= 50 
    ? 'Keep pushing!' 
    : 'Every effort counts!';
  
  const message = `${emoji} My ${universityShortName} Prediction: ${chancePercentage}%!\n\n🏛️ ${universityName}\n💭 ${motivationText}\n\nJust played the Result Prediction Game on PakUni! 🎮\n\n#ResultPrediction #${universityShortName} #PakUni\n\n📱 Try it: https://pakuni.app`;
  
  return shareContent({
    title: `My ${universityShortName} Chances`,
    message,
    url: 'https://pakuni.app',
  });
};

/**
 * Share study streak
 */
export const shareStudyStreak = async (
  streakDays: number
): Promise<boolean> => {
  const message = `🔥 ${streakDays}-Day Study Streak!\n\nStaying consistent with my university prep on PakUni!\n\n💪 Discipline is the bridge between goals and accomplishments.\n\n#StudyStreak #Consistency #PakUni\n\n📱 Join me: https://pakuni.app`;
  
  return shareContent({
    title: `${streakDays}-Day Streak!`,
    message,
    url: 'https://pakuni.app',
  });
};

export default {
  shareContent,
  shareUniversity,
  shareScholarship,
  shareProgram,
  shareApp,
  shareMeritResults,
  shareQuizResults,
  shareMeritSuccessCard,
  shareComparison,
  sharePollResults,
  getChanceLevel,
  // New celebration cards
  shareAdmissionCelebration,
  shareEntryTestSuccess,
  shareMeritListCelebration,
  shareScholarshipCelebration,
  shareMilestone,
  shareResultPrediction,
  shareStudyStreak,
};
