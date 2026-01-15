/**
 * Premium Icon Mappings
 * Centralized icon name mappings for consistent design language
 * Following Apple SF Symbols and Material Design guidelines
 */

// Tab Bar Icons - Using Ionicons for consistency
export const TAB_ICONS = {
  Home: { name: 'home', family: 'Ionicons' },
  HomeOutline: { name: 'home-outline', family: 'Ionicons' },
  Universities: { name: 'school', family: 'Ionicons' },
  UniversitiesOutline: { name: 'school-outline', family: 'Ionicons' },
  Scholarships: { name: 'wallet', family: 'Ionicons' },
  ScholarshipsOutline: { name: 'wallet-outline', family: 'Ionicons' },
  Profile: { name: 'person-circle', family: 'Ionicons' },
  ProfileOutline: { name: 'person-circle-outline', family: 'Ionicons' },
} as const;

// Navigation & Actions
export const ACTION_ICONS = {
  search: { name: 'search', family: 'Ionicons' },
  filter: { name: 'options', family: 'Ionicons' },
  sort: { name: 'swap-vertical', family: 'Ionicons' },
  close: { name: 'close', family: 'Ionicons' },
  back: { name: 'chevron-back', family: 'Ionicons' },
  forward: { name: 'chevron-forward', family: 'Ionicons' },
  menu: { name: 'menu', family: 'Ionicons' },
  more: { name: 'ellipsis-horizontal', family: 'Ionicons' },
  settings: { name: 'settings', family: 'Ionicons' },
  share: { name: 'share-social', family: 'Ionicons' },
  bookmark: { name: 'bookmark', family: 'Ionicons' },
  bookmarkOutline: { name: 'bookmark-outline', family: 'Ionicons' },
  heart: { name: 'heart', family: 'Ionicons' },
  heartOutline: { name: 'heart-outline', family: 'Ionicons' },
  star: { name: 'star', family: 'Ionicons' },
  starOutline: { name: 'star-outline', family: 'Ionicons' },
  refresh: { name: 'refresh', family: 'Ionicons' },
  add: { name: 'add', family: 'Ionicons' },
  remove: { name: 'remove', family: 'Ionicons' },
  check: { name: 'checkmark', family: 'Ionicons' },
  checkCircle: { name: 'checkmark-circle', family: 'Ionicons' },
  info: { name: 'information-circle', family: 'Ionicons' },
  warning: { name: 'warning', family: 'Ionicons' },
  error: { name: 'alert-circle', family: 'Ionicons' },
  help: { name: 'help-circle', family: 'Ionicons' },
} as const;

// University & Education Icons
export const EDUCATION_ICONS = {
  university: { name: 'school', family: 'Ionicons' },
  graduation: { name: 'school', family: 'MaterialCommunityIcons' },
  degree: { name: 'ribbon', family: 'Ionicons' },
  program: { name: 'library', family: 'Ionicons' },
  course: { name: 'book', family: 'Ionicons' },
  certificate: { name: 'document-text', family: 'Ionicons' },
  ranking: { name: 'trophy', family: 'Ionicons' },
  campus: { name: 'business', family: 'Ionicons' },
  faculty: { name: 'people', family: 'Ionicons' },
  research: { name: 'flask', family: 'Ionicons' },
  library: { name: 'library', family: 'Ionicons' },
  admission: { name: 'clipboard', family: 'Ionicons' },
  deadline: { name: 'calendar', family: 'Ionicons' },
  fee: { name: 'cash', family: 'Ionicons' },
  scholarship: { name: 'wallet', family: 'Ionicons' },
  merit: { name: 'medal', family: 'Ionicons' },
  needBased: { name: 'hand-left', family: 'Ionicons' },
  sports: { name: 'football', family: 'Ionicons' },
  disabled: { name: 'accessibility', family: 'Ionicons' },
} as const;

// Field/Category Icons
export const FIELD_ICONS = {
  engineering: { name: 'construct', family: 'Ionicons' },
  medical: { name: 'medkit', family: 'Ionicons' },
  business: { name: 'briefcase', family: 'Ionicons' },
  arts: { name: 'color-palette', family: 'Ionicons' },
  science: { name: 'flask', family: 'Ionicons' },
  law: { name: 'scale', family: 'MaterialCommunityIcons' },
  it: { name: 'code-slash', family: 'Ionicons' },
  agriculture: { name: 'leaf', family: 'Ionicons' },
  education: { name: 'school', family: 'Ionicons' },
  architecture: { name: 'grid', family: 'Ionicons' },
  media: { name: 'videocam', family: 'Ionicons' },
  socialSciences: { name: 'people', family: 'Ionicons' },
} as const;

// Location & Info Icons
export const INFO_ICONS = {
  location: { name: 'location', family: 'Ionicons' },
  locationOutline: { name: 'location-outline', family: 'Ionicons' },
  map: { name: 'map', family: 'Ionicons' },
  globe: { name: 'globe', family: 'Ionicons' },
  call: { name: 'call', family: 'Ionicons' },
  email: { name: 'mail', family: 'Ionicons' },
  website: { name: 'link', family: 'Ionicons' },
  time: { name: 'time', family: 'Ionicons' },
  calendar: { name: 'calendar', family: 'Ionicons' },
  document: { name: 'document-text', family: 'Ionicons' },
  stats: { name: 'stats-chart', family: 'Ionicons' },
  analytics: { name: 'analytics', family: 'Ionicons' },
  trending: { name: 'trending-up', family: 'Ionicons' },
  established: { name: 'calendar', family: 'Ionicons' },
} as const;

// Career & Goals
export const CAREER_ICONS = {
  career: { name: 'briefcase', family: 'Ionicons' },
  goal: { name: 'flag', family: 'Ionicons' },
  target: { name: 'bullseye', family: 'MaterialCommunityIcons' },
  roadmap: { name: 'git-branch', family: 'Ionicons' },
  milestone: { name: 'checkmark-circle', family: 'Ionicons' },
  skill: { name: 'star', family: 'Ionicons' },
  experience: { name: 'hourglass', family: 'Ionicons' },
  salary: { name: 'cash', family: 'Ionicons' },
  growth: { name: 'trending-up', family: 'Ionicons' },
  job: { name: 'briefcase', family: 'Ionicons' },
} as const;

// Study & Learning
export const STUDY_ICONS = {
  study: { name: 'book', family: 'Ionicons' },
  tips: { name: 'bulb', family: 'Ionicons' },
  notes: { name: 'create', family: 'Ionicons' },
  quiz: { name: 'help-circle', family: 'Ionicons' },
  test: { name: 'clipboard', family: 'Ionicons' },
  schedule: { name: 'calendar', family: 'Ionicons' },
  timer: { name: 'timer', family: 'Ionicons' },
  focus: { name: 'eye', family: 'Ionicons' },
  break: { name: 'cafe', family: 'Ionicons' },
  sleep: { name: 'moon', family: 'Ionicons' },
} as const;

// Empty States & Feedback
export const STATE_ICONS = {
  empty: { name: 'albums-outline', family: 'Ionicons' },
  noResults: { name: 'search', family: 'Ionicons' },
  error: { name: 'cloud-offline', family: 'Ionicons' },
  network: { name: 'wifi', family: 'Ionicons' },
  success: { name: 'checkmark-circle', family: 'Ionicons' },
  celebration: { name: 'sparkles', family: 'Ionicons' },
  favorites: { name: 'heart', family: 'Ionicons' },
  loading: { name: 'reload', family: 'Ionicons' },
} as const;

// Kids Hub Icons
export const KIDS_ICONS = {
  explore: { name: 'telescope', family: 'MaterialCommunityIcons' },
  game: { name: 'game-controller', family: 'Ionicons' },
  puzzle: { name: 'extension-puzzle', family: 'Ionicons' },
  rocket: { name: 'rocket', family: 'Ionicons' },
  star: { name: 'star', family: 'Ionicons' },
  lightbulb: { name: 'bulb', family: 'Ionicons' },
  paint: { name: 'color-palette', family: 'Ionicons' },
  music: { name: 'musical-notes', family: 'Ionicons' },
  science: { name: 'flask', family: 'Ionicons' },
  math: { name: 'calculator', family: 'Ionicons' },
} as const;

// Misc Icons
export const MISC_ICONS = {
  compare: { name: 'git-compare', family: 'Ionicons' },
  list: { name: 'list', family: 'Ionicons' },
  grid: { name: 'grid', family: 'Ionicons' },
  public: { name: 'business', family: 'Ionicons' },
  private: { name: 'shield-checkmark', family: 'Ionicons' },
  all: { name: 'apps', family: 'Ionicons' },
  chevronDown: { name: 'chevron-down', family: 'Ionicons' },
  chevronUp: { name: 'chevron-up', family: 'Ionicons' },
  chevronRight: { name: 'chevron-forward', family: 'Ionicons' },
  chevronLeft: { name: 'chevron-back', family: 'Ionicons' },
  arrowDown: { name: 'arrow-down', family: 'Ionicons' },
  arrowUp: { name: 'arrow-up', family: 'Ionicons' },
  copy: { name: 'copy', family: 'Ionicons' },
  download: { name: 'download', family: 'Ionicons' },
  upload: { name: 'cloud-upload', family: 'Ionicons' },
  external: { name: 'open-outline', family: 'Ionicons' },
  notification: { name: 'notifications', family: 'Ionicons' },
  moon: { name: 'moon', family: 'Ionicons' },
  sun: { name: 'sunny', family: 'Ionicons' },
} as const;

// Combined icon type
export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';

export interface IconConfig {
  name: string;
  family: IconFamily;
}

// Get icon by key from any mapping
export const getIcon = (
  key: string,
  fallback: IconConfig = { name: 'help-circle', family: 'Ionicons' }
): IconConfig => {
  const allMappings = {
    ...TAB_ICONS,
    ...ACTION_ICONS,
    ...EDUCATION_ICONS,
    ...FIELD_ICONS,
    ...INFO_ICONS,
    ...CAREER_ICONS,
    ...STUDY_ICONS,
    ...STATE_ICONS,
    ...KIDS_ICONS,
    ...MISC_ICONS,
  };

  return (allMappings as Record<string, IconConfig>)[key] || fallback;
};
