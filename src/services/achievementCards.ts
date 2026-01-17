/**
 * Achievement Card Image Generator
 * 
 * Generates beautiful shareable achievement cards as images
 * - Merit Success Cards
 * - Admission Celebration Cards
 * - Scholarship Cards
 * - Test Completion Cards
 * - Custom Achievement Cards
 */

import {MyAchievement} from './achievements';

// Card dimensions
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

// Colors for different achievement types
const CARD_COLORS = {
  entry_test: {
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#93C5FD',
    bg: '#F0F4FF',
  },
  merit_list: {
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: '#FFE082',
    bg: '#FFFBEB',
  },
  admission: {
    primary: '#10B981',
    secondary: '#047857',
    accent: '#6EE7B7',
    bg: '#F0FDF4',
  },
  scholarship: {
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FBBF24',
    bg: '#FFFBF0',
  },
  result: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#D8B4FE',
    bg: '#FAF5FF',
  },
  custom: {
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F472B6',
    bg: '#FFF1F8',
  },
};

export interface CardGenerationOptions {
  universityLogo?: string;
  includeQRCode?: boolean;
  watermark?: boolean;
}

/**
 * Generate Achievement Card SVG
 * Returns SVG string that can be converted to image
 */
export const generateMeritSuccessCardSVG = (
  achievement: MyAchievement,
  percentage: string,
  universityName: string
): string => {
  const colors = CARD_COLORS.merit_list;

  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGradient)"/>

      <!-- Header with gradient -->
      <rect width="${CARD_WIDTH}" height="400" fill="url(#headerGradient)"/>

      <!-- Decorative circles -->
      <circle cx="950" cy="-100" r="300" fill="rgba(255,255,255,0.1)"/>
      <circle cx="-100" cy="400" r="200" fill="rgba(255,255,255,0.1)"/>

      <!-- Main emoji/icon -->
      <text x="${CARD_WIDTH / 2}" y="200" font-size="120" text-anchor="middle" fill="white">📜</text>

      <!-- Title -->
      <text x="${CARD_WIDTH / 2}" y="320" font-size="60" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        Merit Success!
      </text>

      <!-- White section -->
      <rect y="400" width="${CARD_WIDTH}" height="${CARD_HEIGHT - 400}" fill="white"/>

      <!-- University name -->
      <text x="60" y="520" font-size="28" fill="#999999" font-family="Arial">University</text>
      <text x="60" y="580" font-size="48" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        ${truncateText(universityName, 25)}
      </text>

      <!-- Aggregate section -->
      <rect x="60" y="650" width="${CARD_WIDTH - 120}" height="200" rx="20" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="3"/>
      
      <text x="${CARD_WIDTH / 2}" y="700" font-size="24" fill="#999999" text-anchor="middle" font-family="Arial">
        Your Aggregate
      </text>
      
      <text x="${CARD_WIDTH / 2}" y="800" font-size="72" font-weight="bold" text-anchor="middle" fill="${colors.primary}" font-family="Arial">
        ${percentage}
      </text>

      <!-- Bottom info -->
      <text x="60" y="1050" font-size="20" fill="#999999" font-family="Arial">
        Calculated using PakUni Merit Calculator 📱
      </text>

      <text x="60" y="1100" font-size="18" fill="#999999" font-family="Arial" opacity="0.7">
        Made with PakUni App
      </text>

      <!-- Hashtags -->
      <text x="60" y="1200" font-size="22" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        #PakUni #MeritCalculator #AdmissionReady
      </text>

      <!-- Date -->
      <text x="${CARD_WIDTH - 60}" y="1300" font-size="16" fill="#999999" text-anchor="end" font-family="Arial">
        ${new Date().toLocaleDateString('en-PK')}
      </text>
    </svg>
  `;
};

/**
 * Generate Admission Celebration Card SVG
 */
export const generateAdmissionCardSVG = (
  universityName: string,
  programName: string
): string => {
  const colors = CARD_COLORS.admission;

  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGradient)"/>

      <!-- Header -->
      <rect width="${CARD_WIDTH}" height="450" fill="url(#headerGradient)"/>

      <!-- Celebration emoji -->
      <text x="${CARD_WIDTH / 2}" y="220" font-size="150" text-anchor="middle" fill="white">🎉</text>

      <!-- Main text -->
      <text x="${CARD_WIDTH / 2}" y="350" font-size="56" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        ADMISSION
      </text>
      <text x="${CARD_WIDTH / 2}" y="410" font-size="56" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        SECURED! 🎓
      </text>

      <!-- White section -->
      <rect y="450" width="${CARD_WIDTH}" height="${CARD_HEIGHT - 450}" fill="white"/>

      <!-- University -->
      <text x="60" y="560" font-size="24" fill="#999999" font-family="Arial">University</text>
      <text x="60" y="630" font-size="52" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        ${truncateText(universityName, 25)}
      </text>

      <!-- Program -->
      <text x="60" y="730" font-size="24" fill="#999999" font-family="Arial">Program</text>
      <text x="60" y="800" font-size="44" font-weight="bold" fill="${colors.secondary}" font-family="Arial">
        ${truncateText(programName, 30)}
      </text>

      <!-- Celebratory message -->
      <rect x="60" y="880" width="${CARD_WIDTH - 120}" height="160" rx="20" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="2"/>
      
      <text x="${CARD_WIDTH / 2}" y="930" font-size="28" font-weight="bold" text-anchor="middle" fill="${colors.primary}" font-family="Arial">
        Dreams Coming True! 🌟
      </text>
      
      <text x="${CARD_WIDTH / 2}" y="990" font-size="22" text-anchor="middle" fill="#999999" font-family="Arial">
        Congratulations on your admission!
      </text>

      <!-- Hashtags -->
      <text x="60" y="1150" font-size="22" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        #PakUni #Admission #Success #2024
      </text>

      <!-- Download info -->
      <text x="60" y="1240" font-size="18" fill="#999999" font-family="Arial">
        Share this moment with PakUni 📱
      </text>
      <text x="60" y="1280" font-size="16" fill="#999999" font-family="Arial" opacity="0.7">
        Made with PakUni App
      </text>
    </svg>
  `;
};

/**
 * Generate Test Completion Card SVG
 */
export const generateTestCompletionCardSVG = (
  testName: string,
  score?: string
): string => {
  const colors = CARD_COLORS.entry_test;

  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGradient)"/>

      <!-- Header -->
      <rect width="${CARD_WIDTH}" height="400" fill="url(#headerGradient)"/>

      <!-- Icon -->
      <text x="${CARD_WIDTH / 2}" y="200" font-size="120" text-anchor="middle" fill="white">✅</text>

      <!-- Text -->
      <text x="${CARD_WIDTH / 2}" y="330" font-size="56" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        Entry Test Done!
      </text>

      <!-- White section -->
      <rect y="400" width="${CARD_WIDTH}" height="${CARD_HEIGHT - 400}" fill="white"/>

      <!-- Test name -->
      <text x="60" y="540" font-size="28" fill="#999999" font-family="Arial">Test Name</text>
      <text x="60" y="610" font-size="56" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        ${truncateText(testName, 20)}
      </text>

      <!-- Score section if available -->
      ${score ? `
      <rect x="60" y="680" width="${CARD_WIDTH - 120}" height="140" rx="20" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="2"/>
      
      <text x="${CARD_WIDTH / 2}" y="730" font-size="22" fill="#999999" text-anchor="middle" font-family="Arial">
        Your Score
      </text>
      
      <text x="${CARD_WIDTH / 2}" y="800" font-size="52" font-weight="bold" text-anchor="middle" fill="${colors.primary}" font-family="Arial">
        ${score}
      </text>
      ` : ''}

      <!-- Message -->
      <text x="60" y="1000" font-size="24" fill="#999999" font-family="Arial">
        One step closer to your dream university! 🎯
      </text>

      <!-- Hashtags -->
      <text x="60" y="1100" font-size="20" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        #PakUni #EntryTest #AdmissionJourney
      </text>

      <!-- Download info -->
      <text x="60" y="1200" font-size="18" fill="#999999" font-family="Arial">
        Calculated & shared using PakUni 📱
      </text>

      <text x="60" y="1280" font-size="16" fill="#999999" font-family="Arial" opacity="0.7">
        Made with PakUni App • Your Gateway to Pakistani Universities
      </text>
    </svg>
  `;
};

/**
 * Generate Scholarship Achievement Card SVG
 */
export const generateScholarshipCardSVG = (
  scholarshipName: string,
  percentage: string,
  universityName?: string
): string => {
  const colors = CARD_COLORS.scholarship;

  return `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#bgGradient)"/>

      <!-- Header -->
      <rect width="${CARD_WIDTH}" height="400" fill="url(#headerGradient)"/>

      <!-- Trophy emoji -->
      <text x="${CARD_WIDTH / 2}" y="200" font-size="120" text-anchor="middle" fill="white">🏆</text>

      <!-- Text -->
      <text x="${CARD_WIDTH / 2}" y="330" font-size="56" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        Scholarship Won!
      </text>

      <!-- White section -->
      <rect y="400" width="${CARD_WIDTH}" height="${CARD_HEIGHT - 400}" fill="white"/>

      <!-- Scholarship name -->
      <text x="60" y="540" font-size="24" fill="#999999" font-family="Arial">Scholarship</text>
      <text x="60" y="610" font-size="48" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        ${truncateText(scholarshipName, 30)}
      </text>

      <!-- Percentage highlight -->
      <rect x="60" y="680" width="${CARD_WIDTH - 120}" height="140" rx="20" fill="${colors.bg}" stroke="${colors.primary}" stroke-width="2"/>
      
      <text x="${CARD_WIDTH / 2}" y="730" font-size="22" fill="#999999" text-anchor="middle" font-family="Arial">
        Coverage
      </text>
      
      <text x="${CARD_WIDTH / 2}" y="800" font-size="56" font-weight="bold" text-anchor="middle" fill="${colors.primary}" font-family="Arial">
        ${percentage}
      </text>

      ${universityName ? `
      <!-- University -->
      <text x="60" y="890" font-size="22" fill="#999999" font-family="Arial">at</text>
      <text x="60" y="950" font-size="40" font-weight="bold" fill="${colors.secondary}" font-family="Arial">
        ${truncateText(universityName, 25)}
      </text>
      ` : ''}

      <!-- Congratulations -->
      <text x="60" y="1050" font-size="24" fill="#999999" font-family="Arial">
        Congratulations! 🌟
      </text>

      <!-- Hashtags -->
      <text x="60" y="1130" font-size="20" font-weight="bold" fill="${colors.primary}" font-family="Arial">
        #PakUni #Scholarship #Future
      </text>

      <!-- Download info -->
      <text x="60" y="1230" font-size="16" fill="#999999" font-family="Arial" opacity="0.7">
        Made with PakUni App • Your Gateway to Pakistani Universities
      </text>
    </svg>
  `;
};

/**
 * Helper function to truncate text
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert SVG to base64 data URL
 */
export const svgToDataUrl = (svgString: string): string => {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;utf8,${encoded}`;
};

/**
 * Generate card based on achievement type
 */
export const generateAchievementCardSVG = (
  achievement: MyAchievement,
  extraData?: Record<string, string>
): string => {
  switch (achievement.type) {
    case 'merit_list':
      return generateMeritSuccessCardSVG(
        achievement,
        extraData?.percentage || '85%',
        achievement.universityName || 'Your University'
      );
    case 'admission':
      return generateAdmissionCardSVG(
        achievement.universityName || 'Your University',
        achievement.programName || 'Your Program'
      );
    case 'entry_test':
      return generateTestCompletionCardSVG(
        achievement.testName || 'Entry Test',
        achievement.score
      );
    case 'scholarship':
      return generateScholarshipCardSVG(
        achievement.scholarshipName || 'Scholarship',
        achievement.percentage || '100%',
        achievement.universityName
      );
    default:
      return generateAdmissionCardSVG(
        achievement.universityName || 'Achievement',
        achievement.title || 'Milestone'
      );
  }
};

export default {
  generateMeritSuccessCardSVG,
  generateAdmissionCardSVG,
  generateTestCompletionCardSVG,
  generateScholarshipCardSVG,
  generateAchievementCardSVG,
  svgToDataUrl,
  CARD_WIDTH,
  CARD_HEIGHT,
};
