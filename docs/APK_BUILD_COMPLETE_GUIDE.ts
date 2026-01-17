/**
 * Production APK Build & Deployment Guide
 * 
 * This guide ensures the APK is built with full optimization,
 * proper signing, and all assets included.
 */

// ============================================================================
// PRE-BUILD CHECKLIST
// ============================================================================

export const PREBUILD_CHECKLIST = {
  environment: {
    nodeVersion: '>= 20.0.0', // Check: node --version
    javaVersion: '11 or 17', // Check: javac -version
    androidSdk: 'API 33+', // Check: sdkmanager --list_installed
    reactNativeVersion: '0.83.1', // Match package.json
  },
  
  credentials: {
    supabaseUrl: 'Set in .env',
    supabaseAnonKey: 'Set in .env',
    tursoDatabase: 'Set in .env',
    tursoAuthToken: 'Set in .env',
    googleOAuthClientId: 'Set in src/contexts/AuthContext.tsx',
  },

  codeQuality: {
    noConsoleErrors: 'npm run lint',
    typeScriptCompiles: 'npx tsc --noEmit',
    allTestsPass: 'npm test',
    noSecrets: 'npm run scan:secrets',
  },

  assets: {
    splashScreenImage: 'src/assets/splash.png - 1080x2280px',
    appIcon: 'android/app/src/main/res/mipmap-*',
    logoImages: 'src/assets/logo',
    fonts: 'android/app/src/main/assets/fonts/',
  },

  files: {
    dotEnvFileExists: '.env file with all keys',
    appJsonValid: 'app.json has correct config',
    buildGradleValid: 'android/build.gradle OK',
    appGradleValid: 'android/app/build.gradle OK',
  },
};

// ============================================================================
// BUILD PROCESS
// ============================================================================

export const BUILD_PROCESS = {
  step1: {
    name: 'Clean Build',
    commands: [
      'npm run clean',
      'cd android && gradlew clean && cd ..',
    ],
    notes: 'Remove any cached build artifacts',
  },

  step2: {
    name: 'Install Dependencies',
    commands: [
      'npm install',
      'cd android && ./gradlew --refresh-dependencies && cd ..',
    ],
    notes: 'Ensure all dependencies updated',
  },

  step3: {
    name: 'Optimize for Release',
    commands: [
      'npm run lint',
      'npx tsc --noEmit',
    ],
    notes: 'Fix any lint/type errors before building',
  },

  step4: {
    name: 'Validate Assets',
    commands: [
      'Verify all images in src/assets/',
      'Verify fonts in android/app/src/main/assets/fonts/',
      'Check app icon in res/mipmap-*',
    ],
    notes: 'Missing assets will cause crashes',
  },

  step5: {
    name: 'Generate Release APK',
    commands: [
      'npm run android:release',
      'Or manually: cd android && ./gradlew assembleRelease && cd ..',
    ],
    output: 'android/app/build/outputs/apk/release/app-release.apk',
    timeEstimate: '5-10 minutes',
  },

  step6: {
    name: 'Generate Release Bundle (AAB)',
    commands: [
      'npm run android:bundle',
      'Or manually: cd android && ./gradlew bundleRelease && cd ..',
    ],
    output: 'android/app/build/outputs/bundle/release/app-release.aab',
    timeEstimate: '5-10 minutes',
    notes: 'Required for Google Play Store',
  },

  step7: {
    name: 'Verify Signing',
    commands: [
      'jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk',
    ],
    notes: 'Verify APK is properly signed',
  },

  step8: {
    name: 'Test on Real Device',
    commands: [
      'adb install -r android/app/build/outputs/apk/release/app-release.apk',
      'Open app',
      'Test all critical flows',
      'Test offline mode',
      'Check permissions',
    ],
    timeEstimate: '30-45 minutes',
  },
};

// ============================================================================
// SIGNING CONFIGURATION
// ============================================================================

export const SIGNING_CONFIG = {
  keystoreFile: {
    location: 'android/app/pakuni.keystore',
    createCommand: `keytool -genkey -v -keystore android/app/pakuni.keystore \\
      -keyalg RSA \\
      -keysize 2048 \\
      -validity 10000 \\
      -alias pakuni`,
    importance: 'CRITICAL - Never lose this file',
  },

  buildGradleConfig: {
    example: `
android {
  ...
  signingConfigs {
    release {
      storeFile file('pakuni.keystore')
      storePassword System.getenv("KEYSTORE_PASSWORD")
      keyAlias System.getenv("KEY_ALIAS")
      keyPassword System.getenv("KEY_PASSWORD")
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
    `,
    notes: 'Use environment variables, never hardcode passwords',
  },

  environmentVariables: {
    KEYSTORE_PASSWORD: 'Store securely',
    KEY_ALIAS: 'pakuni',
    KEY_PASSWORD: 'Store securely',
  },
};

// ============================================================================
// OPTIMIZATION SETTINGS
// ============================================================================

export const OPTIMIZATION_SETTINGS = {
  gradleConfiguration: {
    minifyEnabled: true, // Enable code shrinking
    shrinkResources: true, // Remove unused resources
    debuggable: false, // Disable debugging in release
    ndk: {
      abiFilters: ['arm64-v8a'], // Target main architecture
    },
  },

  proguardRules: {
    location: 'android/app/proguard-rules.pro',
    critical: [
      '-keep class com.facebook.react.** { *; }', // React Native
      '-keep class com.reactnativecommunity.** { *; }', // Community modules
      '-keep class com.supabase.** { *; }', // Supabase
      '-keep class androidx.** { *; }', // AndroidX
    ],
  },

  bundleOptions: {
    enableSplit: true, // Create APKs per ABI
    language: false, // Don't split languages
    density: false, // Don't split by density
    abi: true, // Split by architecture
  },
};

// ============================================================================
// FINAL APK VERIFICATION
// ============================================================================

export const APK_VERIFICATION = {
  fileChecks: {
    apkSizeLimit: '< 100 MB',
    bungleSizeLimit: '< 150 MB',
    minDex: '1 DEX file',
    maxDex: '4 DEX files recommended',
  },

  contentVerification: {
    assetsIncluded: [
      'android/app/src/main/assets/fonts/',
      'splash screen image',
      'app icons',
      'logo images',
    ],
    noDebugFiles: 'Verify no debug symbols included',
    manifestValid: 'Verify AndroidManifest.xml',
    permissionsGranted: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'CAMERA',
      'RECORD_AUDIO',
    ],
  },

  functionalTests: {
    appOpens: 'Should launch without crashes',
    splashScreen: 'Should show brand logo',
    onboarding: 'Should display onboarding',
    homeScreen: 'Should load universities',
    offline: 'Should work without internet',
    auth: 'Should show auth options',
    calculator: 'Should calculate correctly',
    permissions: 'Should request permissions properly',
  },

  performance: {
    startupTime: '< 3 seconds',
    scrollFPS: '>= 50 FPS',
    memoryUsage: '< 150 MB (typical)',
    batteryImpact: 'Minimal background drain',
  },

  security: {
    noExposedKeys: 'Verify with: strings app.apk | grep -E "SUPABASE|TURSO|GOOGLE"',
    noDebugSymbols: 'Build is optimized',
    properSigning: 'jarsigner -verify',
  },
};

// ============================================================================
// DEPLOYMENT TO PLAY STORE
// ============================================================================

export const PLAY_STORE_DEPLOYMENT = {
  prerequisites: {
    googlePlayAccount: 'Developer account created',
    appBundle: 'AAB file generated',
    screenshots: '2-8 screenshots (Portrait & Landscape)',
    description: 'Detailed app description',
    privacyPolicy: 'Published at https://pakuni.app/privacy',
    termsOfService: 'Published at https://pakuni.app/terms',
  },

  uploadProcess: {
    step1: 'Go to Google Play Console',
    step2: 'Select App > Create New Release',
    step3: 'Upload app-release.aab',
    step4: 'Add Release Notes (English & Urdu)',
    step5: 'Set Version Number (major.minor.patch)',
    step6: 'Complete Store Listing',
    step7: 'Set Pricing & Distribution',
    step8: 'Submit for Review',
    reviewTime: '24-72 hours (usually)',
  },

  playstoreListing: {
    appTitle: 'PakUni - Your Gateway to Pakistan\'s Universities',
    shortDescription: '30-80 characters',
    fullDescription: 'Up to 4000 characters - highlight key features',
    screenshots: {
      minimum: 2,
      maximum: 8,
      format: 'PNG or JPG',
      dimensions: '1080x1920 px (9:16 aspect ratio)',
    },
    appIcon: '512x512 px, 32-bit PNG',
    featureGraphic: '1024x500 px',
  },

  versionManagement: {
    versionCode: 'Increment with every build',
    versionName: 'semver (e.g., 1.2.1)',
    minSdkVersion: 24, // Android 7.0+
    targetSdkVersion: 33, // Android 13+
  },
};

// ============================================================================
// TROUBLESHOOTING BUILD ISSUES
// ============================================================================

export const BUILD_TROUBLESHOOTING = {
  gradleBuildFailure: {
    symptoms: 'Gradle build fails with dependency error',
    solutions: [
      'rm -rf android/build && rm -rf .gradle',
      'cd android && ./gradlew --refresh-dependencies && cd ..',
      'Clear gradle cache: rm -rf ~/.gradle/caches',
    ],
  },

  javaVersionMismatch: {
    symptoms: 'Java version mismatch error',
    solutions: [
      'Use Java 11 or 17: export JAVA_HOME=/path/to/jdk11',
      'Update android/gradle.properties',
    ],
  },

  assetNotFound: {
    symptoms: 'Build succeeds but app crashes at runtime',
    solutions: [
      'Verify all fonts in android/app/src/main/assets/fonts/',
      'Verify images in src/assets/',
      'Run: find android/app/src/main -name "*.png"',
    ],
  },

  oom_errors: {
    symptoms: 'Out of Memory error during build',
    solutions: [
      'Increase gradle heap: export GRADLE_OPTS="-Xmx2048m"',
      'Disable parallel builds: org.gradle.parallel=false in gradle.properties',
    ],
  },

  apkTooLarge: {
    symptoms: 'APK size > 100 MB',
    solutions: [
      'Enable minifyEnabled: true in build.gradle',
      'Enable shrinkResources: true',
      'Remove unnecessary dependencies from package.json',
      'Use app bundle (AAB) instead of APK',
    ],
  },
};

// ============================================================================
// POST-DEPLOYMENT MONITORING
// ============================================================================

export const POST_DEPLOYMENT_MONITORING = {
  crashReporting: {
    platform: 'Firebase Crashlytics',
    setup: 'Configure in google-services.json',
    monitor: 'Check daily for crashes',
    threshold: 'Alert if > 5% crash-free sessions',
  },

  analytics: {
    platform: 'Google Analytics',
    metrics: [
      'Daily Active Users (DAU)',
      'Monthly Active Users (MAU)',
      'Session Duration',
      'Screen Views',
      'Feature Usage',
    ],
    targets: {
      crashFreeRate: '> 95%',
      avgSessionDuration: '> 2 minutes',
      dayOneRetention: '> 40%',
    },
  },

  userFeedback: {
    playStore: 'Monitor star ratings and reviews',
    inAppFeedback: 'Check user-submitted feedback',
    responsetime: '< 24 hours for critical issues',
  },

  performanceMonitoring: {
    startup: 'Target < 2 seconds cold start',
    memory: 'Monitor for memory leaks',
    battery: 'Check battery drain impact',
    network: 'Monitor API response times',
  },
};

export const BUILD_GUIDE_COMPLETE = true;
