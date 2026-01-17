/**
 * Services Index
 * Central export for all application services
 * 
 * OPTIMIZED FOR SUPABASE FREE TIER:
 * - No real-time subscriptions
 * - Cache-first data access
 * - Minimal egress usage
 */

// ============================================================================
// CACHE SERVICE - Critical for minimizing egress
// ============================================================================

export {
  cache,
  cache as cacheService,
  CACHE_KEYS,
  CACHE_TTL,
} from './cache';
export type {
  CacheConfig,
  CacheEntry,
  CacheStats,
} from './cache';

// ============================================================================
// DATA SERVICE - Unified data access with caching
// ============================================================================

export {
  dataService,
  dataService as data,
} from './data';
export type {
  DataSyncStatus,
  AnnouncementData,
  UserFavorite,
  UserCalculation,
  UserGoal,
} from './data';

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export {
  analytics,
  analytics as analyticsService,
  ANALYTICS_EVENTS,
  useAnalyticsScreen,
  useScreenTime,
  useTrackedCallback,
} from './analytics';
export type { AnalyticsUser, AnalyticsEvent, ScreenView, ErrorReport, LogLevel } from './analytics';

// ============================================================================
// NETWORK SERVICE
// ============================================================================

export {
  network,
  network as networkService,
  useNetworkState,
  useIsOnline,
  useFetch,
  ERROR_CODES,
} from './network';
export type {
  RequestConfig,
  ApiResponse,
  ApiError,
  NetworkState,
} from './network';

// ============================================================================
// CONFIGURATION SERVICE
// ============================================================================

export {
  config,
  config as configService,
  useConfig,
  useFeatureFlag,
  useConfigSection,
} from './config';
export type {
  AppConfig,
} from './config';

// ============================================================================
// INTERNATIONALIZATION SERVICE
// ============================================================================

export {
  i18n,
  i18n as i18nService,
  useTranslations,
  useTranslation,
  useLanguage,
} from './i18n';
export type {
  Language,
  TranslationStrings,
} from './i18n';

// ============================================================================
// SUPABASE SERVICE
// ============================================================================

export {supabase} from './supabase';

// ============================================================================
// TURSO SERVICE - Static reference data (500M free reads)
// ============================================================================

export {
  initTurso,
  getTursoClient,
  isTursoAvailable,
  fetchUniversities,
  fetchEntryTests,
  fetchScholarships,
  fetchDeadlines,
  fetchPrograms,
  fetchCareers,
  fetchMeritFormulas,
  fetchMeritArchive,
  searchUniversities as tursoSearchUniversities,
  searchScholarships as tursoSearchScholarships,
  refreshAllData as refreshTursoData,
  clearCache as clearTursoCache,
  getLastSyncTime as getTursoLastSyncTime,
  needsRefresh as tursoNeedsRefresh,
} from './turso';
export type {
  TursoUniversity,
  TursoEntryTest,
  TursoScholarship,
  TursoDeadline,
  TursoProgram,
  TursoCareer,
  TursoMeritFormula,
  TursoMeritArchive,
} from './turso';

// ============================================================================
// HYBRID DATA SERVICE - Best of Turso + Supabase
// ============================================================================

export {
  hybridDataService,
  hybridDataService as hybridData,
} from './hybridData';
export type {
  DataSource,
} from './hybridData';

// ============================================================================
// ADMIN SERVICE
// ============================================================================

export {
  adminService,
} from './admin';
export type {
  UserRole,
  UserProfile,
  AdminUser,
  DashboardStats,
  AppSetting,
  Announcement,
  AnnouncementType,
  ContentReport,
  ReportStatus,
  AuditLog,
  UserFeedback,
  FeedbackType,
  FeedbackCategory,
  FeedbackStatus,
  AnalyticsSummary,
} from './admin';

// ============================================================================
// ADMIN NOTIFICATION SERVICE
// ============================================================================

export {
  adminNotificationService,
} from './adminNotifications';
export type {
  AdminNotification,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  CreateNotificationInput,
} from './adminNotifications';

// ============================================================================
// SHARE SERVICE
// ============================================================================

export {
  shareContent,
  shareUniversity,
  shareScholarship,
  shareProgram,
  shareApp,
  shareMeritResults,
  shareQuizResults,
} from './share';
export type {
  ShareContent,
  UniversityShareData,
  ScholarshipShareData,
  ProgramShareData,
} from './share';

// ============================================================================
// APP RATING SERVICE
// ============================================================================

export {
  appRatingService,
  useAppRating,
} from './rating';

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export {
  notificationService,
  useNotifications,
} from './notifications';
export type {
  NotificationPreferences,
  LocalNotification,
} from './notifications';

// ============================================================================
// OFFLINE SERVICE
// ============================================================================

export {
  offlineService,
  useOfflineStatus,
  useIsOffline,
} from './offline';
export type {
  OfflineAction,
  SyncStatus,
  DataModule,
} from './offline';

// ============================================================================
// CARD CAPTURE SERVICE - For shareable achievement cards
// ============================================================================

export {
  captureCard,
  captureAndSaveCard,
  captureAndShareCard,
  requestStoragePermission,
  shareMeritCardWithImage,
  shareAdmissionCardWithImage,
  shareTestCardWithImage,
  shareScholarshipCardWithImage,
  shareMeritListCardWithImage,
  shareAchievementBadgeWithImage,
  getOptimalDimensions,
  cleanupTempImages,
  isImageSharingSupported,
  CARD_DIMENSIONS,
} from './cardCapture';
export type {
  CaptureResult,
  ShareCardResult,
  CaptureOptions,
} from './cardCapture';

// ============================================================================
// ACHIEVEMENT CARDS SERVICE - SVG generation
// ============================================================================

export {
  generateMeritSuccessCardSVG,
  generateAdmissionCardSVG,
  generateTestCompletionCardSVG,
  generateScholarshipCardSVG,
  generateAchievementCardSVG,
  svgToDataUrl,
  CARD_WIDTH,
  CARD_HEIGHT,
} from './achievementCards';
export type {
  CardGenerationOptions,
} from './achievementCards';

// ============================================================================
// ACHIEVEMENTS SERVICE - User achievements management
// ============================================================================

export {
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
} from './achievements';
export type {
  AchievementType,
  MyAchievement,
  AchievementTemplate,
} from './achievements';

// ============================================================================
// ERROR REPORTING SERVICE - User-friendly error handling with admin reporting
// ============================================================================

export {
  errorReportingService,
} from './errorReporting';
export type {
  ErrorCategory,
  ErrorSeverity,
  ErrorReport as UserErrorReport,
  ErrorReportStatus,
  UserFeedbackOnError,
} from './errorReporting';

// ============================================================================
// HTTP CLIENT SERVICE - Unified HTTP requests with retry logic
// ============================================================================

export {
  httpClient,
  http,
} from './httpClient';
export type {
  HttpRequestConfig,
  HttpResponse,
} from './httpClient';

// ============================================================================
// OFFLINE SYNC SERVICE - Queue and intelligent retry for offline operations
// ============================================================================

export {
  offlineSyncService,
} from './offlineSync';
export type {
  SyncOperation,
  QueuedOperation,
  SyncConflict,
  SyncResult,
} from './offlineSync';

// ============================================================================
// DATA SUBMISSIONS & APPROVAL WORKFLOW SERVICE
// ============================================================================

export {
  dataSubmissionsService,
} from './dataSubmissions';
export type {
  DataSubmission,
  SubmissionStatus,
  SubmissionType,
  SubmissionPriority,
  AutoApprovalRule,
  NotificationTrigger,
  MeritRecord,
  AdmissionDeadline,
  EntryTestInfo,
} from './dataSubmissions';

// ============================================================================
// BATCH UPDATE SERVICE - Scheduled & timer-based updates
// ============================================================================

export {
  batchUpdateService,
} from './batchUpdateService';
export type {
  BatchUpdateJob,
  BatchUpdateConfig,
} from './batchUpdateService';

// ============================================================================
// CONTRIBUTION AUTOMATION SERVICE - Auto-approval & contributor rewards
// ============================================================================

export {
  contributionAutomationService,
} from './contributionAutomation';
export type {
  ContributionStats,
  ContributorBadge,
  AutoApprovalEvent,
} from './contributionAutomation';
