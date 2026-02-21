/**
 * Kids Hub data - features, fun facts, and quotes
 */

export interface KidsFeature {
  id: string;
  title: string;
  iconName: string;
  color: string;
  gradient: string[];
  description: string;
  tagline: string;
  screen: string;
}

export interface FunFact {
  iconName: string;
  text: string;
}

export interface KidsQuote {
  text: string;
  emoji: string;
}

export const KIDS_FEATURES: KidsFeature[] = [
  {
    id: 'careers',
    title: 'Explore Careers',
    iconName: 'color-palette-outline',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E8E'],
    description: 'Discover cool jobs!',
    tagline: 'What do you want to be?',
    screen: 'CareerExplorerKids',
  },
  {
    id: 'quiz',
    title: 'Career Quiz',
    iconName: 'bulb-outline',
    color: '#4ECDC4',
    gradient: ['#4ECDC4', '#6EE5DD'],
    description: 'Find your perfect career!',
    tagline: 'Take the fun quiz',
    screen: 'InterestQuiz',
  },
  {
    id: 'goals',
    title: 'My Goals',
    iconName: 'flag-outline',
    color: '#45B7D1',
    gradient: ['#45B7D1', '#67CFE6'],
    description: 'Set & track goals!',
    tagline: 'Dream big, start small',
    screen: 'GoalSetting',
  },
  {
    id: 'subjects',
    title: 'Subject Guide',
    iconName: 'library-outline',
    color: '#96CEB4',
    gradient: ['#96CEB4', '#B2DEC8'],
    description: 'Choose right subjects!',
    tagline: 'FSc, FA, ICS or I.Com?',
    screen: 'SubjectGuide',
  },
  {
    id: 'roadmaps',
    title: 'Career Paths',
    iconName: 'map-outline',
    color: '#DDA0DD',
    gradient: ['#DDA0DD', '#E9C0E9'],
    description: 'Step-by-step journeys!',
    tagline: 'From school to dream job',
    screen: 'CareerRoadmaps',
  },
  {
    id: 'tips',
    title: 'Study Tips',
    iconName: 'flash-outline',
    color: '#FFD93D',
    gradient: ['#FFD93D', '#FFE56D'],
    description: 'Learn smarter!',
    tagline: 'Top student secrets',
    screen: 'StudyTips',
  },
];

export const FUN_FACTS: FunFact[] = [
  {iconName: 'rocket-outline', text: 'Pakistan has over 200 universities!'},
  {iconName: 'flask-outline', text: 'Dr. Nergis Mavalvala discovered gravitational waves!'},
  {iconName: 'laptop-outline', text: 'Arfa Karim became MCP at just 9 years old!'},
  {iconName: 'trophy-outline', text: 'Work hard today, shine tomorrow!'},
  {iconName: 'book-outline', text: 'Reading 20 mins daily = 1.8 million words/year!'},
  {iconName: 'school-outline', text: 'Pakistan produces 445,000+ university graduates yearly!'},
  {iconName: 'bulb-outline', text: 'Dr. Abdus Salam won Nobel Prize in Physics!'},
  {iconName: 'globe-outline', text: 'Pakistani engineers built Karakoram Highway!'},
  {iconName: 'musical-notes-outline', text: 'Learning music improves math skills by 23%!'},
  {iconName: 'fitness-outline', text: 'Jahangir Khan won 555 squash matches in a row!'},
  {iconName: 'heart-outline', text: 'Helping others makes you happier & smarter!'},
  {iconName: 'star-outline', text: 'Malala is the youngest Nobel Peace Prize winner!'},
];

export const KIDS_QUOTES: KidsQuote[] = [
  {text: 'Every expert was once a beginner!', emoji: '\u{1F331}'},
  {text: "Your dreams don't have an expiry date!", emoji: '\u{2728}'},
  {text: 'Mistakes help you learn faster!', emoji: '\u{1F680}'},
  {text: 'You are braver than you believe!', emoji: '\u{1F4AA}'},
  {text: 'Big journeys start with small steps!', emoji: '\u{1F463}'},
  {text: 'Your only limit is your mind!', emoji: '\u{1F9E0}'},
];
