/**
 * Image Picker Service
 * 
 * Provides image selection functionality for card customization
 * Supports gallery selection and camera capture
 * 
 * @version 1.0.0
 */

import {Alert, Platform, PermissionsAndroid, Linking} from 'react-native';
import {launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, CameraOptions, ImageLibraryOptions} from 'react-native-image-picker';

// ============================================================================
// TYPES
// ============================================================================

export interface ImagePickerResult {
  success: boolean;
  uri?: string;
  fileName?: string;
  type?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  error?: string;
}

export type ImageSourceType = 'gallery' | 'camera';

export interface PickerOptions {
  mediaType?: MediaType;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  includeBase64?: boolean;
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: ImageLibraryOptions & CameraOptions = {
  mediaType: 'photo',
  quality: 0.9,
  maxWidth: 1200,
  maxHeight: 1200,
  includeBase64: false,
  presentationStyle: 'fullScreen',
};

// ============================================================================
// PERMISSION HANDLERS
// ============================================================================

/**
 * Request camera permission on Android
 */
const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'PakUni Camera Permission',
        message: 'PakUni needs access to your camera to take photos for your achievement cards.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

/**
 * Request gallery permission on Android 13+
 */
const requestGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Android 13+ uses READ_MEDIA_IMAGES
  if (Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'PakUni Gallery Permission',
          message: 'PakUni needs access to your photos to personalize your achievement cards.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Gallery permission error:', err);
      return false;
    }
  }

  // Android 12 and below
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'PakUni Storage Permission',
        message: 'PakUni needs access to your photos to personalize your achievement cards.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Storage permission error:', err);
    return false;
  }
};

// ============================================================================
// IMAGE PICKER FUNCTIONS
// ============================================================================

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (
  options?: PickerOptions,
): Promise<ImagePickerResult> => {
  const hasPermission = await requestGalleryPermission();
  
  if (!hasPermission) {
    Alert.alert(
      'Permission Required',
      'Please allow access to your photos in Settings to add images to your cards.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
    return {success: false, error: 'Permission denied'};
  }

  return new Promise((resolve) => {
    const pickerOptions: ImageLibraryOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      selectionLimit: 1,
    };

    launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        resolve({success: false, error: 'User cancelled'});
        return;
      }

      if (response.errorCode) {
        const errorMessage = response.errorMessage || 'Failed to pick image';
        console.error('Image picker error:', response.errorCode, errorMessage);
        resolve({success: false, error: errorMessage});
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        resolve({
          success: true,
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        });
      } else {
        resolve({success: false, error: 'No image selected'});
      }
    });
  });
};

/**
 * Capture image from camera
 */
export const captureImageFromCamera = async (
  options?: PickerOptions,
): Promise<ImagePickerResult> => {
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    Alert.alert(
      'Camera Permission Required',
      'Please allow camera access in Settings to take photos for your cards.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: () => Linking.openSettings()},
      ],
    );
    return {success: false, error: 'Permission denied'};
  }

  return new Promise((resolve) => {
    const cameraOptions: CameraOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      saveToPhotos: false,
    };

    launchCamera(cameraOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        resolve({success: false, error: 'User cancelled'});
        return;
      }

      if (response.errorCode) {
        const errorMessage = response.errorMessage || 'Failed to capture image';
        console.error('Camera error:', response.errorCode, errorMessage);
        resolve({success: false, error: errorMessage});
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        resolve({
          success: true,
          uri: asset.uri,
          fileName: asset.fileName,
          type: asset.type,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        });
      } else {
        resolve({success: false, error: 'No image captured'});
      }
    });
  });
};

/**
 * Show picker dialog for selecting image source
 */
export const pickImage = async (
  options?: PickerOptions,
): Promise<ImagePickerResult> => {
  return new Promise((resolve) => {
    Alert.alert(
      '📸 Add Image',
      'Choose how you want to add an image to your card',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve({success: false, error: 'User cancelled'}),
        },
        {
          text: '📷 Camera',
          onPress: async () => {
            const result = await captureImageFromCamera(options);
            resolve(result);
          },
        },
        {
          text: '🖼️ Gallery',
          onPress: async () => {
            const result = await pickImageFromGallery(options);
            resolve(result);
          },
        },
      ],
      {cancelable: true, onDismiss: () => resolve({success: false, error: 'User cancelled'})},
    );
  });
};

/**
 * Pick square cropped image (for profile photos)
 */
export const pickSquareImage = async (): Promise<ImagePickerResult> => {
  return pickImageFromGallery({
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
  });
};

/**
 * Pick landscape image (for campus photos)
 */
export const pickLandscapeImage = async (): Promise<ImagePickerResult> => {
  return pickImageFromGallery({
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.85,
  });
};

/**
 * Pick logo/icon image (smaller, higher quality)
 */
export const pickLogoImage = async (): Promise<ImagePickerResult> => {
  return pickImageFromGallery({
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.95,
  });
};

export default {
  pickImage,
  pickImageFromGallery,
  captureImageFromCamera,
  pickSquareImage,
  pickLandscapeImage,
  pickLogoImage,
};
