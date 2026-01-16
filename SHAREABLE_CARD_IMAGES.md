# 📸 Shareable Card Image Customization

## Overview

This feature allows users to optionally personalize their shareable achievement badge cards with custom images. Users can add personal photos, campus images, and university logos to make their cards more unique and memorable.

## Features

### 🖼️ Available Image Slots

1. **Personal Photo** (Circle format)
   - Profile picture or graduation photo
   - Displays in the top-right corner of the card
   - Optional student name shown below the photo

2. **Campus Image** (Landscape format)
   - University building or campus view
   - Used as a subtle background with gradient overlay
   - Maintains card readability while adding visual depth

3. **University Logo** (Square format)
   - Official university emblem or badge
   - Appears next to the card badge/header
   - Professional touch for institutional recognition

4. **Custom Image** (Any format)
   - Any additional image the user wants to add
   - Flexible placement based on card design

### ✨ Key Characteristics

- **100% Optional**: Cards look great with or without custom images
- **Non-destructive**: Base card design remains intact
- **Premium Quality**: Images are optimized for social media sharing
- **Easy to Use**: Bottom sheet interface with tap-to-add functionality

## Usage

### Enabling Image Customization

All four Ultra Premium Cards support optional image customization:

```tsx
import {
  UltraMeritCard,
  UltraAdmissionCard,
  UltraTestCard,
  UltraScholarshipCard,
} from './components';

// Enable customization by passing showCustomizer={true}
<UltraMeritCard
  achievement={myAchievement}
  showCustomizer={true}  // Shows "Add Personal Images" button
/>
```

### Pre-populating Images

You can also pass pre-selected images:

```tsx
<UltraMeritCard
  achievement={myAchievement}
  showCustomizer={true}
  customImages={{
    personalPhoto: 'file:///path/to/photo.jpg',
    campusImage: 'file:///path/to/campus.jpg',
    universityLogo: 'file:///path/to/logo.png',
    studentName: 'Ahmed Khan',
  }}
/>
```

### Using the Standalone Customizer

```tsx
import { CardImageCustomizer, CardCustomImages } from './components';

const [images, setImages] = useState<CardCustomImages>({});
const [showCustomizer, setShowCustomizer] = useState(false);

<CardImageCustomizer
  visible={showCustomizer}
  onClose={() => setShowCustomizer(false)}
  onApply={setImages}
  currentImages={images}
  cardType="merit"  // 'merit' | 'admission' | 'test' | 'scholarship'
  primaryColor="#FFD700"
/>
```

### Compact Inline Version

For inline image selection without a modal:

```tsx
import { CompactImageCustomizer } from './components';

<CompactImageCustomizer
  images={customImages}
  onImagesChange={setCustomImages}
  primaryColor="#FFD700"
/>
```

## Card Types & Theme Colors

| Card Type | Primary Color | Gradient Theme |
|-----------|---------------|----------------|
| Merit | `#FFD700` (Gold) | Dark Navy + Gold |
| Admission | `#00B894` (Green) | Emerald Success |
| Test | `#764ba2` (Purple) | Purple Gradient |
| Scholarship | `#F5576C` (Pink) | Pink Diamond |

## Image Specifications

### Recommended Dimensions

| Slot | Format | Max Size | Aspect Ratio |
|------|--------|----------|--------------|
| Personal Photo | Square | 800×800px | 1:1 |
| Campus Image | Landscape | 1600×900px | 16:9 |
| University Logo | Square | 400×400px | 1:1 |
| Custom Image | Any | 1200×1200px | Any |

### Quality Settings

- Personal Photo: 85% JPEG quality
- Campus Image: 85% JPEG quality
- University Logo: 95% PNG quality (preserves transparency)

## Visual Integration

### Personal Photo Display
```
┌──────────────────────────────────┐
│  [Badge]                    ◯──┐ │
│                             │👤│ │
│                             │  │ │
│                             └──┘ │
│        MERIT SUCCESS!       Name │
│                                  │
└──────────────────────────────────┘
```

### Campus Image Background
```
┌──────────────────────────────────┐
│ ░░░░░░░ Campus Image ░░░░░░░░░░ │
│ ░░░ with gradient overlay ░░░░░ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓    Card content visible   ▓▓ │
│ ▓    through overlay        ▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└──────────────────────────────────┘
```

## Permissions

The image picker handles permissions automatically:

### Android
- **Android 13+**: `READ_MEDIA_IMAGES`
- **Android 12 and below**: `READ_EXTERNAL_STORAGE`
- **Camera**: `CAMERA` (for taking new photos)

### iOS
- Photo Library access is handled by React Native Image Picker

## Error Handling

The service gracefully handles:
- Permission denial (prompts to open Settings)
- User cancellation
- Image picker errors
- Invalid image selection

## Files Structure

```
src/
├── components/
│   ├── CardImageCustomizer.tsx      # Main customizer modal
│   └── UltraPremiumCards.tsx        # Cards with image support
├── services/
│   └── imagePickerService.ts        # Image picking utilities
```

## Best Practices

1. **Keep it optional**: Always allow users to skip image customization
2. **Use quality images**: Encourage users to use clear, well-lit photos
3. **Test all card types**: Ensure images look good across all themes
4. **Consider file sizes**: Large images may slow down sharing

## Changelog

### Version 1.0.0
- Initial implementation
- Support for all four Ultra Premium Cards
- Personal photo with name display
- Campus image as background
- University logo integration
- Bottom sheet customizer UI
- Compact inline customizer option
