# Pixel Perfect Visual Design Guide

## Overview

This guide documents the pixel-perfect design system implemented in PakUni to eliminate visual artifacts and ensure crisp, professional rendering across all devices.

---

## Core Principles

### 1. Use Even Numbers
All dimensions (widths, heights, padding, margins) should use **even numbers** to prevent sub-pixel rendering:

```tsx
// ✅ Good - even values
{ width: 48, height: 48, padding: 16, borderRadius: 12 }

// ❌ Bad - odd values can cause blur
{ width: 47, height: 45, padding: 15, borderRadius: 11 }
```

### 2. Pixel-Aligned Values
Use the `roundToPixel()` utility for dynamic calculations:

```tsx
import { roundToPixel } from '../constants/pixel-perfect';

const dynamicWidth = roundToPixel(SCREEN_WIDTH * 0.45);
```

### 3. Proper Border Radius
Border radius should never exceed half of the smallest dimension:

```tsx
// ✅ Good - radius ≤ height/2
{ width: 100, height: 48, borderRadius: 12 }

// ❌ Bad - radius > height/2 causes artifacts
{ width: 100, height: 48, borderRadius: 30 }
```

---

## Shadow System (Platform-Optimized)

### iOS Shadows
Use precise shadow values with low opacity for smooth edges:

```tsx
{
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,  // Keep low for softness
  shadowRadius: 4,       // Even number
}
```

### Android Shadows
Use elevation for consistent material shadows:

```tsx
{
  elevation: 2,
  shadowColor: '#000000',  // Required for colored shadows
}
```

### Pre-built Shadow Levels

| Level | iOS Shadow Radius | Android Elevation | Use Case |
|-------|------------------|-------------------|----------|
| `xs`  | 2                | 1                 | Subtle lift |
| `sm`  | 4                | 2                 | Cards |
| `md`  | 8                | 4                 | Elevated cards |
| `lg`  | 16               | 8                 | Modals |
| `xl`  | 24               | 12                | FABs |

---

## Card Styles

### Outlined Card (Recommended for Lists)
```tsx
<PPOutlinedCard>
  <Text>Clean border, no shadow</Text>
</PPOutlinedCard>
```

### Elevated Card
```tsx
<PPElevatedCard>
  <Text>Subtle shadow, premium feel</Text>
</PPElevatedCard>
```

### Glass Card (iOS Optimized)
```tsx
<PPGlassCard>
  <Text>Glassmorphism effect</Text>
</PPGlassCard>
```

---

## Typography Scale

Use the pre-defined scale for consistent text rendering:

```tsx
import { PP_TYPOGRAPHY } from '../constants/pixel-perfect';

// Text sizes (all even or carefully chosen for readability)
{
  xxs: 10,   // Micro text
  xs: 11,    // Captions
  sm: 13,    // Secondary text
  base: 15,  // Body text
  md: 17,    // Emphasized body
  lg: 20,    // Section headers
  xl: 24,    // Page titles
  xxl: 30,   // Feature headlines
  display: 36, // Hero text
}
```

---

## Icon Containers

Always use even-sized containers for crisp icon rendering:

```tsx
import { PP_ICON_CONTAINERS } from '../constants/pixel-perfect';

// Available sizes:
// xs: 24x24, sm: 32x32, md: 40x40, lg: 48x48, xl: 56x56, xxl: 64x64

<PPIconContainer size="md" backgroundColor={colors.primaryLight}>
  <Icon name="star" size={20} />
</PPIconContainer>
```

---

## Button Touch Targets

Minimum touch target is **44x44** pixels (Apple HIG recommendation):

```tsx
import { PP_BUTTONS } from '../constants/pixel-perfect';

// Button heights:
// xs: 32, sm: 36, md: 44 (minimum), lg: 48, xl: 56
```

---

## Animation Best Practices

### Press Animations
Use spring animations for natural feel at 60fps:

```tsx
import { PP_MOTION } from '../constants/pixel-perfect';

Animated.spring(scaleValue, {
  toValue: 0.97,
  useNativeDriver: true,  // Always use native driver
  ...PP_MOTION.spring.snappy,
}).start();
```

### Spring Configurations

| Type | Use Case |
|------|----------|
| `snappy` | Buttons, toggles, micro-interactions |
| `default` | Card transitions, UI state changes |
| `gentle` | Page transitions, large movements |
| `bouncy` | Playful interactions, celebrations |

---

## Spacing Grid

All spacing follows a 4px base grid:

```tsx
import { PP_SPACING } from '../constants/pixel-perfect';

// Numeric scale (4px increments):
// 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64

// Semantic aliases:
// xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
```

---

## Avoiding Common Artifacts

### 1. Border Rendering Issues

**Problem**: Borders appear blurry or have anti-aliasing artifacts.

**Solution**: Use `HAIRLINE_WIDTH` for 1px borders:
```tsx
import { HAIRLINE_WIDTH } from '../constants/pixel-perfect';

{ borderWidth: HAIRLINE_WIDTH }  // Uses StyleSheet.hairlineWidth
```

### 2. Image Artifacts

**Problem**: Images appear pixelated or have jagged edges.

**Solution**: Always use `resizeMode` and even dimensions:
```tsx
<Image
  source={{ uri: imageUrl }}
  style={{ width: 48, height: 48, borderRadius: 24 }}
  resizeMode="cover"
/>
```

### 3. Text Rendering

**Problem**: Text appears blurry at certain sizes.

**Solution**: Use font sizes from the typography scale:
```tsx
// Prefer these sizes: 10, 11, 13, 15, 17, 20, 24, 30, 36
```

### 4. Shadow Clipping

**Problem**: Shadows get cut off on Android.

**Solution**: Add padding to parent container:
```tsx
<View style={{ padding: 8 }}>
  <PPElevatedCard>...</PPElevatedCard>
</View>
```

---

## Component Usage Examples

### Feature Card with Accent
```tsx
<PPFeatureCard
  accentColor={colors.primary}
  accentPosition="left"
  onPress={handlePress}
>
  <PPSectionHeader title="Featured" subtitle="Top picks" />
  <Text>Content here</Text>
</PPFeatureCard>
```

### Stats Display
```tsx
<PPStatsCard
  value="200+"
  label="Universities"
  valueColor={colors.primary}
  icon={<Icon name="school" size={24} />}
/>
```

### List Item Card
```tsx
{items.map((item, index) => (
  <PPListItemCard
    key={item.id}
    isLastItem={index === items.length - 1}
    onPress={() => handleSelect(item)}
  >
    <Text>{item.name}</Text>
  </PPListItemCard>
))}
```

### Badge Usage
```tsx
<PPBadge variant="success" size="tag">
  Active
</PPBadge>

<PPBadge size="count" count={5} variant="error" />

<PPBadge size="dot" variant="primary" />
```

---

## Dark Mode Considerations

The pixel-perfect components automatically adjust for dark mode:

1. **Shadows**: Increased opacity in dark mode for visibility
2. **Borders**: Added borders where shadows alone don't provide enough separation
3. **Glass effects**: Adjusted opacity and blur for dark backgrounds

---

## Performance Tips

1. **Use `overflow: 'hidden'`** on all cards to prevent rendering outside bounds
2. **Set `useNativeDriver: true`** for all animations
3. **Use `memo()`** for list item components
4. **Avoid nested shadows** - use single elevation per component
5. **Pre-calculate dynamic values** using `roundToPixel()`

---

## File Structure

```
src/
├── constants/
│   └── pixel-perfect.ts      # Design tokens & utilities
├── components/
│   ├── PixelPerfectCard.tsx  # Card components
│   ├── PixelPerfectButton.tsx # Button components
│   └── PixelPerfectUI.tsx    # Badges, avatars, surfaces
```

---

## Migration Guide

To migrate existing components to pixel-perfect:

1. Replace `Card` with `PPOutlinedCard` or `PPElevatedCard`
2. Replace `Button` with `PPButton`
3. Replace `Badge` with `PPBadge`
4. Update spacing to use `PP_SPACING`
5. Update shadows to use `PP_SHADOWS`
6. Wrap dynamic calculations with `roundToPixel()`

---

## Accessibility

All pixel-perfect components meet WCAG 2.1 AA standards:

- Minimum touch target: 44x44 pixels
- Focus indicators included
- Proper contrast ratios maintained
- Screen reader labels supported

```tsx
<PPButton
  accessibilityLabel="Submit form"
  testID="submit-button"
  onPress={handleSubmit}
>
  Submit
</PPButton>
```
