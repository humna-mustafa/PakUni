/**
 * Card Capture Service
 * 
 * Captures React Native views as PNG images for sharing on social media
 * - WhatsApp Stories & Status
 * - Instagram Stories & Posts
 * - Facebook Stories
 * - General social media sharing
 * 
 * Uses react-native-view-shot for high-quality image capture
 * Uses react-native-share for proper image sharing with social apps
 */

import {RefObject} from 'react';
import {View, Platform, Alert, PermissionsAndroid} from 'react-native';
import {captureRef} from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {logger} from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CaptureResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export interface ShareCardResult {
  success: boolean;
  shared: boolean;
  error?: string;
}

export interface CaptureOptions {
  format?: 'png' | 'jpg' | 'webm';
  quality?: number;
  width?: number;
  height?: number;
  result?: 'tmpfile' | 'base64' | 'data-uri';
}

// Card dimensions optimized for social media
export const CARD_DIMENSIONS = {
  // Instagram Story / WhatsApp Status (9:16)
  story: {width: 1080, height: 1920},
  // Instagram Post (1:1)
  square: {width: 1080, height: 1080},
  // Instagram Post (4:5) - Best for feed
  portrait: {width: 1080, height: 1350},
  // Twitter/X Card (16:9)
  landscape: {width: 1200, height: 675},
  // Default for achievement cards
  achievement: {width: 1080, height: 1350},
};

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * Request storage permission on Android for saving images
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  
  try {
    // Android 13+ uses different permission model
    const sdkVersion = Platform.Version;
    if (typeof sdkVersion === 'number' && sdkVersion >= 33) {
      // On Android 13+, we don't need storage permission for app-specific files
      return true;
    }
    
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'PakUni needs storage access to save and share achievement cards.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    logger.warn('Storage permission error', err, 'CardCapture');
    return false;
  }
};

// ============================================================================
// CAPTURE FUNCTIONS
// ============================================================================

/**
 * Capture a React Native view as an image
 */
export const captureCard = async (
  viewRef: RefObject<View | null>,
  options?: CaptureOptions,
): Promise<CaptureResult> => {
  if (!viewRef || !viewRef.current) {
    return {success: false, error: 'Card view not ready. Please try again.'};
  }

  try {
    const uri = await captureRef(viewRef, {
      format: options?.format || 'png',
      quality: options?.quality || 1,
      result: options?.result || 'tmpfile',
    });

    if (!uri) {
      return {success: false, error: 'Failed to capture card image'};
    }

    return {success: true, uri};
  } catch (error) {
    logger.error('Error capturing card', error, 'CardCapture');
    const errorMessage = error instanceof Error ? error.message : 'Failed to capture card';
    // Handle common react-native-view-shot errors
    if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
      return {success: false, error: 'Card view not accessible. Try scrolling the card into view.'};
    }
    return {success: false, error: errorMessage};
  }
};

/**
 * Capture and save card to device storage
 */
export const captureAndSaveCard = async (
  viewRef: RefObject<View | null>,
  fileName?: string,
): Promise<CaptureResult> => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Please grant storage permission to save cards.');
    return {success: false, error: 'Storage permission denied'};
  }

  const captureResult = await captureCard(viewRef);
  if (!captureResult.success || !captureResult.uri) {
    return captureResult;
  }

  try {
    const name = fileName || `pakuni_achievement_${Date.now()}.png`;
    
    // On Android, save to Pictures folder for gallery visibility
    let destPath: string;
    if (Platform.OS === 'android') {
      // Try Pictures directory first, then Download
      const picturesDir = `${RNFS.ExternalStorageDirectoryPath}/Pictures/PakUni`;
      const downloadDir = RNFS.DownloadDirectoryPath;
      
      try {
        // Create PakUni folder in Pictures if it doesn't exist
        const picturesDirExists = await RNFS.exists(picturesDir);
        if (!picturesDirExists) {
          await RNFS.mkdir(picturesDir);
        }
        destPath = `${picturesDir}/${name}`;
      } catch {
        // Fallback to Downloads
        destPath = `${downloadDir}/${name}`;
      }
    } else {
      destPath = `${RNFS.DocumentDirectoryPath}/${name}`;
    }

    await RNFS.copyFile(captureResult.uri, destPath);
    
    // On Android, scan the file so it appears in gallery
    if (Platform.OS === 'android') {
      try {
        await RNFS.scanFile(destPath);
      } catch {
        // Ignore scan errors
      }
    }

    return {success: true, uri: destPath};
  } catch (error) {
    logger.error('Error saving card', error, 'CardCapture');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save card',
    };
  }
};

/**
 * Capture and share card directly with image
 */
export const captureAndShareCard = async (
  viewRef: RefObject<View | null>,
  shareTitle?: string,
  shareMessage?: string,
): Promise<ShareCardResult> => {
  // Validate viewRef before capture
  if (!viewRef || !viewRef.current) {
    logger.warn('Share attempted with null view reference', undefined, 'CardCapture');
    return {
      success: false,
      shared: false,
      error: 'Card view not ready. Please wait and try again.',
    };
  }

  const captureResult = await captureCard(viewRef);
  
  if (!captureResult.success || !captureResult.uri) {
    return {
      success: false,
      shared: false,
      error: captureResult.error || 'Failed to capture card',
    };
  }

  // Validate URI exists and is a valid string
  const uri = captureResult.uri;
  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    logger.error('Invalid URI returned from capture', {uri}, 'CardCapture');
    return {
      success: false,
      shared: false,
      error: 'Failed to create shareable image. Please try again.',
    };
  }

  try {
    // Verify file exists before reading
    const fileExists = await RNFS.exists(uri);
    if (!fileExists) {
      logger.error('Captured file does not exist', {uri}, 'CardCapture');
      return {
        success: false,
        shared: false,
        error: 'Card image was not saved properly. Please try again.',
      };
    }

    // Read the image file and convert to base64 for sharing
    const base64Image = await RNFS.readFile(uri, 'base64');
    
    // Validate base64 content
    if (!base64Image || base64Image.trim() === '') {
      logger.error('Empty base64 image from file', {uri}, 'CardCapture');
      return {
        success: false,
        shared: false,
        error: 'Failed to process card image. Please try again.',
      };
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;

    // Use react-native-share for proper image sharing
    const shareOptions = {
      title: shareTitle || 'PakUni Achievement',
      message: shareMessage || '',
      url: imageUrl,
      type: 'image/png',
      failOnCancel: false,
      showAppsToView: true,
    };

    const result = await Share.open(shareOptions);
    
    // Clean up temp file
    try {
      await RNFS.unlink(uri);
    } catch {
      // Ignore cleanup errors
    }

    return {
      success: true,
      shared: !result.dismissedAction,
    };
  } catch (error: any) {
    // User cancelled or error occurred
    if (error?.message?.includes('User did not share') || 
        error?.message?.includes('cancelled') ||
        error?.dismissedAction) {
      // Clean up temp file on cancel too
      try {
        await RNFS.unlink(uri);
      } catch {
        // Ignore
      }
      return {
        success: true,
        shared: false,
      };
    }
    
    // Handle null URI error specifically
    if (error?.message?.includes('getScheme') || 
        error?.message?.includes('null object reference') ||
        error?.message?.includes('NullPointerException')) {
      logger.error('Null URI error during share', error, 'CardCapture');
      return {
        success: false,
        shared: false,
        error: 'Unable to share card. Please save it first, then share from gallery.',
      };
    }
    
    logger.error('Error sharing card', error, 'CardCapture');
    return {
      success: false,
      shared: false,
      error: error instanceof Error ? error.message : 'Failed to share card',
    };
  }
};

// ============================================================================
// CARD-SPECIFIC SHARE FUNCTIONS
// ============================================================================

/**
 * Share merit success card with image
 */
export const shareMeritCardWithImage = async (
  viewRef: RefObject<View | null>,
  universityName: string,
  aggregate: number,
): Promise<ShareCardResult> => {
  const message = `🎯 My merit score: ${aggregate.toFixed(2)}%\n\n🏛️ Checking my chances at ${universityName}\n\nCalculated using PakUni App! 📱\n\n#PakUni #MeritCalculator #Admission`;
  
  return captureAndShareCard(viewRef, `Merit Score - ${universityName}`, message);
};

/**
 * Share admission celebration card with image
 */
export const shareAdmissionCardWithImage = async (
  viewRef: RefObject<View | null>,
  universityName: string,
  programName?: string,
): Promise<ShareCardResult> => {
  const program = programName ? `\n📚 ${programName}` : '';
  const message = `🎉 ADMISSION SECURED! 🎓\n\n🏛️ ${universityName}${program}\n\nAlhamdulillah! Dreams coming true! ✨\n\n#PakUni #Admission #Success`;
  
  return captureAndShareCard(viewRef, `I got into ${universityName}!`, message);
};

/**
 * Share entry test completion card with image
 */
export const shareTestCardWithImage = async (
  viewRef: RefObject<View | null>,
  testName: string,
  score?: string,
): Promise<ShareCardResult> => {
  const scoreText = score ? `\n📊 Score: ${score}` : '';
  const message = `✅ ${testName} COMPLETED!${scoreText}\n\nOne step closer to my dream university! 💪\n\n#PakUni #EntryTest #AdmissionJourney`;
  
  return captureAndShareCard(viewRef, `${testName} Done!`, message);
};

/**
 * Share scholarship card with image
 */
export const shareScholarshipCardWithImage = async (
  viewRef: RefObject<View | null>,
  scholarshipName: string,
  coverage?: string,
  universityName?: string,
): Promise<ShareCardResult> => {
  const coverageText = coverage ? `\n💰 Coverage: ${coverage}` : '';
  const uniText = universityName ? `\n🏛️ ${universityName}` : '';
  const message = `🏆 SCHOLARSHIP AWARDED!\n\n📝 ${scholarshipName}${coverageText}${uniText}\n\nAlhamdulillah! Education is now more accessible! ✨\n\n#PakUni #Scholarship #Success`;
  
  return captureAndShareCard(viewRef, 'Scholarship Received!', message);
};

/**
 * Share merit list celebration card with image
 */
export const shareMeritListCardWithImage = async (
  viewRef: RefObject<View | null>,
  universityName: string,
  meritListNumber?: number,
): Promise<ShareCardResult> => {
  const listText = meritListNumber ? `Merit List ${meritListNumber}` : 'the merit list';
  const message = `📜 MERIT LISTED! 🎯\n\nI made it to ${listText} at ${universityName}!\n\nAlhamdulillah! Hard work pays off! ✨\n\n#PakUni #MeritListed #Success`;
  
  return captureAndShareCard(viewRef, `Merit Listed at ${universityName}!`, message);
};

/**
 * Share achievement badge card with image
 */
export const shareAchievementBadgeWithImage = async (
  viewRef: RefObject<View | null>,
  badgeName: string,
  badgeDescription?: string,
): Promise<ShareCardResult> => {
  const descText = badgeDescription ? `\n${badgeDescription}` : '';
  const message = `🏅 BADGE UNLOCKED!\n\n${badgeName}${descText}\n\nUnlocked on PakUni App! 🎯\n\n#PakUni #Achievement #Badge`;
  
  return captureAndShareCard(viewRef, `Badge: ${badgeName}`, message);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get optimal card dimensions for a specific platform
 */
export const getOptimalDimensions = (
  platform: 'instagram_story' | 'instagram_post' | 'whatsapp' | 'twitter' | 'default',
): {width: number; height: number} => {
  switch (platform) {
    case 'instagram_story':
    case 'whatsapp':
      return CARD_DIMENSIONS.story;
    case 'instagram_post':
      return CARD_DIMENSIONS.portrait;
    case 'twitter':
      return CARD_DIMENSIONS.landscape;
    default:
      return CARD_DIMENSIONS.achievement;
  }
};

/**
 * Clean up temporary captured images
 */
export const cleanupTempImages = async (): Promise<void> => {
  try {
    const tempDir = RNFS.CachesDirectoryPath;
    const files = await RNFS.readDir(tempDir);
    
    const imageFiles = files.filter(
      file => file.name.startsWith('pakuni_') && file.name.endsWith('.png'),
    );
    
    for (const file of imageFiles) {
      await RNFS.unlink(file.path);
    }
  } catch (error) {
    logger.warn('Error cleaning up temp images', error, 'CardCapture');
  }
};

/**
 * Check if sharing images is supported
 */
export const isImageSharingSupported = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

export default {
  // Core functions
  captureCard,
  captureAndSaveCard,
  captureAndShareCard,
  requestStoragePermission,
  
  // Card-specific shares
  shareMeritCardWithImage,
  shareAdmissionCardWithImage,
  shareTestCardWithImage,
  shareScholarshipCardWithImage,
  shareMeritListCardWithImage,
  shareAchievementBadgeWithImage,
  
  // Utilities
  getOptimalDimensions,
  cleanupTempImages,
  isImageSharingSupported,
  
  // Constants
  CARD_DIMENSIONS,
};
